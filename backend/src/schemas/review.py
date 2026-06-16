from pydantic import BaseModel, ConfigDict


class ReviewBase(BaseModel):
    product_id: int
    rating: int
    comment: str


class ReviewCreate(ReviewBase):
    pass


class ReviewRead(ReviewBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
