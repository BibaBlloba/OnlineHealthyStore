from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Query, Request
from pydantic import BaseModel

from src.database import async_session_maker
from src.services.auth import AuthService
from src.utils.db_manager import DbManager


class PaginationParams(BaseModel):
    page: Annotated[int | None, Query(default=1, ge=1)]
    per_page: Annotated[int | None, Query(default=None, ge=1, le=10)]


PaginationDap = Annotated[PaginationParams, Depends()]


def get_token(
    request: Request,
) -> str:
    token = request.cookies.get('access_token', None)
    if not token:
        raise HTTPException(status_code=401, detail='Вы не предоставили токен доступа.')
    return token


def get_current_user_id(token: str = Depends(get_token)):
    try:
        data = AuthService().decode_token(token)
    except jwt.exceptions.DecodeError:
        raise HTTPException(status_code=401, detail='Токен не действителен.')
    return data.get('user_id')


UserIdDap = Annotated[int, Depends(get_current_user_id)]


def get_current_user(
    token: str = Depends(get_token),
):
    data = AuthService().decode_token(token)

    return {
        'user_id': data['user_id'],
        'role': data['role'],
    }


CurrentUserDep = Annotated[
    dict,
    Depends(get_current_user),
]


async def get_db():
    async with DbManager(session_factory=async_session_maker) as db:
        yield db


DbDep = Annotated[DbManager, Depends(get_db)]


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        user=Depends(get_current_user),
    ):
        if user['role'] not in self.allowed_roles:
            raise HTTPException(
                status_code=403,
                detail='Недостаточно прав',
            )

        return user


AdminOnly = Depends(RoleChecker(['admin']))

CustomerOnly = Depends(RoleChecker(['customer']))
