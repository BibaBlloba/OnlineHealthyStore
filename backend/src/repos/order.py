from src.models.order import Order
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import OrdersDataMapper


class OrdersRepository(BaseRepository):
    model = Order
    mapper = OrdersDataMapper
