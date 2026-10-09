from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.jobs.job_model import Job
from app.jobs.schemas import JobCreate, JobResponse
from app.jobs.service import create_job

from app.recruiters.recruiter_model import Recruiter
from app.companies.company_model import Company


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.post(
    "/",
    response_model=JobResponse
)
def create_job_posting(
    data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can create jobs"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    company = db.query(Company).filter(
        Company.recruiter_id == recruiter.id
    ).first()

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    job = create_job(
        db=db,
        company=company,
        data=data
    )

    return job


@router.get(
    "/my-jobs",
    response_model=list[JobResponse]
)
def get_my_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can access jobs"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    company = db.query(Company).filter(
        Company.recruiter_id == recruiter.id
    ).first()

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    jobs = db.query(Job).filter(
        Job.company_id == company.id
    ).all()

    return jobs