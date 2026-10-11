from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, synonym

from app.core.database import Base


class StudentEducation(Base):
    __tablename__ = "student_education"

    id: Mapped[int] = mapped_column(
        "education_id",
        Integer,
        primary_key=True,
        index=True,
    )

    education_id = synonym("id")

    student_id: Mapped[int] = mapped_column(
        "student_id",
        ForeignKey("students.student_id"),
        nullable=False,
        index=True,
    )

    education_level: Mapped[str] = mapped_column(
        "education_level",
        String(100),
        nullable=False,
    )

    degree: Mapped[str] = mapped_column(
        "degree",
        String(255),
        nullable=False,
    )

    specialization: Mapped[str | None] = mapped_column(
        "specialization",
        String(255),
        nullable=True,
    )

    institution_name: Mapped[str | None] = mapped_column(
        "institution_name",
        String(255),
        nullable=True,
    )

    university_name: Mapped[str | None] = mapped_column(
        "university_name",
        String(255),
        nullable=True,
    )

    cgpa: Mapped[float | None] = mapped_column(
        "cgpa",
        Numeric(5, 2),
        nullable=True,
    )

    maximum_cgpa: Mapped[float] = mapped_column(
        "maximum_cgpa",
        Numeric(5, 2),
        nullable=False,
    )

    graduation_year: Mapped[int | None] = mapped_column(
        "graduation_year",
        Integer,
        nullable=True,
    )

    start_year: Mapped[int | None] = mapped_column(
        "start_year",
        Integer,
        nullable=True,
    )

    end_year: Mapped[int | None] = mapped_column(
        "end_year",
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        "created_at",
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        "updated_at",
        DateTime,
        nullable=False,
        server_default=func.now(),
    )