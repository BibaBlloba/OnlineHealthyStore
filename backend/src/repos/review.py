from src.models.review import Review
from src.repos.base import BaseRepository
from src.repos.mappers import ReviewDataMapper


class ReviewsRepository(BaseRepository):
    model = Review
    mapper = ReviewDataMapper
