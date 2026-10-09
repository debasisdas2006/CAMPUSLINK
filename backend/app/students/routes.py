from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.students.student_model import (
    Student,
    StudentEducation,
    StudentSkill,
    Skill,
)
from app.students.schemas import (
    StudentProfileCreate,
    StudentProfileResponse,
)

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


def require_student(current_user):
    if str(current_user.role).upper() != "STUDENT":
        raise HTTPException(
            status_code=403,
            detail="Only students can access this profile",
        )


@router.get(
    "/profile",
    response_model=StudentProfileResponse,
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_student(current_user)

    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found",
        )

    education = (
        db.query(StudentEducation)
        .filter(StudentEducation.student_id == student.id)
        .order_by(StudentEducation.education_id.desc())
        .first()
    )

    skill_rows = (
        db.query(StudentSkill, Skill)
        .join(
            Skill,
            Skill.id == StudentSkill.skill_id,
        )
        .filter(StudentSkill.student_id == student.id)
        .order_by(
            StudentSkill.is_primary.desc(),
            Skill.skill_name,
        )
        .all()
    )

    programming_languages = []
    technical_skills = []

    for student_skill, skill in skill_rows:
        if skill.skill_type == "PROGRAMMING_LANGUAGE":
            programming_languages.append(skill.skill_name)
        else:
            technical_skills.append(skill.skill_name)

    full_name = student.first_name

    if student.last_name:
        full_name = f"{student.first_name} {student.last_name}"

    return {
        "id": student.id,
        "user_id": student.user_id,
        "full_name": full_name,
        "email": current_user.email,

        "degree": (
            education.degree
            if education
            else None
        ),

        "branch": (
            education.specialization
            if education
            else None
        ),

        "cgpa": (
            float(education.cgpa)
            if education and education.cgpa is not None
            else None
        ),

        "graduation_year": (
            education.graduation_year
            if education
            else None
        ),

        "experience_years": (
            float(student.total_experience_years or 0)
        ),

        "programming_languages": (
            ", ".join(programming_languages)
            if programming_languages
            else None
        ),

        "technical_skills": (
            ", ".join(technical_skills)
            if technical_skills
            else None
        ),

        "resume_url": None,

        "profile_summary": student.profile_summary,
    }


@router.put(
    "/profile",
    response_model=StudentProfileResponse,
)
def update_my_profile(
    data: StudentProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_student(current_user)

    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found",
        )

    education = (
        db.query(StudentEducation)
        .filter(StudentEducation.student_id == student.id)
        .order_by(StudentEducation.education_id.desc())
        .first()
    )

    if education:
        if data.degree is not None:
            education.degree = data.degree

        if data.branch is not None:
            education.specialization = data.branch

        if data.cgpa is not None:
            education.cgpa = data.cgpa

        if data.graduation_year is not None:
            education.graduation_year = data.graduation_year

    if data.experience_years is not None:
        student.total_experience_years = data.experience_years

    if data.profile_summary is not None:
        student.profile_summary = data.profile_summary

    db.commit()
    db.refresh(student)

    return get_my_profile(
        db=db,
        current_user=current_user,
    )
