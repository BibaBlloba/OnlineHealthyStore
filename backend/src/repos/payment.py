from src.models.payment import Payment
from src.repos.base import BaseRepository
from src.repos.mappers import PaymentDataMapper


class PaymentsRepository(BaseRepository):
    model = Payment
    mapper = PaymentDataMapper
