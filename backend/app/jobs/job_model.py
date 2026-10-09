from sqlalchemy import String, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False
    )

    job_title: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    degree_required: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    minimum_cgpa: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    experience_required: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    programming_languages: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    technical_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    vacancies: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    location: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )