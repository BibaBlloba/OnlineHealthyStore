from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PaymentCreate(BaseModel):
    order_id: int


class PaymentRead(BaseModel):
    id: int
    order_id: int
    amount: Decimal
    status: str
    transaction_id: str | None = None

    model_config = ConfigDict(from_attributes=True)
