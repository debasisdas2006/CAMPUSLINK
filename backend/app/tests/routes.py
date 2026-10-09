from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.students.student_model import Student

# Notifications
from app.notifications.schemas import NotificationCreate
from app.notifications.service import create_notification

from app.tests.schemas import (
    AssessmentTestCreate,
    AssessmentTestResponse,
    AssessmentQuestionCreate,
    AssessmentQuestionResponse,
    TestSubmitRequest,
    TestAttemptResponse
)

from app.tests.service import (
    create_test,
    get_all_tests,
    get_test_by_id,
    create_question,
    get_test_questions,
    submit_test,
    get_student_attempts
)


router = APIRouter(
    prefix="/tests",
    tags=["Assessment Tests"]
)


# =========================================================
# CREATE TEST
# =========================================================

@router.post(
    "/",
    response_model=AssessmentTestResponse
)
def create_new_test(
    data: AssessmentTestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "recruiter"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and recruiters can create tests"
        )

    return create_test(
        db,
        data,
        current_user.id
    )


# =========================================================
# GET ALL TESTS
# =========================================================

@router.get(
    "/",
    response_model=list[AssessmentTestResponse]
)
def get_tests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_all_tests(db)


# =========================================================
# ADD QUESTION
# =========================================================

@router.post(
    "/questions",
    response_model=AssessmentQuestionResponse
)
def add_question(
    data: AssessmentQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "recruiter"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and recruiters can add questions"
        )

    question, error = create_question(
        db,
        data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return question


# =========================================================
# GET QUESTIONS FOR TEST
# =========================================================

@router.get(
    "/{test_id}/questions",
    response_model=list[AssessmentQuestionResponse]
)
def get_questions(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    questions, error = get_test_questions(
        db,
        test_id
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    return questions


# =========================================================
# SUBMIT TEST
# =========================================================

@router.post(
    "/submit",
    response_model=TestAttemptResponse
)
def submit_assessment(
    data: TestSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can submit tests"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    attempt, error = submit_test(
        db,
        student,
        data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    # =====================================================
    # GET TEST DETAILS
    # =====================================================

    test = get_test_by_id(
        db,
        data.test_id
    )

    # =====================================================
    # CREATE TEST RESULT NOTIFICATION
    # =====================================================

    if test:
        result_status = (
            "passed"
            if attempt.passed
            else "not passed"
        )

        notification_data = NotificationCreate(
            user_id=current_user.id,
            title="Test Completed",
            message=(
                f"You scored {attempt.percentage:.1f}% "
                f"in '{test.title}'. "
                f"You {result_status} the test."
            ),
            notification_type="test"
        )

        create_notification(
            db=db,
            notification_data=notification_data
        )

    return attempt


# =========================================================
# STUDENT ATTEMPTS
# =========================================================

@router.get(
    "/student/my-attempts",
    response_model=list[TestAttemptResponse]
)
def get_my_attempts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can access test attempts"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    return get_student_attempts(
        db,
        student
    )


# =========================================================
# GET TEST BY ID
# =========================================================

@router.get(
    "/{test_id}",
    response_model=AssessmentTestResponse
)
def get_single_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    test = get_test_by_id(
        db,
        test_id
    )

    if test is None:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )

    return test