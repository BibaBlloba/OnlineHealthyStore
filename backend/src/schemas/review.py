from pydantic import BaseModel, ConfigDict


class ReviewBase(BaseModel):
    rating: int
    comment: str
    product_id: int | None = None
    user_id: int | None = None


class ReviewCreate(ReviewBase):
    pass


class ReviewRead(ReviewBase):
    id: int
    user_id: int
    product_id: int

    model_config = ConfigDict(from_attributes=True)
