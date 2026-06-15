from src.models.order import Order
from src.repos.base import BaseRepository
from src.repos.mappers import OrderDataMapper


class OrdersRepository(BaseRepository):
    model = Order
    mapper = OrderDataMapper
