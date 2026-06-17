from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from src.database import Base


class Review(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    product_id = Column(Integer, ForeignKey('products.id'))
    rating = Column(Integer)
    comment = Column(Text)

    user = relationship('User', back_populates='reviews')
    product = relationship('Product', back_populates='reviews')
