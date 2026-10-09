from sqlalchemy.orm import Session

from app.jobs.job_model import Job
from app.jobs.schemas import JobCreate
from app.companies.company_model import Company


def create_job(
    db: Session,
    company: Company,
    data: JobCreate
):
    job = Job(
        company_id=company.id,
        job_title=data.job_title,
        description=data.description,
        degree_required=data.degree_required,
        minimum_cgpa=data.minimum_cgpa,
        experience_required=data.experience_required,
        programming_languages=data.programming_languages,
        technical_skills=data.technical_skills,
        vacancies=data.vacancies,
        location=data.location
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job