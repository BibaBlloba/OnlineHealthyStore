from src.models.payment import Payment
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import PaymentsDataMapper


class PaymentsRepository(BaseRepository):
    model = Payment
    mapper = PaymentsDataMapper
