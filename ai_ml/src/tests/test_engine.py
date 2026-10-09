"""
CAMPUSLINK - MCQ Test Engine

Reusable test-session engine.

Responsibilities:
    1. Create a test
    2. Start a test
    3. Provide student-safe questions
    4. Accept answers
    5. Track progress
    6. Submit the complete test
    7. Evaluate only after submission
    8. Return student-safe result
    9. Return detailed recruiter/admin result

Important:
    - No immediate correct/incorrect feedback.
    - Correct answers remain internal.
    - Evaluation occurs only after final submission.
"""

import sys
from pathlib import Path
from datetime import datetime
from uuid import uuid4
from typing import Any, Dict, List, Optional


# =========================================================
# PROJECT ROOT
# =========================================================

ROOT_DIR = Path(__file__).resolve().parents[2]

if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))


# =========================================================
# IMPORTS
# =========================================================

from src.interview.question_selector import (
    select_questions
)

from src.tests.mcq_evaluator import (
    evaluate_mcq_test,
    create_student_result,
    create_recruiter_result
)


# =========================================================
# VALID ANSWERS
# =========================================================

VALID_ANSWERS = {
    "A",
    "B",
    "C",
    "D"
}


# =========================================================
# TEST ENGINE
# =========================================================

class MCQTestEngine:
    """
    Generic MCQ test engine.

    Can be used for:

        SELF_ASSESSMENT
        TECHNICAL_TEST
        INTERVIEW_MCQ
        PRACTICE_TEST
    """

    def __init__(
        self,
        student_id: str,
        student_name: str,
        skills: List[str],
        test_type: str = "SELF_ASSESSMENT",
        total_questions: int = 10,
        difficulty_distribution: Optional[
            Dict[str, int]
        ] = None
    ):

        # -------------------------------------------------
        # TEST IDENTITY
        # -------------------------------------------------

        self.test_id = str(uuid4())

        self.student_id = student_id

        self.student_name = student_name

        self.test_type = test_type

        self.skills = skills

        self.total_questions = total_questions

        self.difficulty_distribution = (
            difficulty_distribution
            or {
                "easy": 40,
                "medium": 40,
                "hard": 20
            }
        )

        # -------------------------------------------------
        # QUESTIONS
        # -------------------------------------------------

        self.questions: List[
            Dict[str, Any]
        ] = []

        self.student_questions: List[
            Dict[str, Any]
        ] = []

        # -------------------------------------------------
        # ANSWERS
        # -------------------------------------------------

        self.student_answers: Dict[
            str, str
        ] = {}

        # -------------------------------------------------
        # STATUS
        # -------------------------------------------------

        self.status = "CREATED"

        self.started_at: Optional[
            str
        ] = None

        self.submitted_at: Optional[
            str
        ] = None

        # -------------------------------------------------
        # EVALUATION
        # -------------------------------------------------

        self.evaluation: Optional[
            Dict[str, Any]
        ] = None

    # =====================================================
    # CREATE QUESTIONS
    # =====================================================

    def generate_test(self) -> None:
        """
        Generate the internal question set.

        This method does not expose answers.
        """

        if self.questions:
            return

        self.questions = select_questions(
            skills=self.skills,
            total_questions=self.total_questions,
            difficulty_distribution=(
                self.difficulty_distribution
            )
        )

        # -------------------------------------------------
        # CREATE STUDENT-SAFE VERSION
        # -------------------------------------------------

        self.student_questions = []

        for question in self.questions:

            student_question = {
                "question_id": question.get(
                    "question_id"
                ),
                "skill": question.get(
                    "skill"
                ),
                "difficulty": question.get(
                    "difficulty"
                ),
                "question": question.get(
                    "question"
                ),
                "options": question.get(
                    "options"
                )
            }

            self.student_questions.append(
                student_question
            )

    # =====================================================
    # START TEST
    # =====================================================

    def start(self) -> Dict[str, Any]:
        """
        Start the test and return student-safe questions.
        """

        if self.status == "SUBMITTED":
            raise ValueError(
                "Test has already been submitted."
            )

        if self.status == "IN_PROGRESS":
            return self.get_student_test()

        self.generate_test()

        self.status = "IN_PROGRESS"

        self.started_at = (
            datetime.now().isoformat()
        )

        return self.get_student_test()

    # =====================================================
    # GET STUDENT TEST
    # =====================================================

    def get_student_test(self) -> Dict[str, Any]:
        """
        Return only information safe for the student.
        """

        if not self.student_questions:
            self.generate_test()

        return {
            "test_id": self.test_id,

            "student_id": self.student_id,

            "student_name": self.student_name,

            "test_type": self.test_type,

            "status": self.status,

            "total_questions": len(
                self.student_questions
            ),

            "skills": self.skills,

            "questions": self.student_questions
        }

    # =====================================================
    # SUBMIT ANSWER
    # =====================================================

    def submit_answer(
        self,
        question_id: str,
        answer: Any
    ) -> Dict[str, Any]:
        """
        Store one answer.

        NO evaluation happens here.
        """

        if self.status != "IN_PROGRESS":
            raise ValueError(
                "Test is not currently in progress."
            )

        # -------------------------------------------------
        # CHECK QUESTION
        # -------------------------------------------------

        question_exists = any(
            question.get("question_id")
            == question_id
            for question in self.questions
        )

        if not question_exists:
            raise ValueError(
                f"Invalid question ID: {question_id}"
            )

        # -------------------------------------------------
        # NORMALIZE ANSWER
        # -------------------------------------------------

        normalized_answer = (
            str(answer).strip().upper()
            if answer is not None
            else ""
        )

        if normalized_answer not in VALID_ANSWERS:
            raise ValueError(
                "Answer must be A, B, C, or D."
            )

        # -------------------------------------------------
        # SAVE ANSWER
        # -------------------------------------------------

        self.student_answers[
            question_id
        ] = normalized_answer

        # -------------------------------------------------
        # IMPORTANT SECURITY RULE
        # -------------------------------------------------

        return {
            "test_id": self.test_id,
            "question_id": question_id,
            "status": "answer_recorded"
        }

    # =====================================================
    # GET PROGRESS
    # =====================================================

    def get_progress(self) -> Dict[str, Any]:
        """
        Return test completion progress.

        This is NOT performance.
        """

        total = len(self.questions)

        answered = len(
            self.student_answers
        )

        unanswered = total - answered

        progress_percentage = (
            round(
                (answered / total) * 100,
                2
            )
            if total > 0
            else 0.0
        )

        return {
            "test_id": self.test_id,

            "status": self.status,

            "total_questions": total,

            "answered": answered,

            "unanswered": unanswered,

            "progress_percentage":
                progress_percentage
        }

    # =====================================================
    # SUBMIT TEST
    # =====================================================

    def submit_test(self) -> Dict[str, Any]:
        """
        Final test submission.

        Evaluation happens ONLY here.
        """

        if self.status != "IN_PROGRESS":
            raise ValueError(
                "Test is not currently in progress."
            )

        # -------------------------------------------------
        # FINAL EVALUATION
        # -------------------------------------------------

        self.evaluation = evaluate_mcq_test(
            questions=self.questions,
            student_answers=self.student_answers
        )

        self.status = "SUBMITTED"

        self.submitted_at = (
            datetime.now().isoformat()
        )

        # -------------------------------------------------
        # RETURN STUDENT-SAFE RESULT
        # -------------------------------------------------

        return self.get_student_result()

    # =====================================================
    # STUDENT RESULT
    # =====================================================

    def get_student_result(self) -> Dict[str, Any]:
        """
        Return student-safe performance result.
        """

        if self.status != "SUBMITTED":
            raise ValueError(
                "Test has not been submitted."
            )

        if self.evaluation is None:
            raise ValueError(
                "Evaluation is not available."
            )

        result = create_student_result(
            self.evaluation
        )

        return {
            "test_id": self.test_id,

            "student_id": self.student_id,

            "student_name": self.student_name,

            "test_type": self.test_type,

            "started_at": self.started_at,

            "submitted_at": self.submitted_at,

            "result": result
        }

    # =====================================================
    # RECRUITER RESULT
    # =====================================================

    def get_recruiter_result(
        self
    ) -> Dict[str, Any]:
        """
        Return complete evaluation.

        Intended for recruiter/interviewer/admin.
        """

        if self.status != "SUBMITTED":
            raise ValueError(
                "Test has not been submitted."
            )

        if self.evaluation is None:
            raise ValueError(
                "Evaluation is not available."
            )

        result = create_recruiter_result(
            self.evaluation
        )

        return {
            "test_id": self.test_id,

            "student_id": self.student_id,

            "student_name": self.student_name,

            "test_type": self.test_type,

            "started_at": self.started_at,

            "submitted_at": self.submitted_at,

            "evaluation": result
        }

    # =====================================================
    # INTERNAL QUESTION DATA
    # =====================================================

    def get_internal_questions(
        self
    ) -> List[Dict[str, Any]]:
        """
        Internal-only method.

        Contains correct answers and explanations.

        Do NOT expose this through student APIs.
        """

        return self.questions


