from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AssessmentTest(Base):
    __tablename__ = "assessment_tests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    skill: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    duration_minutes: Mapped[int] = mapped_column(
        default=30,
        nullable=False
    )

    total_questions: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )

    passing_score: Mapped[float] = mapped_column(
        default=40,
        nullable=False
    )

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=True
    )