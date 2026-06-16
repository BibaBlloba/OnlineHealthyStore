from sqlalchemy import select, asc, desc
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
        query = select(self.model, ProductImage).join(ProductImage, isouter=True)

        if params.category_id is not None:
            query = query.where(self.model.category_id == params.category_id)

        if params.min_price is not None:
            query = query.where(self.model.price >= params.min_price)

        if params.max_price is not None:
            query = query.where(self.model.price <= params.max_price)

        if params.name:
            query = query.where(self.model.name.ilike(f'%{params.name}%'))

        if params.order_by:
            column = getattr(self.model, params.order_by, None)

            if column is not None:
                query = query.order_by(
                    desc(column) if params.order_dir == 'desc' else asc(column)
                )

        result = await self.session.execute(query)
        products = result.scalars().unique().all()

        return [self.mapper.map_to_domain_entity(p) for p in products]
