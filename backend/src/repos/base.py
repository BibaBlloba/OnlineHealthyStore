from typing import Type

from asyncpg.exceptions import DataError
from pydantic import BaseModel
from sqlalchemy import delete, insert, select, update, asc, desc, select
from sqlalchemy.exc import DBAPIError, IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import Base
from src.exceptions import ObjectNotFoundException
from src.repos.mappers.base import DataMapper


class BaseRepository:
    model: Type[Base] = Base
    mapper: Type[DataMapper] = None

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self):
        query = select(self.model)

        result = await self.session.execute(query)

        return [
            self.mapper.map_to_domain_entity(model) for model in result.scalars().all()
        ]

    async def get_filtered(self, *filters, **filter_by):
        query = select(self.model).filter(*filters).filter_by(**filter_by)

        result = await self.session.execute(query)

        return [
            self.mapper.map_to_domain_entity(model) for model in result.scalars().all()
        ]

    async def get_one_or_none(self, **filter_by):
        query = select(self.model).filter_by(**filter_by)

        result = await self.session.execute(query)

        model = result.scalars().one_or_none()

        if model is None:
            return None

        return self.mapper.map_to_domain_entity(model)

    async def get_one(self, **filter_by):
        query = select(self.model).filter_by(**filter_by)

        try:
            result = await self.session.execute(query)
            model = result.scalar_one()
        except (DataError, NoResultFound, DBAPIError):
            raise ObjectNotFoundException

        return self.mapper.map_to_domain_entity(model)

    async def add(self, data: BaseModel):
        stmt = insert(self.model).values(**data.model_dump()).returning(self.model)

        try:
            result = await self.session.execute(stmt)
        except IntegrityError as e:
            raise

        model = result.scalars().one()

        return self.mapper.map_to_domain_entity(model)

    async def add_bulk(self, data: list[BaseModel]):
        stmt = insert(self.model).values([item.model_dump() for item in data])

        await self.session.execute(stmt)

    async def edit(
        self,
        data: BaseModel,
        exclude_unset: bool = False,
        **filter_by,
    ):
        stmt = (
            update(self.model)
            .filter_by(**filter_by)
            .values(data.model_dump(exclude_unset=exclude_unset))
            .returning(self.model)
        )

        try:
            result = await self.session.execute(stmt)
            model = result.scalars().one()
        except NoResultFound:
            raise ObjectNotFoundException

        return self.mapper.map_to_domain_entity(model)

    async def delete(self, **filter_by):
        stmt = delete(self.model).filter_by(**filter_by)

        result = await self.session.execute(stmt)

        return result.rowcount

    async def exists(self, **filter_by) -> bool:
        query = select(self.model).filter_by(**filter_by)

        result = await self.session.execute(query)

        return result.scalars().first() is not None

    async def count(self, **filter_by) -> int:
        query = select(self.model).filter_by(**filter_by)

        result = await self.session.execute(query)

        return len(result.scalars().all())

    async def paginate(
        self,
        page: int = 1,
        per_page: int = 10,
    ):
        offset = (page - 1) * per_page

        query = select(self.model).offset(offset).limit(per_page)

        result = await self.session.execute(query)

        return [
            self.mapper.map_to_domain_entity(model) for model in result.scalars().all()
        ]

    async def get_sorted_filtered(
        self,
        *filters,
        order_by: str | None = None,
        order_dir: str = 'asc',
        **filter_by,
    ):
        query = select(self.model).filter(*filters).filter_by(**filter_by)

        if order_by:
            column = getattr(self.model, order_by, None)

            if column is not None:
                if order_dir == 'desc':
                    query = query.order_by(desc(column))
                else:
                    query = query.order_by(asc(column))

        result = await self.session.execute(query)

        return [
            self.mapper.map_to_domain_entity(model) for model in result.scalars().all()
        ]
