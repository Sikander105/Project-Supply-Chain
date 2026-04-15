"""add users and owner scoping

Revision ID: 0b3a9d2f1e10
Revises: 523caee375ab
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0b3a9d2f1e10"
down_revision: Union[str, Sequence[str], None] = "523caee375ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    for table in ["products", "vendors", "warehouses", "purchase_orders", "shipments"]:
        op.add_column(table, sa.Column("owner_id", sa.String(length=32), nullable=False, server_default=""))
        op.create_index(f"ix_{table}_owner_id", table, ["owner_id"], unique=False)


def downgrade() -> None:
    for table in ["shipments", "purchase_orders", "warehouses", "vendors", "products"]:
        op.drop_index(f"ix_{table}_owner_id", table_name=table)
        op.drop_column(table, "owner_id")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")