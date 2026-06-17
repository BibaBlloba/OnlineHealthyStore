from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from src.schemas.payment import PaymentRead
from src.schemas.orderItem import OrderItemRead


class OrderCreate(BaseModel):
    user_id: int
    total_price: Decimal
    status: str = 'pending'


class OrderUpdate(BaseModel):
    total_price: Decimal | None = None
    status: str | None = None


class OrderRead(BaseModel):
    id: int
    user_id: int
    total_price: Decimal
    status: str

    items: list[OrderItemRead] = []
    payment: PaymentRead | None = None

    model_config = ConfigDict(from_attributes=True)
