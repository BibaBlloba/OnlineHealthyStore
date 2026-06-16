from src.models.role import Role
from src.models.user import User
from src.models.category import Category
from src.models.product import Product
from src.models.productImage import ProductImage
from src.models.cart import Cart
from src.models.cartItem import CartItem
from src.models.order import Order
from src.models.orderItem import OrderItem
from src.models.payment import Payment
from src.models.review import Review

from src.schemas.role import RoleRead
from src.schemas.user import UserRead
from src.schemas.category import CategoryRead
from src.schemas.product import ProductRead
from src.schemas.productImage import ProductImageRead
from src.schemas.cart import CartRead
from src.schemas.cartItem import CartItemRead
from src.schemas.order import OrderRead
from src.schemas.orderItem import OrderItemRead
from src.schemas.payment import PaymentRead
from src.schemas.review import ReviewRead

from src.repos.mappers.base import DataMapper


class RolesDataMapper(DataMapper):
    db_model = Role
    schema = RoleRead


class UsersDataMapper(DataMapper):
    db_model = User
    schema = UserRead


class CategoriesDataMapper(DataMapper):
    db_model = Category
    schema = CategoryRead


class ProductsDataMapper(DataMapper):
    db_model = Product
    schema = ProductRead


class ProductImagesDataMapper(DataMapper):
    db_model = ProductImage
    schema = ProductImageRead


class CartsDataMapper(DataMapper):
    db_model = Cart
    schema = CartRead


class CartItemsDataMapper(DataMapper):
    db_model = CartItem
    schema = CartItemRead


class OrdersDataMapper(DataMapper):
    db_model = Order
    schema = OrderRead


class OrderItemsDataMapper(DataMapper):
    db_model = OrderItem
    schema = OrderItemRead


class PaymentsDataMapper(DataMapper):
    db_model = Payment
    schema = PaymentRead


class ReviewsDataMapper(DataMapper):
    db_model = Review
    schema = ReviewRead
