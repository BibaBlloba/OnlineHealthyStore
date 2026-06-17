from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from src.api.dependencies import CurrentUserDep, DbDep
from src.schemas.order import OrderCreate, OrderRead, OrderUpdate
from src.schemas.orderItem import OrderItemCreate
from src.schemas.payment import PaymentCreate, PaymentPayRequest


router = APIRouter(prefix='/orders', tags=['Orders'])


@router.post('/create', response_model=OrderRead)
async def create_order(db: DbDep, current_user: CurrentUserDep):
    cart = await db.carts.get_one_or_none(user_id=current_user['user_id'])

    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail='Корзина пуста')

    total_price = Decimal('0')
    order_items: list[OrderItemCreate] = []

    for cart_item in cart.items:
        product = await db.products.get_one_or_none(id=cart_item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail='Товар не найден')

        total_price += Decimal(product.price) * cart_item.quantity
        order_items.append(
            OrderItemCreate(
                product_id=product.id,
                quantity=cart_item.quantity,
                price=product.price,
            )
        )

    order = await db.orders.add(
        OrderCreate(
            user_id=current_user['user_id'],
            total_price=total_price,
            status='pending',
        )
    )

    await db.order_items.add_bulk(
        [
            OrderItemCreate(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
            )
            for item in order_items
        ]
    )

    await db.cart_items.delete(cart_id=cart.id)
    await db.commit()

    return await db.orders.get_one(id=order.id)


@router.get('', response_model=list[OrderRead])
async def get_orders(db: DbDep, current_user: CurrentUserDep):
    return await db.orders.get_filtered(user_id=current_user['user_id'])


@router.get('/{order_id}', response_model=OrderRead)
async def get_order(order_id: int, db: DbDep, current_user: CurrentUserDep):
    order = await db.orders.get_one_or_none(
        id=order_id,
        user_id=current_user['user_id'],
    )

    if not order:
        raise HTTPException(status_code=404, detail='Заказ не найден')

    return order


@router.post('/{order_id}/pay')
async def pay_order(
    order_id: int,
    data: PaymentPayRequest,
    db: DbDep,
    current_user: CurrentUserDep,
):
    order = await db.orders.get_one_or_none(
        id=order_id,
        user_id=current_user['user_id'],
    )

    if not order:
        raise HTTPException(status_code=404, detail='Заказ не найден')

    transaction_id = f'payment-{uuid4().hex}'

    payment = await db.payments.get_one_or_none(order_id=order_id)
    payment_payload = PaymentCreate(
        order_id=order_id,
        amount=order.total_price,
        status='paid',
        transaction_id=transaction_id,
    )

    if payment:
        await db.payments.edit(
            data=payment_payload,
            order_id=order_id,
            exclude_unset=True,
        )
    else:
        await db.payments.add(payment_payload)

    await db.session.execute(text('CALL reduce_stock(:order_id)'), {'order_id': order_id})

    await db.session.execute(text('CALL pay_order(:order_id)'), {'order_id': order_id})

    await db.commit()

    return {'message': 'Оплата успешна'}