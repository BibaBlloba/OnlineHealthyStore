from fastapi import APIRouter, HTTPException, UploadFile, File
import shutil
from pathlib import Path

from sqlalchemy import delete

from src.models.productImage import ProductImage
from src.schemas.productImage import ProductImageCreate
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


@router.patch('/{product_id}/image')
async def update_product_image(
    product_id: int,
    db: DbDep,
    file: UploadFile = File(...),
    _: dict = AdminOnly,
):
    product = await db.products.get_one_or_none(id=product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail='Товар не найден',
        )

    file_path = Path(f'static/products/{file.filename}')
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with file_path.open('wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    await db.session.execute(
        delete(ProductImage).where(ProductImage.product_id == product_id)
    )

    await db.product_images.add(
        ProductImageCreate(
            image_url=f'/static/products/{file.filename}',
            product_id=product_id,
        )
    )

    await db.commit()

    return {'status': 'image updated'}
