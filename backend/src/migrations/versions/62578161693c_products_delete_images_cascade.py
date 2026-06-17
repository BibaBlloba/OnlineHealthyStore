"""products delete images cascade

Revision ID: 62578161693c
Revises: c83596c50242
Create Date: 2026-06-16 14:56:32.954885

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '62578161693c'
down_revision: Union[str, Sequence[str], None] = 'c83596c50242'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        op.f('product_images_product_id_fkey'),
        'product_images',
        type_='foreignkey',
    )
    op.create_foreign_key(
        None,
        'product_images',
        'products',
        ['product_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(None, 'product_images', type_='foreignkey')
    op.create_foreign_key(
        op.f('product_images_product_id_fkey'),
        'product_images',
        'products',
        ['product_id'],
        ['id'],
    )
