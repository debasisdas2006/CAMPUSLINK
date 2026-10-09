from sqlalchemy.orm import Session

from app.students.student_model import Student
from app.companies.company_model import Company
from app.jobs.job_model import Job
from app.applications.application_model import Application
from app.interviews.interview_model import Interview
from app.tests.test_model import AssessmentTest


def check_system_health(db: Session) -> dict:
    database_status = "connected"

    try:
        db.execute("SELECT 1")
    except Exception:
        database_status = "disconnected"

    return {
        "status": "healthy" if database_status == "connected" else "unhealthy",
        "database": database_status,
        "api_version": "1.0.0"
    }


def get_system_statistics(db: Session) -> dict:
    total_students = db.query(Student).count()
    total_companies = db.query(Company).count()
    total_jobs = db.query(Job).count()
    total_applications = db.query(Application).count()
    total_interviews = db.query(Interview).count()
    total_tests = db.query(AssessmentTest).count()

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "total_interviews": total_interviews,
        "total_tests": total_tests
    }