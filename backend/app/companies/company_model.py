from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    recruiter_id: Mapped[int] = mapped_column(
        ForeignKey("recruiters.id"),
        nullable=False
    )

    company_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    industry: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    location: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )