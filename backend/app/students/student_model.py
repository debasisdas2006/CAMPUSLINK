from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(
        "student_id",
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.user_id"),
        unique=True,
        nullable=False,
        index=True,
    )

    college_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("colleges.college_id"),
        nullable=False,
    )

    first_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    last_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    date_of_birth: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    gender: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    profile_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    total_experience_years: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )


class StudentEducation(Base):
    __tablename__ = "student_education"

    education_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("students.student_id"),
        nullable=False,
        index=True,
    )

    education_level: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    degree: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    specialization: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    institution_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    university_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    cgpa: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    maximum_cgpa: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    graduation_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    start_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    end_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(
        "skill_id",
        Integer,
        primary_key=True,
        index=True,
    )

    skill_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    skill_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[int] = mapped_column(
        "student_skill_id",
        Integer,
        primary_key=True,
        index=True,
    )

    student_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("students.student_id"),
        nullable=False,
        index=True,
    )

    skill_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("skills.skill_id"),
        nullable=False,
        index=True,
    )

    proficiency_level: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    years_of_experience: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )