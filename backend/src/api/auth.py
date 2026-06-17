from fastapi import APIRouter, Body, HTTPException, Query, Response

from src.api.dependencies import AdminOnly, CurrentUserDep, DbDep, UserIdDap
from src.exceptions import UserAlredyRegistered
from src.schemas.user import UserAdd, UserLogin, UserRequestAdd
from src.services.auth import AuthService

router = APIRouter(prefix='/auth', tags=['Auth'])


@router.post('/register')
async def register_user(
    db: DbDep,
    data: UserRequestAdd = Body(),
):
    if data.password == '' or data.email == '':
        raise HTTPException(401)
    password_hash = AuthService().hash_password(data.password)

    hashed_user_data = UserAdd(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=password_hash,
        role_id=2,
    )

    try:
        result = await db.users.add(hashed_user_data)
    except UserAlredyRegistered as ex:
        raise HTTPException(409, ex.detail)
    await db.commit()
    return result


@router.post('/login')
async def login_user(
    response: Response,
    db: DbDep,
    data: UserLogin = Body(
        openapi_examples={
            'user': {
                'summary': 'Regular user login',
                'value': {
                    'email': 'user@example.com',
                    'password': 'string',
                },
            },
            'admin': {
                'summary': 'Admin login',
                'value': {
                    'email': 'admin@shop.ru',
                    'password': 'admin123',
                },
            },
        }
    ),
):
    user = await db.users.get_by_email(email=data.email)
    if not user:
        raise HTTPException(
            status_code=401, detail='Пользователь с таким email не зарегестрирован.'
        )
    if not AuthService().verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Пароль неверный')

    access_token = AuthService().create_access_token(
        {
            'user_id': user.id,
            'role': user.role.name,
        }
    )

    response.set_cookie('access_token', access_token)
    return {'access_token': access_token}


@router.post('/logout')
async def logout(
    user_id: UserIdDap,
    response: Response,
):
    response.delete_cookie('access_token')
    return {'status': 'ok'}


@router.get('/me')
async def get_me(
    current_user: CurrentUserDep,
    db: DbDep,
):
    return await db.users.get_one_or_none(id=current_user['user_id'])


@router.get('/')
async def get_all_users(
    db: DbDep,
    _: dict = AdminOnly,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
):
    return await db.users.paginate(
        page=page,
        per_page=per_page,
    )


@router.delete('/{user_id}')
async def delete_user(
    user_id: int,
    db: DbDep,
    _: dict = AdminOnly,
):
    deleted = await db.users.delete(id=user_id)

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail='Пользователь не найден',
        )

    await db.commit()

    return {'status': 'deleted'}
