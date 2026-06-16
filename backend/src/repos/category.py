from src.repos.mappers.mappers import CategoriesDataMapper
from src.models.category import Category
from src.repos.base import BaseRepository


class CategoriesRepository(BaseRepository):
    model = Category
    mapper = CategoriesDataMapper
