from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from src.schemas.productImage import ProductImageRead


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    stock_quantity: int
    category_id: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    stock_quantity: int | None = None


class ProductRead(ProductBase):
    id: int
    images: list[ProductImageRead] = []

    model_config = ConfigDict(from_attributes=True)


class ProductSearchParams(BaseModel):
    category_id: Optional[int] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    name: Optional[str] = None
    order_by: Optional[str] = None
    order_dir: str = 'asc'

    page: int = 1
    per_page: int = 10
