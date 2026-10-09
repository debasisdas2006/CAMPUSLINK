from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.recruiters.recruiter_model import Recruiter
from app.recruiters.schemas import RecruiterProfileCreate


def create_recruiter_profile(
    db: Session,
    user: User,
    data: RecruiterProfileCreate
):
    existing_profile = db.query(Recruiter).filter(
        Recruiter.user_id == user.id
    ).first()

    if existing_profile:
        return None

    recruiter = Recruiter(
        user_id=user.id,
        full_name=user.name,
        email=user.email,
        company_name=data.company_name,
        designation=data.designation,
        phone=data.phone,
        company_description=data.company_description
    )

    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

    return recruiter