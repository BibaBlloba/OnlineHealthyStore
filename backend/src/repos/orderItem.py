from src.models.order_item import OrderItem
from src.repos.base import BaseRepository
from src.repos.mappers import OrderItemDataMapper


class OrderItemsRepository(BaseRepository):
    model = OrderItem
    mapper = OrderItemDataMapper
