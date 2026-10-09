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

from app.applications.schemas import (
    ApplicationCreate,
    ApplicationResponse,
    RecruiterApplicationResponse,
    ApplicationStatusUpdate
)

from app.applications.service import (
    create_application,
    get_recruiter_applications,
    update_application_status,
    get_student_applications
)


router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


# ==========================================
# STUDENT - APPLY FOR JOB
# ==========================================

@router.post(
    "/",
    response_model=ApplicationResponse
)
def apply_for_job(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can apply for jobs"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    application, error = create_application(
        db=db,
        student=student,
        data=data
    )

    if error:
        if error == "Job not found":
            raise HTTPException(
                status_code=404,
                detail=error
            )

        if error == "You have already applied for this job":
            raise HTTPException(
                status_code=400,
                detail=error
            )

    return application


# ==========================================
# STUDENT - VIEW MY APPLICATIONS
# ==========================================

@router.get(
    "/my-applications",
    response_model=list[ApplicationResponse]
)
def get_my_student_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can view their applications"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    return get_student_applications(
        db=db,
        student=student
    )


# ==========================================
# RECRUITER - VIEW APPLICATIONS
# ==========================================

@router.get(
    "/recruiter/my-applications",
    response_model=list[RecruiterApplicationResponse]
)
def get_my_recruiter_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can view applications"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    applications = get_recruiter_applications(
        db=db,
        recruiter=recruiter
    )

    if applications is None:
        raise HTTPException(
            status_code=404,
            detail="Company profile not found"
        )

    return [
        {
            "application_id": application.id,
            "student_id": application.student_id,
            "job_id": application.job_id,
            "status": application.status,
            "cover_message": application.cover_message
        }
        for application in applications
    ]


# ==========================================
# RECRUITER - UPDATE APPLICATION STATUS
# ==========================================

@router.put(
    "/{application_id}/status",
    response_model=RecruiterApplicationResponse
)
def update_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can update application status"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    application, error = update_application_status(
        db=db,
        recruiter=recruiter,
        application_id=application_id,
        new_status=data.status
    )

    if error:
        if error == "Company profile not found":
            raise HTTPException(
                status_code=404,
                detail=error
            )

        if error == "Application not found":
            raise HTTPException(
                status_code=404,
                detail=error
            )

        if error == "You are not authorized to update this application":
            raise HTTPException(
                status_code=403,
                detail=error
            )

        if error.startswith("Invalid status"):
            raise HTTPException(
                status_code=400,
                detail=error
            )

    # ==========================================
    # CREATE NOTIFICATION FOR STUDENT
    # ==========================================

    student = db.query(Student).filter(
        Student.id == application.student_id
    ).first()

    job = db.query(Job).filter(
        Job.id == application.job_id
    ).first()

    company = None

    if job:
        company = db.query(Company).filter(
            Company.id == job.company_id
        ).first()

    if student:
        company_name = (
            company.company_name
            if company
            else "The company"
        )

        status_value = application.status.upper()

        # --------------------------------------
        # APPLICATION ACCEPTED
        # --------------------------------------

        if status_value == "ACCEPTED":
            notification_title = "Application Accepted"

            notification_message = (
                f"{company_name} accepted your application."
            )

            notification_type = "APPLICATION_ACCEPTED"

        # --------------------------------------
        # APPLICATION REJECTED
        # --------------------------------------

        elif status_value == "REJECTED":
            notification_title = "Application Rejected"

            notification_message = (
                f"{company_name} rejected your application."
            )

            notification_type = "APPLICATION_REJECTED"

        # --------------------------------------
        # APPLICATION SHORTLISTED
        # --------------------------------------

        elif status_value == "SHORTLISTED":
            notification_title = "Application Shortlisted"

            notification_message = (
                f"{company_name} shortlisted your application."
            )

            notification_type = "APPLICATION_SHORTLISTED"

        # --------------------------------------
        # OTHER STATUS
        # --------------------------------------

        else:
            notification_title = "Application Status Updated"

            notification_message = (
                f"Your application status has been updated "
                f"to '{application.status}'."
            )

            notification_type = "APPLICATION_STATUS_UPDATED"

        # --------------------------------------
        # SAVE NOTIFICATION
        # --------------------------------------

        notification_data = NotificationCreate(
            user_id=student.user_id,
            title=notification_title,
            message=notification_message,
            notification_type=notification_type,
            job_id=application.job_id,
            application_id=application.id
        )

        create_notification(
            db=db,
            notification_data=notification_data
        )

    # ==========================================
    # RETURN UPDATED APPLICATION
    # ==========================================

    return {
        "application_id": application.id,
        "student_id": application.student_id,
        "job_id": application.job_id,
        "status": application.status,
        "cover_message": application.cover_message
    }