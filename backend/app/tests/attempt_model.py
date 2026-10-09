from datetime import datetime

from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("assessment_tests.id"),
        nullable=False
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False
    )

    score: Mapped[float] = mapped_column(
        default=0,
        nullable=False
    )

    total_marks: Mapped[float] = mapped_column(
        default=0,
        nullable=False
    )

    percentage: Mapped[float] = mapped_column(
        default=0,
        nullable=False
    )

    passed: Mapped[bool] = mapped_column(
        default=False,
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )