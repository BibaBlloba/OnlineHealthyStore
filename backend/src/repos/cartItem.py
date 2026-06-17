from sqlalchemy.orm import selectinload

from src.models.cartItem import CartItem
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import CartItemsDataMapper


class CartItemsRepository(BaseRepository):
    model = CartItem
    mapper = CartItemsDataMapper
    load_options = (selectinload(CartItem.product),)
