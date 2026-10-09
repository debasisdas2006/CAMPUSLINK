from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.students.student_model import Student

from app.tests.ai_ml_service import (
    start_ai_test,
    get_ai_test,
    answer_ai_test,
    get_ai_test_progress,
    submit_ai_test,
    get_ai_student_result,
    get_ai_recruiter_result,
)


router = APIRouter(
    prefix="/tests/ai",
    tags=["AI/ML Assessments"],
)


class AIStartTestRequest(BaseModel):
    skills: list[str] = Field(default_factory=list)
    total_questions: int = Field(default=10, ge=1, le=100)
    test_type: str = "SELF_ASSESSMENT"


class AIAnswerRequest(BaseModel):
    question_id: str
    answer: str


def require_student(current_user: User):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can access AI assessments",
        )


@router.post("/start")
def start_assessment(
    data: AIStartTestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_student(current_user)

    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found",
        )

    if not data.skills:
        raise HTTPException(
            status_code=400,
            detail="At least one skill is required",
        )

    try:
        result = start_ai_test(
            student_id=str(student.id),
            student_name=student.full_name,
            skills=data.skills,
            total_questions=data.total_questions,
            test_type=data.test_type,
        )

        return {
            "success": True,
            "result": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


@router.get("/{ai_test_id}")
def get_assessment(
    ai_test_id: str,
    current_user: User = Depends(get_current_user),
):
    require_student(current_user)

    try:
        result = get_ai_test(ai_test_id)

        return {
            "success": True,
            "result": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


@router.post("/{ai_test_id}/answer")
def answer_assessment(
    ai_test_id: str,
    data: AIAnswerRequest,
    current_user: User = Depends(get_current_user),
):
    require_student(current_user)

    try:
        result = answer_ai_test(
            test_id=ai_test_id,
            question_id=data.question_id,
            answer=data.answer,
        )

        return {
            "success": True,
            "result": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


@router.get("/{ai_test_id}/progress")
def assessment_progress(
    ai_test_id: str,
    current_user: User = Depends(get_current_user),
):
    require_student(current_user)

    try:
        result = get_ai_test_progress(ai_test_id)

        return {
            "success": True,
            "result": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


@router.post("/{ai_test_id}/submit")
def submit_assessment(
    ai_test_id: str,
    current_user: User = Depends(get_current_user),
):
    require_student(current_user)

    try:
        result = submit_ai_test(ai_test_id)

        return {
            "success": True,
            "result": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


@router.get("/{ai_test_id}/result/student")
def student_assessment_result(
    ai_test_id: str,
    current_user: User = Depends(get_current_user),
):
    require_student(current_user)

    try:
        result = get_ai_student_result(ai_test_id)

        return {
            "success": True,
            "result": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc


@router.get("/{ai_test_id}/result/recruiter")
def recruiter_assessment_result(
    ai_test_id: str,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can access recruiter results",
        )

    try:
        result = get_ai_recruiter_result(ai_test_id)

        return {
            "success": True,
            "result": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc
