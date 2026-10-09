from datetime import datetime

from sqlalchemy.orm import Session

from app.tests.test_model import AssessmentTest
from app.tests.question_model import AssessmentQuestion
from app.tests.attempt_model import TestAttempt

from app.tests.schemas import (
    AssessmentTestCreate,
    AssessmentQuestionCreate,
    TestSubmitRequest
)

from app.students.student_model import Student


# =========================================================
# CREATE TEST
# =========================================================

def create_test(
    db: Session,
    data: AssessmentTestCreate,
    created_by: int
):
    test = AssessmentTest(
        title=data.title,
        description=data.description,
        skill=data.skill,
        duration_minutes=data.duration_minutes,
        passing_score=data.passing_score,
        total_questions=0,
        created_by=created_by
    )

    db.add(test)
    db.commit()
    db.refresh(test)

    return test


# =========================================================
# GET ALL TESTS
# =========================================================

def get_all_tests(db: Session):
    return db.query(AssessmentTest).all()


# =========================================================
# GET TEST BY ID
# =========================================================

def get_test_by_id(
    db: Session,
    test_id: int
):
    return db.query(AssessmentTest).filter(
        AssessmentTest.id == test_id
    ).first()


# =========================================================
# ADD QUESTION
# =========================================================

def create_question(
    db: Session,
    data: AssessmentQuestionCreate
):
    test = db.query(AssessmentTest).filter(
        AssessmentTest.id == data.test_id
    ).first()

    if test is None:
        return None, "Test not found"

    allowed_answers = ["A", "B", "C", "D"]

    correct_answer = data.correct_answer.upper()

    if correct_answer not in allowed_answers:
        return None, "Correct answer must be A, B, C or D"

    question = AssessmentQuestion(
        test_id=data.test_id,
        question=data.question,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_answer=correct_answer,
        marks=data.marks
    )

    db.add(question)

    test.total_questions += 1

    db.commit()
    db.refresh(question)

    return question, None


# =========================================================
# GET QUESTIONS FOR A TEST
# =========================================================

def get_test_questions(
    db: Session,
    test_id: int
):
    test = db.query(AssessmentTest).filter(
        AssessmentTest.id == test_id
    ).first()

    if test is None:
        return None, "Test not found"

    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.test_id == test_id
    ).all()

    return questions, None


# =========================================================
# SUBMIT TEST
# =========================================================

def submit_test(
    db: Session,
    student: Student,
    data: TestSubmitRequest
):
    test = db.query(AssessmentTest).filter(
        AssessmentTest.id == data.test_id
    ).first()

    if test is None:
        return None, "Test not found"

    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.test_id == data.test_id
    ).all()

    if not questions:
        return None, "This test has no questions"

    question_map = {
        question.id: question
        for question in questions
    }

    score = 0.0
    total_marks = 0.0

    for question in questions:
        total_marks += question.marks

    for answer in data.answers:

        question = question_map.get(answer.question_id)

        if question is None:
            continue

        selected_answer = answer.selected_answer.upper()

        if selected_answer == question.correct_answer:
            score += question.marks

    if total_marks > 0:
        percentage = (score / total_marks) * 100
    else:
        percentage = 0

    passed = percentage >= test.passing_score

    attempt = TestAttempt(
        test_id=data.test_id,
        student_id=student.id,
        score=score,
        total_marks=total_marks,
        percentage=percentage,
        passed=passed,
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow()
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt, None


# =========================================================
# GET STUDENT ATTEMPTS
# =========================================================

def get_student_attempts(
    db: Session,
    student: Student
):
    return db.query(TestAttempt).filter(
        TestAttempt.student_id == student.id
    ).all()