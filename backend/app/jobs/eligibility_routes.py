from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.students.student_model import Student
from app.jobs.job_model import Job
from app.jobs.eligibility import check_job_eligibility

from app.jobs.eligibility_schemas import (
    EligibilityResponse,
    AvailableJobResponse
)


router = APIRouter(
    prefix="/jobs",
    tags=["Job Eligibility"]
)


# ==========================================
# CHECK ELIGIBILITY FOR ONE JOB
# ==========================================

@router.get(
    "/{job_id}/eligibility",
    response_model=EligibilityResponse
)
def check_eligibility(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only students can check eligibility
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can check job eligibility"
        )

    # Find student profile
    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    # Find job
    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    # Check eligibility
    result = check_job_eligibility(
        student=student,
        job=job
    )

    return result


# ==========================================
# GET ALL AVAILABLE JOBS
# ==========================================

@router.get(
    "/available",
    response_model=list[AvailableJobResponse]
)
def get_available_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only students can view available jobs
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can view available jobs"
        )

    # Find student profile
    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    # Get all jobs
    jobs = db.query(Job).all()

    results = []

    # Check every job
    for job in jobs:

        eligibility = check_job_eligibility(
            student=student,
            job=job
        )

        results.append(
            {
                "job_id": job.id,
                "job_title": job.job_title,
                "company_id": job.company_id,
                "location": job.location,
                "eligible": eligibility["eligible"],
                "reasons": eligibility["reasons"]
            }
        )

    return results