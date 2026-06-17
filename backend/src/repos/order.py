from sqlalchemy import insert
from sqlalchemy.orm import selectinload

from src.models.order import Order
from src.models.orderItem import OrderItem
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import OrdersDataMapper


class OrdersRepository(BaseRepository):
    model = Order
    mapper = OrdersDataMapper
    load_options = (
        selectinload(Order.items).selectinload(OrderItem.product),
        selectinload(Order.payment),
    )

    async def add(self, data):
        values = data.model_dump(exclude_unset=True, exclude={'id'})
        stmt = insert(self.model).values(**values).returning(self.model.id)
        result = await self.session.execute(stmt)
        order_id = result.scalar_one()
        return await self.get_one(id=order_id)
