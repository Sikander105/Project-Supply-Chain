"""add missing product fields

Revision ID: 523caee375ab
Revises: 9b160a30bfbf
Create Date: 2026-04-12 22:21:32.693395

"""
from typing import Sequence, Union

from alembic import op


revision: str = '523caee375ab'
down_revision: Union[str, Sequence[str], None] = '9b160a30bfbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General' NOT NULL")
    op.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0 NOT NULL")
    op.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION DEFAULT 0 NOT NULL")
    op.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 0 NOT NULL")
    op.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(64) DEFAULT '' NOT NULL")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS warehouse_id")
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS reorder_level")
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS price")
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS stock")
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS category")
