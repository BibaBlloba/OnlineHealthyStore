from src.models.cart import Cart
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import CartsDataMapper


class CartRepository(BaseRepository):
    model = Cart
    mapper = CartsDataMapper
