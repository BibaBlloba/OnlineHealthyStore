from src.models.product import Product
from src.repos.base import BaseRepository
from src.repos.mappers import ProductDataMapper


class ProductsRepository(BaseRepository):
    model = Product
    mapper = ProductDataMapper
