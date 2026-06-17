from sqlalchemy.orm import selectinload

from src.models.orderItem import OrderItem
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import OrderItemsDataMapper


class OrderItemsRepository(BaseRepository):
    model = OrderItem
    mapper = OrderItemsDataMapper
    load_options = (selectinload(OrderItem.product),)