# =========================================================
# DEMO
# =========================================================

if __name__ == "__main__":

    print("\n")
    print("=" * 70)
    print("CAMPUSLINK - MCQ TEST ENGINE")
    print("=" * 70)

    # -----------------------------------------------------
    # CREATE TEST
    # -----------------------------------------------------

    test = MCQTestEngine(
        student_id="STU001",
        student_name="Demo Student",
        skills=[
            "Python",
            "SQL",
            "OOP",
            "DSA"
        ],
        test_type="TECHNICAL_TEST",
        total_questions=8
    )

    # -----------------------------------------------------
    # START
    # -----------------------------------------------------

    student_test = test.start()

    print("\nTEST STARTED")

    print(
        f"Test ID: "
        f"{student_test['test_id']}"
    )

    print(
        f"Student: "
        f"{student_test['student_name']}"
    )

    print(
        f"Test Type: "
        f"{student_test['test_type']}"
    )

    print(
        f"Total Questions: "
        f"{student_test['total_questions']}"
    )

    # -----------------------------------------------------
    # SECURITY CHECK
    # -----------------------------------------------------

    print("\nSECURITY CHECK")

    for question in student_test["questions"]:

        assert (
            "correct_answer"
            not in question
        )

        assert (
            "explanation"
            not in question
        )

    print(
        "PASS - Correct answers are hidden."
    )

    # -----------------------------------------------------
    # SUBMIT ANSWERS
    # -----------------------------------------------------

    print("\nSUBMITTING ANSWERS")

    answer_pattern = [
        "A",
        "B",
        "C",
        "D"
    ]

    for index, question in enumerate(
        test.questions
    ):

        question_id = question[
            "question_id"
        ]

        answer = answer_pattern[
            index % len(answer_pattern)
        ]

        response = test.submit_answer(
            question_id,
            answer
        )

        print(response)

    # -----------------------------------------------------
    # PROGRESS
    # -----------------------------------------------------

    print("\nPROGRESS")

    print(
        test.get_progress()
    )

    # -----------------------------------------------------
    # FINAL SUBMISSION
    # -----------------------------------------------------

    print("\nFINAL SUBMISSION")

    student_result = test.submit_test()

    print(
        student_result
    )

    # -----------------------------------------------------
    # RECRUITER RESULT
    # -----------------------------------------------------

    print("\nRECRUITER / ADMIN RESULT")

    recruiter_result = (
        test.get_recruiter_result()
    )

    print(
        recruiter_result
    )

    print("\n")
    print("=" * 70)
    print("MCQ TEST ENGINE COMPLETE")
    print("=" * 70)