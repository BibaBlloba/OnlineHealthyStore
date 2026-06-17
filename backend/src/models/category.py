from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from src.database import Base


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)

    name = Column(String(255), nullable=False)

    products = relationship(
        'Product',
        back_populates='category',
        cascade='all, delete',
        passive_deletes=True,
    )
