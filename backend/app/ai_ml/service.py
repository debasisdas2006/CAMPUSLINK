from sqlalchemy.orm import Session

from app.students.student_model import Student
from app.jobs.job_model import Job

from app.ai_ml.matching import calculate_match_score


def get_student_data(db: Session, student_id: int) -> dict:
    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        return {}

    skills = getattr(student, "skills", None)

    if isinstance(skills, str):
        skills = [skill.strip() for skill in skills.split(",") if skill.strip()]

    if not skills:
        skills = []

    return {
        "skills": skills
    }


def get_job_data(db: Session, job_id: int) -> dict:
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        return {}

    required_skills = getattr(job, "required_skills", None)

    if isinstance(required_skills, str):
        required_skills = [
            skill.strip()
            for skill in required_skills.split(",")
            if skill.strip()
        ]

    if not required_skills:
        required_skills = []

    return {
        "required_skills": required_skills
    }


def match_student_with_job(
    db: Session,
    student_id: int,
    job_id: int
) -> dict:

    student_data = get_student_data(db, student_id)
    job_data = get_job_data(db, job_id)

    if not student_data:
        raise ValueError("Student not found")

    if not job_data:
        raise ValueError("Job not found")

    score, reasons = calculate_match_score(
        student_data,
        job_data
    )

    return {
        "student_id": student_id,
        "job_id": job_id,
        "match_score": score,
        "reasons": reasons
    }