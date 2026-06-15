from src.models.role import RoleOrm
from src.models.user import UserOrm
from src.models.category import CategoryOrm
from src.models.product import ProductOrm
from src.models.productImage import ProductImageOrm
from src.models.cart import CartOrm
from src.models.cartItem import CartItemOrm
from src.models.order import OrderOrm
from src.models.orderItem import OrderItemOrm
from src.models.payment import PaymentOrm
from src.models.review import ReviewOrm

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
    db_model = RoleOrm
    schema = RoleRead


class UsersDataMapper(DataMapper):
    db_model = UserOrm
    schema = UserRead


class CategoriesDataMapper(DataMapper):
    db_model = CategoryOrm
    schema = CategoryRead


class ProductsDataMapper(DataMapper):
    db_model = ProductOrm
    schema = ProductRead


class ProductImagesDataMapper(DataMapper):
    db_model = ProductImageOrm
    schema = ProductImageRead


class CartsDataMapper(DataMapper):
    db_model = CartOrm
    schema = CartRead


class CartItemsDataMapper(DataMapper):
    db_model = CartItemOrm
    schema = CartItemRead


class OrdersDataMapper(DataMapper):
    db_model = OrderOrm
    schema = OrderRead


class OrderItemsDataMapper(DataMapper):
    db_model = OrderItemOrm
    schema = OrderItemRead


class PaymentsDataMapper(DataMapper):
    db_model = PaymentOrm
    schema = PaymentRead


class ReviewsDataMapper(DataMapper):
    db_model = ReviewOrm
    schema = ReviewRead
