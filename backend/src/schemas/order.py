from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from src.schemas.orderItem import OrderItemRead


class OrderCreate(BaseModel):
    pass


class OrderRead(BaseModel):
    id: int
    user_id: int
    total_price: Decimal
    status: str

    items: list[OrderItemRead] = []

    model_config = ConfigDict(from_attributes=True)
