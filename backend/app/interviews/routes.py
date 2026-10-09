from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.students.student_model import Student
from app.recruiters.recruiter_model import Recruiter
from app.jobs.job_model import Job
from app.companies.company_model import Company

# Notifications
from app.notifications.schemas import NotificationCreate
from app.notifications.service import create_notification

from app.interviews.schemas import (
    InterviewCreate,
    InterviewUpdate,
    InterviewResponse,
    InterviewQuestionCreate,
    InterviewQuestionUpdate,
    InterviewQuestionResponse
)

from app.interviews.service import (
    create_interview,
    get_recruiter_interviews,
    get_student_interviews,
    update_interview,
    create_interview_question,
    get_interview_questions,
    update_interview_question
)


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"]
)


# =========================================================
# CREATE INTERVIEW
# =========================================================

@router.post("/", response_model=InterviewResponse)
def create_new_interview(
    data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can create interviews"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    interview, error = create_interview(
        db,
        recruiter,
        data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    # =====================================================
    # GET STUDENT
    # =====================================================

    student = db.query(Student).filter(
        Student.id == interview.student_id
    ).first()

    # =====================================================
    # GET JOB
    # =====================================================

    job = db.query(Job).filter(
        Job.id == interview.job_id
    ).first()

    # =====================================================
    # GET COMPANY
    # =====================================================

    company = None

    if job:
        company = db.query(Company).filter(
            Company.id == job.company_id
        ).first()

    # =====================================================
    # CREATE STUDENT NOTIFICATION
    # =====================================================

    if student:

        company_name = (
            company.company_name
            if company
            else "The company"
        )

        job_title = (
            job.job_title
            if job
            else "your applied job"
        )

        if interview.scheduled_at:
            scheduled_time = interview.scheduled_at.strftime(
                "%d %B %Y at %I:%M %p"
            )

            message = (
                f"{company_name} has scheduled your interview "
                f"for the {job_title} position on "
                f"{scheduled_time}."
            )

        else:
            message = (
                f"{company_name} has scheduled an interview "
                f"for the {job_title} position."
            )

        notification_data = NotificationCreate(
            user_id=student.user_id,
            title="Interview Scheduled",
            message=message,
            notification_type="INTERVIEW_SCHEDULED",
            job_id=interview.job_id
        )

        create_notification(
            db=db,
            notification_data=notification_data
        )

    return interview


# =========================================================
# RECRUITER - MY INTERVIEWS
# =========================================================

@router.get(
    "/recruiter/my-interviews",
    response_model=list[InterviewResponse]
)
def get_my_recruiter_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can access this endpoint"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    return get_recruiter_interviews(
        db,
        recruiter
    )


# =========================================================
# STUDENT - MY INTERVIEWS
# =========================================================

@router.get(
    "/student/my-interviews",
    response_model=list[InterviewResponse]
)
def get_my_student_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can access this endpoint"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    return get_student_interviews(
        db,
        student
    )


# =========================================================
# ADD INTERVIEW QUESTION
# =========================================================

@router.post(
    "/questions",
    response_model=InterviewQuestionResponse
)
def add_interview_question(
    data: InterviewQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can add interview questions"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    question, error = create_interview_question(
        db,
        recruiter,
        data
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    return question


# =========================================================
# GET INTERVIEW QUESTIONS
# =========================================================

@router.get(
    "/{interview_id}/questions",
    response_model=list[InterviewQuestionResponse]
)
def get_questions(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    questions, error = get_interview_questions(
        db,
        interview_id,
        current_user.id,
        current_user.role
    )

    if error:
        raise HTTPException(
            status_code=403 if "authorized" in error else 404,
            detail=error
        )

    return questions


# =========================================================
# UPDATE INTERVIEW QUESTION
# =========================================================

@router.put(
    "/questions/{question_id}",
    response_model=InterviewQuestionResponse
)
def update_question(
    question_id: int,
    data: InterviewQuestionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can update interview questions"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    question, error = update_interview_question(
        db,
        recruiter,
        question_id,
        data
    )

    if error:
        raise HTTPException(
            status_code=403 if "authorized" in error else 404,
            detail=error
        )

    return question


# =========================================================
# UPDATE INTERVIEW
# =========================================================

@router.put(
    "/{interview_id}",
    response_model=InterviewResponse
)
def update_existing_interview(
    interview_id: int,
    data: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can update interviews"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    interview, error = update_interview(
        db,
        recruiter,
        interview_id,
        data
    )

    if error:
        raise HTTPException(
            status_code=404,
            detail=error
        )

    # =====================================================
    # GET STUDENT
    # =====================================================

    student = db.query(Student).filter(
        Student.id == interview.student_id
    ).first()

    # =====================================================
    # GET JOB
    # =====================================================

    job = db.query(Job).filter(
        Job.id == interview.job_id
    ).first()

    # =====================================================
    # GET COMPANY
    # =====================================================

    company = None

    if job:
        company = db.query(Company).filter(
            Company.id == job.company_id
        ).first()

    # =====================================================
    # CREATE STUDENT NOTIFICATION
    # =====================================================

    if student:

        company_name = (
            company.company_name
            if company
            else "The company"
        )

        job_title = (
            job.job_title
            if job
            else "your applied job"
        )

        if interview.scheduled_at:
            scheduled_time = interview.scheduled_at.strftime(
                "%d %B %Y at %I:%M %p"
            )

            message = (
                f"Your interview for the {job_title} position "
                f"at {company_name} has been updated. "
                f"Scheduled time: {scheduled_time}."
            )

        else:
            message = (
                f"Your interview for the {job_title} position "
                f"at {company_name} has been updated."
            )

        notification_data = NotificationCreate(
            user_id=student.user_id,
            title="Interview Updated",
            message=message,
            notification_type="INTERVIEW_UPDATED",
            job_id=interview.job_id
        )

        create_notification(
            db=db,
            notification_data=notification_data
        )

    return interview