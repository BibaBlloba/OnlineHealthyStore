from pydantic import BaseModel, ConfigDict

from src.schemas.cartItem import CartItemRead


class CartRead(BaseModel):
    id: int
    user_id: int
    items: list[CartItemRead] = []

    model_config = ConfigDict(from_attributes=True)
