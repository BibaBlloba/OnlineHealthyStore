from sqlalchemy import insert
from sqlalchemy.orm import selectinload

from src.models.cart import Cart
from src.models.cartItem import CartItem
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import CartsDataMapper


class CartRepository(BaseRepository):
    model = Cart
    mapper = CartsDataMapper
    load_options = (selectinload(Cart.items).selectinload(CartItem.product),)

    async def add(self, data):
        values = data.model_dump(exclude_unset=True, exclude={'id'})
        stmt = insert(self.model).values(**values).returning(self.model.id)
        result = await self.session.execute(stmt)
        cart_id = result.scalar_one()
        return await self.get_one(id=cart_id)
