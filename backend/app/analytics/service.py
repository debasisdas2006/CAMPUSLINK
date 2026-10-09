from sqlalchemy.orm import Session
from sqlalchemy import func

from app.students.student_model import Student
from app.companies.company_model import Company
from app.jobs.job_model import Job
from app.applications.application_model import Application


def get_placement_analytics(db: Session) -> dict:
    total_students = db.query(Student).count()
    total_companies = db.query(Company).count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(Application).count()

    selected_students = (
        db.query(Application)
        .filter(Application.status == "selected")
        .count()
    )

    pending_applications = (
        db.query(Application)
        .filter(Application.status == "pending")
        .count()
    )

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "selected_students": selected_students,
        "pending_applications": pending_applications,
    }


def get_company_analytics(
    db: Session,
    company_id: int
) -> dict:

    company = (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )

    if not company:
        raise ValueError("Company not found")

    total_jobs = (
        db.query(Job)
        .filter(Job.company_id == company_id)
        .count()
    )

    total_applications = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.company_id == company_id)
        .count()
    )

    return {
        "company_id": company_id,
        "company_name": getattr(company, "name", "Unknown"),
        "total_jobs": total_jobs,
        "total_applications": total_applications,
    }


def get_job_analytics(
    db: Session,
    job_id: int
) -> dict:

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise ValueError("Job not found")

    total_applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .count()
    )

    selected_applications = (
        db.query(Application)
        .filter(
            Application.job_id == job_id,
            Application.status == "selected"
        )
        .count()
    )

    return {
        "job_id": job_id,
        "job_title": getattr(job, "title", "Unknown"),
        "total_applications": total_applications,
        "selected_applications": selected_applications,
    }