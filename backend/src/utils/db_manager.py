from src.repos.role import RolesRepository
from src.repos.user import UsersRepository
from src.repos.category import CategoriesRepository
from src.repos.product import ProductsRepository
from src.repos.productImage import ProductImagesRepository
from src.repos.cart import CartRepository
from src.repos.cartItem import CartItemsRepository
from src.repos.order import OrdersRepository
from src.repos.orderItem import OrderItemsRepository
from src.repos.payment import PaymentsRepository
from src.repos.review import ReviewsRepository


class DbManager:
    def __init__(self, session_factory) -> None:
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session = self.session_factory()

        """ Репозитории """
        self.roles = RolesRepository(self.session)
        self.users = UsersRepository(self.session)

        self.categories = CategoriesRepository(self.session)
        self.products = ProductsRepository(self.session)
        self.product_images = ProductImagesRepository(self.session)

        self.carts = CartRepository(self.session)
        self.cart_items = CartItemsRepository(self.session)

        self.orders = OrdersRepository(self.session)
        self.order_items = OrderItemsRepository(self.session)

        self.payments = PaymentsRepository(self.session)

        self.reviews = ReviewsRepository(self.session)

        return self

    async def __aexit__(self, *args):
        await self.session.rollback()
        await self.session.close()

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
