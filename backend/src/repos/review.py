from src.models.review import Review
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import ReviewsDataMapper


class ReviewsRepository(BaseRepository):
    model = Review
    mapper = ReviewsDataMapper
