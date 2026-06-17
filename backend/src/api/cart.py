from fastapi import APIRouter, HTTPException

from src.api.dependencies import CurrentUserDep, DbDep
from src.schemas.cart import CartCreate, CartRead
from src.schemas.cartItem import CartItemCreate, CartItemRead, CartItemUpdate


router = APIRouter(prefix='/cart', tags=['Cart'])


async def _get_or_create_cart(db: DbDep, user_id: int):
    cart = await db.carts.get_one_or_none(user_id=user_id)

    if cart is None:
        created_cart = await db.carts.add(CartCreate(user_id=user_id))
        await db.commit()
        cart = await db.carts.get_one(id=created_cart.id)

    return cart


@router.get('', response_model=CartRead)
async def get_cart(db: DbDep, current_user: CurrentUserDep):
    return await _get_or_create_cart(db, current_user['user_id'])


@router.post('/items', response_model=CartItemRead)
async def add_cart_item(
    data: CartItemCreate,
    db: DbDep,
    current_user: CurrentUserDep,
):
    cart = await _get_or_create_cart(db, current_user['user_id'])

    product = await db.products.get_one_or_none(id=data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Товар не найден')

    cart_item = await db.cart_items.get_one_or_none(
        cart_id=cart.id,
        product_id=data.product_id,
    )

    if cart_item:
        updated = await db.cart_items.edit(
            data=CartItemUpdate(quantity=cart_item.quantity + data.quantity),
            id=cart_item.id,
            exclude_unset=True,
        )
        await db.commit()
        return await db.cart_items.get_one(id=updated.id)

    created = await db.cart_items.add(
        CartItemCreate(
            cart_id=cart.id,
            product_id=data.product_id,
            quantity=data.quantity,
        )
    )
    await db.commit()
    return await db.cart_items.get_one(id=created.id)


@router.put('/items/{item_id}', response_model=CartItemRead)
async def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    db: DbDep,
    current_user: CurrentUserDep,
):
    cart = await _get_or_create_cart(db, current_user['user_id'])
    cart_item = await db.cart_items.get_one_or_none(id=item_id)

    if not cart_item or cart_item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail='Товар в корзине не найден')

    updated = await db.cart_items.edit(
        data=data,
        id=item_id,
        exclude_unset=True,
    )
    await db.commit()
    return await db.cart_items.get_one(id=updated.id)


@router.delete('/items/{item_id}')
async def delete_cart_item(
    item_id: int,
    db: DbDep,
    current_user: CurrentUserDep,
):
    cart = await _get_or_create_cart(db, current_user['user_id'])
    cart_item = await db.cart_items.get_one_or_none(id=item_id)

    if not cart_item or cart_item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail='Товар в корзине не найден')

    deleted = await db.cart_items.delete(id=item_id)
    await db.commit()

    if deleted == 0:
        raise HTTPException(status_code=404, detail='Товар в корзине не найден')

    return {'status': 'deleted'}

