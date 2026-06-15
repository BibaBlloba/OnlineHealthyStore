from src.models.cart import Cart
from src.repos.base import BaseRepository
from src.repos.mappers import CartDataMapper


class CartRepository(BaseRepository):
    model = Cart
    mapper = CartDataMapper
