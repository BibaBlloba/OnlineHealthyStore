from sqlalchemy import Column, Integer, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship

from src.database import Base


class Order(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))

    total_price = Column(Numeric(10, 2), default=0)

    status = Column(String(50), default='pending')

    user = relationship('User', back_populates='orders')

    items = relationship(
        'OrderItem',
        back_populates='order',
        cascade='all, delete-orphan',
        lazy='selectin',
    )

    payment = relationship(
        'Payment', back_populates='order', uselist=False, lazy='selectin'
    )
