from datetime import datetime

from pydantic import BaseModel


# ==========================================
# CREATE INTERVIEW
# ==========================================

class InterviewCreate(BaseModel):
    student_id: int
    job_id: int
    scheduled_at: datetime | None = None


# ==========================================
# UPDATE INTERVIEW
# ==========================================

class InterviewUpdate(BaseModel):
    scheduled_at: datetime | None = None
    status: str | None = None
    result: str | None = None
    feedback: str | None = None
    score: float | None = None


# ==========================================
# INTERVIEW RESPONSE
# ==========================================

class InterviewResponse(BaseModel):
    id: int
    student_id: int
    job_id: int
    recruiter_id: int
    scheduled_at: datetime | None
    status: str
    result: str | None
    feedback: str | None
    score: float | None

    class Config:
        from_attributes = True


# ==========================================
# CREATE INTERVIEW QUESTION
# ==========================================

class InterviewQuestionCreate(BaseModel):
    interview_id: int
    question: str


# ==========================================
# UPDATE INTERVIEW QUESTION / ANSWER
# ==========================================

class InterviewQuestionUpdate(BaseModel):
    answer: str | None = None
    evaluation: str | None = None
    score: float | None = None


# ==========================================
# INTERVIEW QUESTION RESPONSE
# ==========================================

class InterviewQuestionResponse(BaseModel):
    id: int
    interview_id: int
    question: str
    answer: str | None
    evaluation: str | None
    score: float | None

    class Config:
        from_attributes = True