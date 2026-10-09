from sqlalchemy.orm import Session

from app.interviews.interview_model import Interview
from app.interviews.question_model import InterviewQuestion

from app.interviews.schemas import (
    InterviewCreate,
    InterviewUpdate,
    InterviewQuestionCreate,
    InterviewQuestionUpdate
)

from app.students.student_model import Student
from app.jobs.job_model import Job
from app.recruiters.recruiter_model import Recruiter
from app.companies.company_model import Company


# ==========================================
# CREATE INTERVIEW
# ==========================================

def create_interview(
    db: Session,
    recruiter: Recruiter,
    data: InterviewCreate
):
    student = db.query(Student).filter(
        Student.id == data.student_id
    ).first()

    if student is None:
        return None, "Student not found"

    job = db.query(Job).filter(
        Job.id == data.job_id
    ).first()

    if job is None:
        return None, "Job not found"

    company = db.query(Company).filter(
        Company.recruiter_id == recruiter.id,
        Company.id == job.company_id
    ).first()

    if company is None:
        return None, "You are not authorized for this job"

    existing_interview = db.query(Interview).filter(
        Interview.student_id == data.student_id,
        Interview.job_id == data.job_id,
        Interview.recruiter_id == recruiter.id
    ).first()

    if existing_interview:
        return None, "Interview already exists"

    interview = Interview(
        student_id=data.student_id,
        job_id=data.job_id,
        recruiter_id=recruiter.id,
        scheduled_at=data.scheduled_at,
        status="scheduled"
    )

    db.add(interview)
    db.commit()
    db.refresh(interview)

    return interview, None


# ==========================================
# GET RECRUITER INTERVIEWS
# ==========================================

def get_recruiter_interviews(
    db: Session,
    recruiter: Recruiter
):
    return db.query(Interview).filter(
        Interview.recruiter_id == recruiter.id
    ).all()


# ==========================================
# GET STUDENT INTERVIEWS
# ==========================================

def get_student_interviews(
    db: Session,
    student: Student
):
    return db.query(Interview).filter(
        Interview.student_id == student.id
    ).all()


# ==========================================
# UPDATE INTERVIEW
# ==========================================

def update_interview(
    db: Session,
    recruiter: Recruiter,
    interview_id: int,
    data: InterviewUpdate
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.recruiter_id == recruiter.id
    ).first()

    if interview is None:
        return None, "Interview not found or unauthorized"

    allowed_statuses = [
        "scheduled",
        "ongoing",
        "completed",
        "cancelled"
    ]

    if data.status is not None:
        if data.status not in allowed_statuses:
            return None, (
                "Invalid status. Allowed statuses: "
                "scheduled, ongoing, completed, cancelled"
            )

        interview.status = data.status

    if data.scheduled_at is not None:
        interview.scheduled_at = data.scheduled_at

    if data.result is not None:
        interview.result = data.result

    if data.feedback is not None:
        interview.feedback = data.feedback

    if data.score is not None:
        if data.score < 0 or data.score > 100:
            return None, "Score must be between 0 and 100"

        interview.score = data.score

    db.commit()
    db.refresh(interview)

    return interview, None


# ==========================================
# CREATE INTERVIEW QUESTION
# ==========================================

def create_interview_question(
    db: Session,
    recruiter: Recruiter,
    data: InterviewQuestionCreate
):
    # Find interview belonging to recruiter
    interview = db.query(Interview).filter(
        Interview.id == data.interview_id,
        Interview.recruiter_id == recruiter.id
    ).first()

    if interview is None:
        return None, "Interview not found or unauthorized"

    # Create question
    question = InterviewQuestion(
        interview_id=data.interview_id,
        question=data.question
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question, None


# ==========================================
# GET INTERVIEW QUESTIONS
# ==========================================

def get_interview_questions(
    db: Session,
    interview_id: int,
    current_user_id: int,
    current_user_role: str
):
    # Find interview
    interview = db.query(Interview).filter(
        Interview.id == interview_id
    ).first()

    if interview is None:
        return None, "Interview not found"

    # Check access
    if current_user_role == "recruiter":
        recruiter = db.query(Recruiter).filter(
            Recruiter.user_id == current_user_id
        ).first()

        if recruiter is None or interview.recruiter_id != recruiter.id:
            return None, "You are not authorized to view this interview"

    elif current_user_role == "student":
        student = db.query(Student).filter(
            Student.user_id == current_user_id
        ).first()

        if student is None or interview.student_id != student.id:
            return None, "You are not authorized to view this interview"

    else:
        return None, "Invalid user role"

    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.interview_id == interview_id
    ).all()

    return questions, None


# ==========================================
# UPDATE INTERVIEW QUESTION / ANSWER
# ==========================================

def update_interview_question(
    db: Session,
    recruiter: Recruiter,
    question_id: int,
    data: InterviewQuestionUpdate
):
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == question_id
    ).first()

    if question is None:
        return None, "Question not found"

    # Verify recruiter owns the interview
    interview = db.query(Interview).filter(
        Interview.id == question.interview_id,
        Interview.recruiter_id == recruiter.id
    ).first()

    if interview is None:
        return None, "You are not authorized to update this question"

    if data.answer is not None:
        question.answer = data.answer

    if data.evaluation is not None:
        question.evaluation = data.evaluation

    if data.score is not None:
        if data.score < 0 or data.score > 10:
            return None, "Question score must be between 0 and 10"

        question.score = data.score

    db.commit()
    db.refresh(question)

    return question, None