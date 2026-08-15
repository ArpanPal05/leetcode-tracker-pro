"""add_multi_platform_fields_to_problems

Revision ID: c19d4e78a2f1
Revises: f739479ac82f
Create Date: 2026-08-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c19d4e78a2f1'
down_revision: Union[str, Sequence[str], None] = 'f739479ac82f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add external_id and platform_rating columns
    op.add_column('problems', sa.Column('external_id', sa.String(length=100), nullable=True))
    op.add_column('problems', sa.Column('platform_rating', sa.Integer(), nullable=True))

    # 2. Backfill external_id for existing LeetCode records
    op.execute(
        "UPDATE problems SET external_id = COALESCE(frontend_question_id, slug, CAST(id AS VARCHAR)) WHERE external_id IS NULL"
    )

    # 3. Alter external_id to be NOT NULL and slug to be nullable
    with op.batch_alter_table('problems') as batch_op:
        batch_op.alter_column('external_id', nullable=False)
        batch_op.alter_column('slug', nullable=True)
        batch_op.create_unique_constraint('uq_platform_external_id', ['platform', 'external_id'])


def downgrade() -> None:
    with op.batch_alter_table('problems') as batch_op:
        batch_op.drop_constraint('uq_platform_external_id', type_='unique')
        batch_op.alter_column('slug', nullable=False)
        batch_op.drop_column('platform_rating')
        batch_op.drop_column('external_id')
