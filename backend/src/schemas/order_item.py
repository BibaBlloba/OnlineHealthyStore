from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: Decimal


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemRead(OrderItemBase):
    id: int
    order_id: int

    model_config = ConfigDict(from_attributes=True)
