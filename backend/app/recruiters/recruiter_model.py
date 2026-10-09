from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Recruiter(Base):
    __tablename__ = "recruiters"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        unique=True,
        nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    company_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    designation: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    company_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )