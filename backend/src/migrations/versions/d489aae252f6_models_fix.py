"""models fix

Revision ID: d489aae252f6
Revises: f790e3f09c45
Create Date: 2026-06-17 14:06:10.462393

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'd489aae252f6'
down_revision: Union[str, Sequence[str], None] = 'f790e3f09c45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
