from datetime import date, datetime
import uuid

from sqlalchemy import Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: uuid.uuid4().hex)
    shipment_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    carrier: Mapped[str | None] = mapped_column(String(200), nullable=True)
    origin: Mapped[str | None] = mapped_column(String(255), nullable=True)
    destination: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tracking_number: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="preparing")
    shipped_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expected_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    product_id: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    warehouse_id: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    received_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    owner_id: Mapped[str] = mapped_column(String(32), nullable=False, default="", index=True)