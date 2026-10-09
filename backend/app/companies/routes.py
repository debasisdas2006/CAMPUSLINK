from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.companies.company_model import Company
from app.companies.schemas import (
    CompanyCreate,
    CompanyResponse
)
from app.companies.service import create_company

from app.recruiters.recruiter_model import Recruiter


router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


@router.post(
    "/",
    response_model=CompanyResponse
)
def create_company_profile(
    data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can create a company"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    company = create_company(
        db=db,
        recruiter=recruiter,
        data=data
    )

    return company


@router.get(
    "/my-company",
    response_model=CompanyResponse
)
def get_my_company(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can access company information"
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

    return company