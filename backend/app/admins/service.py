from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.students.student_model import Student
from app.companies.company_model import Company
from app.jobs.job_model import Job
from app.applications.application_model import Application


def get_admin_dashboard(db: Session) -> dict:
    total_students = db.query(Student).count()
    total_companies = db.query(Company).count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(Application).count()

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
    }


def get_all_users(db: Session) -> list:
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
        for user in users
    ]