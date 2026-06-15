from src.models.category import Category
from src.repos.base import BaseRepository
from src.repos.mappers import CategoryDataMapper


class CategoriesRepository(BaseRepository):
    model = Category
    mapper = CategoryDataMapper
