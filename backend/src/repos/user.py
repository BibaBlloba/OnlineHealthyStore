from src.models.user import User
from src.repos.base import BaseRepository
from src.repos.mappers import UserDataMapper


class UsersRepository(BaseRepository):
    model = User
    mapper = UserDataMapper
