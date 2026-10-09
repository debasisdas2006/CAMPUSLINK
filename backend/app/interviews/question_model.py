from sqlalchemy import Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # Interview this question belongs to
    interview_id: Mapped[int] = mapped_column(
        ForeignKey("interviews.id"),
        nullable=False
    )

    # Question asked during interview
    question: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # Student's answer
    answer: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # AI/recruiter evaluation
    evaluation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Score for this question
    score: Mapped[float | None] = mapped_column(
        nullable=True
    )