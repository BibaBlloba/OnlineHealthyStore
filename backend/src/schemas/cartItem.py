from pydantic import BaseModel, ConfigDict


class CartItemBase(BaseModel):
    product_id: int
    quantity: int


class CartItemCreate(CartItemBase):
    pass


class CartItemRead(CartItemBase):
    id: int
    cart_id: int

    model_config = ConfigDict(from_attributes=True)
