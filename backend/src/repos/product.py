from sqlalchemy import insert, select, asc, desc, update
from sqlalchemy.orm import selectinload

from src.models.productImage import ProductImage
from src.schemas.product import ProductRead
from src.models.product import Product
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import ProductsDataMapper


class ProductsRepository(BaseRepository):
    model = Product
    mapper = ProductsDataMapper

    async def search(self, params):
        query = select(Product).options(selectinload(Product.images))

        if params.category_id is not None:
            query = query.where(Product.category_id == params.category_id)

        if params.min_price is not None:
            query = query.where(Product.price >= params.min_price)

        if params.max_price is not None:
            query = query.where(Product.price <= params.max_price)

        if params.name:
            query = query.where(Product.name.ilike(f'%{params.name}%'))

        if params.order_by:
            column = getattr(Product, params.order_by, None)

            if column is not None:
                query = query.order_by(
                    desc(column) if params.order_dir == 'desc' else asc(column)
                )

        offset = (params.page - 1) * params.per_page
        query = query.offset(offset).limit(params.per_page)

        result = await self.session.execute(query)

        products = result.scalars().unique().all()

        return [self.mapper.map_to_domain_entity(p) for p in products]

    async def get_one_or_none(self, **filter_by):
        query = (
            select(Product).options(selectinload(Product.images)).filter_by(**filter_by)
        )

        result = await self.session.execute(query)
        product = result.scalar_one_or_none()

        if product is None:
            return None

        return self.mapper.map_to_domain_entity(product)

    async def get_one(self, **filter_by):
        query = (
            select(Product).options(selectinload(Product.images)).filter_by(**filter_by)
        )

        result = await self.session.execute(query)

        product = result.scalar_one()

        return self.mapper.map_to_domain_entity(product)

    async def add(self, data):
        values = data.model_dump(exclude_unset=True, exclude={'id'})

        stmt = insert(Product).values(**values).returning(Product.id)

        result = await self.session.execute(stmt)

        product_id = result.scalar_one()

        query = (
            select(Product)
            .options(selectinload(Product.images))
            .where(Product.id == product_id)
        )

        result = await self.session.execute(query)

        product = result.scalar_one()

        return self.mapper.map_to_domain_entity(product)

    async def edit(
        self,
        data,
        exclude_unset: bool = False,
        **filter_by,
    ):
        stmt = (
            update(Product)
            .filter_by(**filter_by)
            .values(data.model_dump(exclude_unset=exclude_unset))
            .returning(Product.id)
        )

        result = await self.session.execute(stmt)

        product_id = result.scalar_one()

        query = (
            select(Product)
            .options(selectinload(Product.images))
            .where(Product.id == product_id)
        )

        result = await self.session.execute(query)

        product = result.scalar_one()

        return self.mapper.map_to_domain_entity(product)
