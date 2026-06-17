from pydantic import BaseModel, ConfigDict

from src.schemas.product import ProductRead


class CartItemBase(BaseModel):
    product_id: int
    quantity: int


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemCreate(CartItemBase):
    cart_id: int | None = None


class CartItemRead(CartItemBase):
    id: int
    cart_id: int
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)
