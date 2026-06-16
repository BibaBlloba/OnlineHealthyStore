from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from src.models.product import Product
from src.repos.base import BaseRepository
from src.repos.mappers.mappers import ProductsDataMapper


class ProductsRepository(BaseRepository):
    model = Product
    mapper = ProductsDataMapper

    async def get_all_with_images(self):
        query = select(self.model).options(selectinload(self.model.images))

        result = await self.session.execute(query)

        return [
            self.mapper.map_to_domain_entity(model) for model in result.scalars().all()
        ]

    async def get_filtered(self, *filters, **filter_by):
        query = (
            select(self.model)
            .options(selectinload(self.model.images))
            .filter(*filters)
            .filter_by(**filter_by)
        )

        result = await self.session.execute(query)

        return [
            self.mapper.map_to_domain_entity(model) for model in result.scalars().all()
        ]

    async def get_one_or_none(self, **filter_by):
        query = (
            select(self.model)
            .options(selectinload(self.model.images))
            .filter_by(**filter_by)
        )

        result = await self.session.execute(query)

        model = result.scalars().one_or_none()

        if model is None:
            return None

        return self.mapper.map_to_domain_entity(model)

    async def edit(self, data, exclude_unset=False, **filter_by):
        await self.session.execute(
            update(self.model)
            .filter_by(**filter_by)
            .values(data.model_dump(exclude_unset=exclude_unset))
        )

        await self.session.commit()

        query = (
            select(self.model)
            .options(selectinload(self.model.images))
            .filter_by(**filter_by)
        )

        result = await self.session.execute(query)
        model = result.scalars().one()

        return self.mapper.map_to_domain_entity(model)
