from src.models.orderItem import OrderItem
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import OrderItemsDataMapper


class OrderItemsRepository(BaseRepository):
    model = OrderItem
    mapper = OrderItemsDataMapper
