from fastapi import APIRouter, Body, HTTPException, Response
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
): ...


@router.post('/')
async def create_product(
    data: ProductCreate,
    db: DbDep,
    _: dict = AdminOnly,
): ...


@router.patch('/{product_id}')
async def update_product(
    product_id: int,
    data: ProductUpdate,
    db: DbDep,
    _: dict = AdminOnly,
): ...
