from src.models.cart_item import CartItem
from src.repos.base import BaseRepository
from src.repos.mappers import CartItemDataMapper


class CartItemsRepository(BaseRepository):
    model = CartItem
    mapper = CartItemDataMapper
