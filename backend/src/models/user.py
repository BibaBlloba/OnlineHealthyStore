from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from src.database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)

    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    first_name = Column(String(100))
    last_name = Column(String(100))

    role_id = Column(Integer, ForeignKey('roles.id'))

    role = relationship('Role', back_populates='users')
    cart = relationship('Cart', back_populates='user', uselist=False)
    orders = relationship('Order', back_populates='user')
    reviews = relationship('Review', back_populates='user')
