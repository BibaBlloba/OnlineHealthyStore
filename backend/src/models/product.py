from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from src.database import Base


class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, autoincrement=True)

    name = Column(String(255), nullable=False)
    description = Column(Text)

    price = Column(Numeric(10, 2), nullable=False)

    stock_quantity = Column(Integer, default=0)

    updated_at = Column(DateTime(timezone=True))

    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'))

    category = relationship('Category', back_populates='products')

    images = relationship(
        'ProductImage',
        back_populates='product',
        cascade='all, delete-orphan',
        lazy='selectin',
    )

    reviews = relationship('Review', back_populates='product', lazy='selectin')
