from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.recruiters.schemas import (
    RecruiterProfileCreate,
    RecruiterProfileResponse
)

from app.recruiters.service import create_recruiter_profile
from app.recruiters.recruiter_model import Recruiter


router = APIRouter(
    prefix="/recruiters",
    tags=["Recruiters"]
)


@router.post(
    "/profile",
    response_model=RecruiterProfileResponse
)
def create_profile(
    data: RecruiterProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can create a recruiter profile"
        )

    recruiter = create_recruiter_profile(
        db=db,
        user=current_user,
        data=data
    )

    if recruiter is None:
        raise HTTPException(
            status_code=400,
            detail="Recruiter profile already exists"
        )

    return recruiter


@router.get(
    "/profile",
    response_model=RecruiterProfileResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can access this profile"
        )

    recruiter = db.query(Recruiter).filter(
        Recruiter.user_id == current_user.id
    ).first()

    if recruiter is None:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    return recruiter