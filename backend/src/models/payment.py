from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from src.database import Base


class Payment(Base):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey('orders.id'), unique=True)

    amount = Column(Numeric(10, 2), nullable=False)

    status = Column(String(50), default='pending')

    transaction_id = Column(String(255))

    order = relationship('Order', back_populates='payment', lazy='selectin')
