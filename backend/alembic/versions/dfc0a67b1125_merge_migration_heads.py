"""merge migration heads

Revision ID: dfc0a67b1125
Revises: 15a086ed2990, c19d4e78a2f1
Create Date: 2026-08-15 19:07:49.686076

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dfc0a67b1125'
down_revision: Union[str, Sequence[str], None] = ('15a086ed2990', 'c19d4e78a2f1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
