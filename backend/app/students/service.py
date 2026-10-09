from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.students.student_model import (
    Student,
    StudentEducation,
    StudentSkill,
    Skill,
)
from app.students.schemas import StudentProfileCreate


def create_student_profile(
    db: Session,
    user: User,
    data: StudentProfileCreate,
):
    existing_profile = (
        db.query(Student)
        .filter(Student.user_id == user.id)
        .first()
    )

    if existing_profile:
        return existing_profile

    student = Student(
        user_id=user.id,
        college_id=1,
        first_name=user.name,
        last_name=None,
        phone=None,
        date_of_birth=None,
        gender=None,
        profile_summary=data.profile_summary,
        total_experience_years=data.experience_years or 0,
    )

    db.add(student)
    db.flush()

    if data.degree:
        education = StudentEducation(
            student_id=student.id,
            education_level="UNDERGRADUATE",
            degree=data.degree,
            specialization=data.branch,
            institution_name="CampusLink Demo College",
            university_name="BPUT",
            cgpa=data.cgpa,
            maximum_cgpa=10,
            graduation_year=data.graduation_year,
            start_year=None,
            end_year=None,
        )

        db.add(education)

    db.commit()
    db.refresh(student)

    return student