from pydantic import BaseModel, ConfigDict


class ProductImageBase(BaseModel):
    image_url: str
    product_id: int


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageRead(ProductImageBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
