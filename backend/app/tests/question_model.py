from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("assessment_tests.id"),
        nullable=False
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    option_a: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    option_b: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    option_c: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    option_d: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    correct_answer: Mapped[str] = mapped_column(
        String(1),
        nullable=False
    )

    marks: Mapped[float] = mapped_column(
        default=1,
        nullable=False
    )