from datetime import datetime

from pydantic import BaseModel


# =========================================================
# CREATE TEST
# =========================================================

class AssessmentTestCreate(BaseModel):
    title: str
    description: str | None = None
    skill: str
    duration_minutes: int = 30
    passing_score: float = 40


# =========================================================
# TEST RESPONSE
# =========================================================

class AssessmentTestResponse(BaseModel):
    id: int
    title: str
    description: str | None
    skill: str
    duration_minutes: int
    total_questions: int
    passing_score: float

    class Config:
        from_attributes = True


# =========================================================
# CREATE QUESTION
# =========================================================

class AssessmentQuestionCreate(BaseModel):
    test_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    marks: float = 1


# =========================================================
# QUESTION RESPONSE
# =========================================================

class AssessmentQuestionResponse(BaseModel):
    id: int
    test_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    marks: float

    class Config:
        from_attributes = True


# =========================================================
# SUBMIT ANSWER
# =========================================================

class AnswerItem(BaseModel):
    question_id: int
    selected_answer: str


# =========================================================
# SUBMIT TEST
# =========================================================

class TestSubmitRequest(BaseModel):
    test_id: int
    answers: list[AnswerItem]


# =========================================================
# TEST ATTEMPT RESPONSE
# =========================================================

class TestAttemptResponse(BaseModel):
    id: int
    test_id: int
    student_id: int
    score: float
    total_marks: float
    percentage: float
    passed: bool
    started_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True