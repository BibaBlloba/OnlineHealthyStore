"""user delete cascade fks

Revision ID: 1a2d3f4b5c6d
Revises: 9b7d2c7c8e11
Create Date: 2026-06-17 00:00:01.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '1a2d3f4b5c6d'
down_revision: Union[str, Sequence[str], None] = '9b7d2c7c8e11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(op.f('carts_user_id_fkey'), 'carts', type_='foreignkey')
    op.create_foreign_key(
        op.f('carts_user_id_fkey'),
        'carts',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE',
    )

    op.drop_constraint(op.f('orders_user_id_fkey'), 'orders', type_='foreignkey')
    op.create_foreign_key(
        op.f('orders_user_id_fkey'),
        'orders',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE',
    )

    op.drop_constraint(op.f('reviews_user_id_fkey'), 'reviews', type_='foreignkey')
    op.create_foreign_key(
        op.f('reviews_user_id_fkey'),
        'reviews',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE',
    )

    op.drop_constraint(
        op.f('cart_items_cart_id_fkey'), 'cart_items', type_='foreignkey'
    )
    op.create_foreign_key(
        op.f('cart_items_cart_id_fkey'),
        'cart_items',
        'carts',
        ['cart_id'],
        ['id'],
        ondelete='CASCADE',
    )

    op.drop_constraint(
        op.f('order_items_order_id_fkey'), 'order_items', type_='foreignkey'
    )
    op.create_foreign_key(
        op.f('order_items_order_id_fkey'),
        'order_items',
        'orders',
        ['order_id'],
        ['id'],
        ondelete='CASCADE',
    )

    op.drop_constraint(op.f('payments_order_id_fkey'), 'payments', type_='foreignkey')
    op.create_foreign_key(
        op.f('payments_order_id_fkey'),
        'payments',
        'orders',
        ['order_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f('payments_order_id_fkey'), 'payments', type_='foreignkey')
    op.create_foreign_key(
        op.f('payments_order_id_fkey'),
        'payments',
        'orders',
        ['order_id'],
        ['id'],
    )

    op.drop_constraint(op.f('order_items_order_id_fkey'), 'order_items', type_='foreignkey')
    op.create_foreign_key(
        op.f('order_items_order_id_fkey'),
        'order_items',
        'orders',
        ['order_id'],
        ['id'],
    )

    op.drop_constraint(op.f('cart_items_cart_id_fkey'), 'cart_items', type_='foreignkey')
    op.create_foreign_key(
        op.f('cart_items_cart_id_fkey'),
        'cart_items',
        'carts',
        ['cart_id'],
        ['id'],
    )

    op.drop_constraint(op.f('reviews_user_id_fkey'), 'reviews', type_='foreignkey')
    op.create_foreign_key(
        op.f('reviews_user_id_fkey'),
        'reviews',
        'users',
        ['user_id'],
        ['id'],
    )

    op.drop_constraint(op.f('orders_user_id_fkey'), 'orders', type_='foreignkey')
    op.create_foreign_key(
        op.f('orders_user_id_fkey'),
        'orders',
        'users',
        ['user_id'],
        ['id'],
    )

    op.drop_constraint(op.f('carts_user_id_fkey'), 'carts', type_='foreignkey')
    op.create_foreign_key(
        op.f('carts_user_id_fkey'),
        'carts',
        'users',
        ['user_id'],
        ['id'],
    )