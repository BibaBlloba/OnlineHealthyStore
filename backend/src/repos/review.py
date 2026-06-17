from sqlalchemy import func, select

from src.models.review import Review
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import ReviewsDataMapper


class ReviewsRepository(BaseRepository):
    model = Review
    mapper = ReviewsDataMapper

    async def get_by_product_paginated(
        self,
        product_id: int | None = None,
        page: int = 1,
        per_page: int = 10,
    ):
        query = select(Review)
        count_query = select(func.count(Review.id))

        if product_id is not None:
            query = query.where(Review.product_id == product_id)
            count_query = count_query.where(Review.product_id == product_id)

        total = await self.session.scalar(count_query)

        offset = (page - 1) * per_page
        query = query.order_by(Review.id.desc()).offset(offset).limit(per_page)

        result = await self.session.execute(query)
        reviews = result.scalars().all()

        return {
            'items': [self.mapper.map_to_domain_entity(review) for review in reviews],
            'page': page,
            'per_page': per_page,
            'total': total or 0,
        }
