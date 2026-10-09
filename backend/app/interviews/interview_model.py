from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # Student being interviewed
    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id"),
        nullable=False
    )

    # Job for which interview is conducted
    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id"),
        nullable=False
    )

    # Recruiter conducting the interview
    recruiter_id: Mapped[int] = mapped_column(
        ForeignKey("recruiters.id"),
        nullable=False
    )

    # Scheduled interview time
    scheduled_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    # Interview status
    status: Mapped[str] = mapped_column(
        String(30),
        default="scheduled",
        nullable=False
    )

    # Interview result
    result: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    # Recruiter feedback
    feedback: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Overall score
    score: Mapped[float | None] = mapped_column(
        nullable=True
    )