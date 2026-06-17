from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from src.schemas.product import ProductRead


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: Decimal


class OrderItemCreate(OrderItemBase):
    order_id: int | None = None


class OrderItemRead(OrderItemBase):
    id: int
    order_id: int
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)
