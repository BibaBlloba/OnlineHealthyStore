"""db constraints triggers procedures

Revision ID: 9b7d2c7c8e11
Revises: d489aae252f6
Create Date: 2026-06-17 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '9b7d2c7c8e11'
down_revision: Union[str, Sequence[str], None] = 'd489aae252f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute('ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE')

    op.execute('ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_product_price')
    op.create_check_constraint(
        'chk_product_price',
        'products',
        sa.text('price > 0'),
    )

    op.execute('ALTER TABLE reviews DROP CONSTRAINT IF EXISTS chk_review_rating')
    op.create_check_constraint(
        'chk_review_rating',
        'reviews',
        sa.text('rating BETWEEN 1 AND 5'),
    )

    op.execute('DROP TRIGGER IF EXISTS trg_products_updated_at ON products')
    op.execute('DROP FUNCTION IF EXISTS update_updated_at()')
    op.execute(
        sa.text(
            '''
            CREATE FUNCTION update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
            '''
        )
    )
    op.execute(
        '''
        CREATE TRIGGER trg_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at()
        '''
    )

    op.execute('DROP TRIGGER IF EXISTS trg_update_order_total ON order_items')
    op.execute('DROP FUNCTION IF EXISTS update_order_total()')
    op.execute(
        sa.text(
            '''
            CREATE FUNCTION update_order_total()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE orders
                SET total_price = (
                    SELECT COALESCE(SUM(quantity * price), 0)
                    FROM order_items
                    WHERE order_id = NEW.order_id
                )
                WHERE id = NEW.order_id;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
            '''
        )
    )
    op.execute(
        '''
        CREATE TRIGGER trg_update_order_total
        AFTER INSERT OR UPDATE ON order_items
        FOR EACH ROW
        EXECUTE FUNCTION update_order_total()
        '''
    )

    op.execute('DROP PROCEDURE IF EXISTS pay_order(integer)')
    op.execute(
        sa.text(
            '''
            CREATE PROCEDURE pay_order(p_order_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE orders
                SET status = 'paid'
                WHERE id = p_order_id;

                UPDATE payments
                SET status = 'paid'
                WHERE order_id = p_order_id;
            END;
            $$
            '''
        )
    )

    op.execute('DROP PROCEDURE IF EXISTS reduce_stock(integer)')
    op.execute(
        sa.text(
            '''
            CREATE PROCEDURE reduce_stock(p_order_id INT)
            LANGUAGE plpgsql
            AS $$
            BEGIN
                UPDATE products p
                SET stock_quantity = stock_quantity - oi.quantity
                FROM order_items oi
                WHERE oi.product_id = p.id
                  AND oi.order_id = p_order_id;
            END;
            $$
            '''
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute('DROP PROCEDURE IF EXISTS reduce_stock(integer)')
    op.execute('DROP PROCEDURE IF EXISTS pay_order(integer)')

    op.execute('DROP TRIGGER IF EXISTS trg_update_order_total ON order_items')
    op.execute('DROP FUNCTION IF EXISTS update_order_total()')

    op.execute('DROP TRIGGER IF EXISTS trg_products_updated_at ON products')
    op.execute('DROP FUNCTION IF EXISTS update_updated_at()')

    op.execute('ALTER TABLE reviews DROP CONSTRAINT IF EXISTS chk_review_rating')
    op.execute('ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_product_price')
    op.execute('ALTER TABLE products DROP COLUMN IF EXISTS updated_at')