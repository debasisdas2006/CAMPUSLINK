from sqlalchemy.orm import Session

from app.applications.application_model import Application
from app.applications.schemas import ApplicationCreate

from app.students.student_model import Student
from app.jobs.job_model import Job
from app.companies.company_model import Company
from app.recruiters.recruiter_model import Recruiter


# ==========================================
# CREATE STUDENT APPLICATION
# ==========================================

def create_application(
    db: Session,
    student: Student,
    data: ApplicationCreate
):
    job = db.query(Job).filter(
        Job.id == data.job_id
    ).first()

    if job is None:
        return None, "Job not found"

    existing_application = db.query(Application).filter(
        Application.student_id == student.id,
        Application.job_id == data.job_id
    ).first()

    if existing_application:
        return None, "You have already applied for this job"

    application = Application(
        student_id=student.id,
        job_id=data.job_id,
        status="applied",
        cover_message=data.cover_message
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application, None


# ==========================================
# GET RECRUITER APPLICATIONS
# ==========================================

def get_recruiter_applications(
    db: Session,
    recruiter: Recruiter
):
    company = db.query(Company).filter(
        Company.recruiter_id == recruiter.id
    ).first()

    if company is None:
        return None

    jobs = db.query(Job).filter(
        Job.company_id == company.id
    ).all()

    job_ids = [job.id for job in jobs]

    if not job_ids:
        return []

    applications = db.query(Application).filter(
        Application.job_id.in_(job_ids)
    ).all()

    return applications


# ==========================================
# UPDATE APPLICATION STATUS
# ==========================================

def update_application_status(
    db: Session,
    recruiter: Recruiter,
    application_id: int,
    new_status: str
):
    company = db.query(Company).filter(
        Company.recruiter_id == recruiter.id
    ).first()

    if company is None:
        return None, "Company profile not found"

    application = db.query(Application).filter(
        Application.id == application_id
    ).first()

    if application is None:
        return None, "Application not found"

    job = db.query(Job).filter(
        Job.id == application.job_id,
        Job.company_id == company.id
    ).first()

    if job is None:
        return None, "You are not authorized to update this application"

    allowed_statuses = [
        "applied",
        "shortlisted",
        "interview",
        "selected",
        "rejected"
    ]

    if new_status not in allowed_statuses:
        return None, (
            "Invalid status. Allowed statuses: "
            "applied, shortlisted, interview, selected, rejected"
        )

    application.status = new_status

    db.commit()
    db.refresh(application)

    return application, None


# ==========================================
# GET STUDENT APPLICATIONS
# ==========================================

def get_student_applications(
    db: Session,
    student: Student
):
    applications = db.query(Application).filter(
        Application.student_id == student.id
    ).all()

    return applications