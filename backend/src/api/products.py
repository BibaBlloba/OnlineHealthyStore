from fastapi import APIRouter, Body, HTTPException, Response
from src.models.product import Product
from src.api.dependencies import (
    DbDep,
    AdminOnly,
)
from src.schemas.product import ProductCreate, ProductUpdate


router = APIRouter(prefix='/products', tags=['Products'])


@router.delete('/{product_id}')
async def delete_product(
    product_id: int,
    db: DbDep,
    _: dict = AdminOnly,
):
    deleted = await db.products.delete(id=product_id)

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail='Товар не найден',
        )

    await db.commit()
    return {'status': 'deleted'}


@router.post('/')
async def create_product(
    data: ProductCreate,
    db: DbDep,
    _: dict = AdminOnly,
):
    product = await db.products.add(data)
    await db.commit()
    return product


@router.patch('/{product_id}')
async def update_product(
    product_id: int,
    data: ProductUpdate,
    db: DbDep,
    _: dict = AdminOnly,
):
    product = await db.products.get_one_or_none(id=product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail='Товар не найден',
        )

    updated = await db.products.edit(
        data=data,
        id=product_id,
        exclude_unset=True,
    )

    await db.commit()
    return updated


@router.get('/')
async def get_products(
    db: DbDep,
    category_id: int | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
):
    filters = []

    if category_id is not None:
        filters.append(Product.category_id == category_id)

    if min_price is not None:
        filters.append(Product.price >= min_price)

    if max_price is not None:
        filters.append(Product.price <= max_price)

    return await db.products.get_filtered(*filters)


@router.get('/{product_id}')
async def get_product(
    product_id: int,
    db: DbDep,
):
    product = await db.products.get_one_or_none(id=product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail='Товар не найден',
        )

    return product
