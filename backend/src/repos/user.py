from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.models.user import User
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import UsersDataMapper


class UsersRepository(BaseRepository):
    model = User
    mapper = UsersDataMapper

    async def get_by_email(
        self,
        email: str,
    ):
        query = select(User).options(selectinload(User.role)).filter_by(email=email)

        result = await self.session.execute(query)

        return result.scalar_one_or_none()
