from datetime import date, datetime
import uuid

from sqlalchemy import Date, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid.uuid4().hex)
    po_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    vendor_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    vendor_id: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")
    order_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expected_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    total_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    product_id: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    owner_id: Mapped[str] = mapped_column(String(32), nullable=False, default="", index=True)