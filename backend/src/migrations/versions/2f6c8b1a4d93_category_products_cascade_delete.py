"""category products cascade delete

Revision ID: 2f6c8b1a4d93
Revises: 62578161693c
Create Date: 2026-06-17 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '2f6c8b1a4d93'
down_revision: Union[str, Sequence[str], None] = '62578161693c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        op.f('products_category_id_fkey'),
        'products',
        type_='foreignkey',
    )
    op.create_foreign_key(
        None,
        'products',
        'categories',
        ['category_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, 'products', type_='foreignkey')
    op.create_foreign_key(
        op.f('products_category_id_fkey'),
        'products',
        'categories',
        ['category_id'],
        ['id'],
    )