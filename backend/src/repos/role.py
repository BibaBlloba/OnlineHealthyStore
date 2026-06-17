from src.models.role import Role
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import RolesDataMapper


class RolesRepository(BaseRepository):
    model = Role
    mapper = RolesDataMapper
