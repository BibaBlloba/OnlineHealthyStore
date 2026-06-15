from src.models.role import Role
from src.repos.base import BaseRepository
from src.repos.mappers import RoleDataMapper


class RolesRepository(BaseRepository):
    model = Role
    mapper = RoleDataMapper
