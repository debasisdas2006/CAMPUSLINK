from sqlalchemy.orm import Session

from app.companies.company_model import Company
from app.companies.schemas import CompanyCreate
from app.recruiters.recruiter_model import Recruiter


def create_company(
    db: Session,
    recruiter: Recruiter,
    data: CompanyCreate
):
    company = Company(
        recruiter_id=recruiter.id,
        company_name=data.company_name,
        industry=data.industry,
        website=data.website,
        location=data.location,
        description=data.description
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company