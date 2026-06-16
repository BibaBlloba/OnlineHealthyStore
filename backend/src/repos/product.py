from src.models.product import Product
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import ProductsDataMapper


class ProductsRepository(BaseRepository):
    model = Product
    mapper = ProductsDataMapper
