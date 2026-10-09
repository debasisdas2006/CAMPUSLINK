"""
Student Self-Assessment
-----------------------

Flow:

Student
   ↓
Start assessment
   ↓
Receive MCQs
   ↓
Answer questions
   ↓
No immediate correct/incorrect feedback
   ↓
Submit complete assessment
   ↓
MCQ Evaluator
   ↓
Student receives performance result

Important:
- Correct answers are never sent to the student during the test.
- Evaluation happens only after final submission.
- Detailed evaluation remains internal.
"""

import sys
from pathlib import Path
from datetime import datetime
from uuid import uuid4
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------
# PROJECT ROOT
# ---------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parents[2]

if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))


# ---------------------------------------------------------
# IMPORTS
# ---------------------------------------------------------

from src.interview.question_selector import (
    select_questions,
    create_student_test
)

from src.tests.mcq_evaluator import (
    evaluate_mcq_test,
    create_student_result,
    create_recruiter_result
)


# ---------------------------------------------------------
# SELF ASSESSMENT CLASS
# ---------------------------------------------------------

class SelfAssessment:
    """
    Manages one student's self-assessment session.
    """

    def __init__(
        self,
        student_id: str,
        student_name: str,
        skills: List[str],
        total_questions: int = 10,
        difficulty_distribution: Optional[
            Dict[str, int]
        ] = None
    ):

        self.assessment_id = str(uuid4())

        self.student_id = student_id
        self.student_name = student_name

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

        # Internal complete questions.
        #
        # These contain:
        # - correct_answer
        # - explanation
        #
        # They must NEVER be returned directly
        # to the student.
        self.questions: List[
            Dict[str, Any]
        ] = []

        # Student-safe questions.
        #
        # These contain only:
        # - question
        # - options
        # - skill
        # - difficulty
        # - question_id
        self.student_questions: List[
            Dict[str, Any]
        ] = []

        # Student answers.
        #
        # Example:
        # {
        #     "PY001": "A",
        #     "PY002": "C"
        # }
        self.student_answers: Dict[
            str, str
        ] = {}

        self.started_at: Optional[
            str
        ] = None

        self.submitted_at: Optional[
            str
        ] = None

        self.started = False
        self.completed = False

        # Complete internal evaluation.
        self.evaluation: Optional[
            Dict[str, Any]
        ] = None

    # -----------------------------------------------------
    # START ASSESSMENT
    # -----------------------------------------------------

    def start(self) -> Dict[str, Any]:
        """
        Generate questions and start the assessment.

        Returns only student-safe questions.
        """

        if self.started:
            return self.get_student_test()

        self.questions = select_questions(
            skills=self.skills,
            total_questions=self.total_questions,
            difficulty_distribution=(
                self.difficulty_distribution
            )
        )

        self.student_questions = create_student_test(
            skills=self.skills,
            total_questions=self.total_questions,
            difficulty_distribution=(
                self.difficulty_distribution
            )
        )

        # Make sure the student-safe questions correspond
        # to the same internal questions.
        #
        # The selector generates questions again, so instead
        # of relying on a second random generation, build
        # the student view directly from the selected questions.

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

        self.started = True

        self.started_at = (
            datetime.now().isoformat()
        )

        return self.get_student_test()

    # -----------------------------------------------------
    # GET STUDENT TEST
    # -----------------------------------------------------

    def get_student_test(self) -> Dict[str, Any]:
        """
        Return the test visible to the student.

        Correct answers and explanations are excluded.
        """

        return {
            "assessment_id": self.assessment_id,

            "student_id": self.student_id,

            "student_name": self.student_name,

            "total_questions": len(
                self.student_questions
            ),

            "skills": self.skills,

            "status": (
                "completed"
                if self.completed
                else "in_progress"
            ),

            "questions": self.student_questions
        }

    # -----------------------------------------------------
    # SUBMIT ONE ANSWER
    # -----------------------------------------------------

    def submit_answer(
        self,
        question_id: str,
        answer: Any
    ) -> Dict[str, Any]:
        """
        Store one answer.

        IMPORTANT:
        This function does NOT evaluate the answer.
        """

        if not self.started:
            raise ValueError(
                "Assessment has not been started."
            )

        if self.completed:
            raise ValueError(
                "Assessment has already been submitted."
            )

        question_exists = any(
            question.get("question_id")
            == question_id
            for question in self.questions
        )

        if not question_exists:
            raise ValueError(
                f"Invalid question ID: {question_id}"
            )

        normalized_answer = (
            str(answer).strip().upper()
            if answer is not None
            else ""
        )

        if normalized_answer not in {
            "A",
            "B",
            "C",
            "D"
        }:

            raise ValueError(
                "Answer must be A, B, C, or D."
            )

        self.student_answers[
            question_id
        ] = normalized_answer

        # DO NOT return:
        # - correct_answer
        # - is_correct
        # - explanation
        #
        # Only confirmation is returned.

        return {
            "assessment_id": self.assessment_id,
            "question_id": question_id,
            "status": "answer_recorded"
        }

    # -----------------------------------------------------
    # PROGRESS
    # -----------------------------------------------------

    def get_progress(self) -> Dict[str, Any]:
        """
        Return current assessment progress.
        """

        total = len(self.questions)

        answered = len(
            self.student_answers
        )

        unanswered = total - answered

        percentage = (
            round(
                (answered / total) * 100,
                2
            )
            if total > 0
            else 0.0
        )

        return {
            "assessment_id": self.assessment_id,
            "total_questions": total,
            "answered": answered,
            "unanswered": unanswered,
            "progress_percentage": percentage,
            "status": (
                "completed"
                if self.completed
                else "in_progress"
            )
        }

    # -----------------------------------------------------
    # FINAL SUBMISSION
    # -----------------------------------------------------

    def submit_assessment(self) -> Dict[str, Any]:
        """
        Submit the complete assessment.

        Evaluation happens ONLY here.
        """

        if not self.started:
            raise ValueError(
                "Assessment has not been started."
            )

        if self.completed:
            return self.get_result()

        # -------------------------------------------------
        # EVALUATE ONLY AFTER FINAL SUBMISSION
        # -------------------------------------------------

        self.evaluation = evaluate_mcq_test(
            questions=self.questions,
            student_answers=self.student_answers
        )

        self.completed = True

        self.submitted_at = (
            datetime.now().isoformat()
        )

        return self.get_result()

    # -----------------------------------------------------
    # STUDENT RESULT
    # -----------------------------------------------------

    def get_result(self) -> Dict[str, Any]:
        """
        Return student-safe final result.

        No correct answers or explanations.
        """

        if not self.completed:
            raise ValueError(
                "Assessment has not been submitted yet."
            )

        if self.evaluation is None:
            raise ValueError(
                "Evaluation is not available."
            )

        result = create_student_result(
            self.evaluation
        )

        return {
            "assessment_id": self.assessment_id,

            "student_id": self.student_id,

            "student_name": self.student_name,

            "started_at": self.started_at,

            "submitted_at": self.submitted_at,

            "result": result
        }

    # -----------------------------------------------------
    # DETAILED RECRUITER / ADMIN RESULT
    # -----------------------------------------------------

    def get_detailed_result(
        self
    ) -> Dict[str, Any]:
        """
        Return complete evaluation.

        Intended for:
        - Recruiter
        - Interviewer
        - Admin
        - Internal AI/ML services

        This includes correct answers and explanations.
        """

        if not self.completed:
            raise ValueError(
                "Assessment has not been submitted yet."
            )

        if self.evaluation is None:
            raise ValueError(
                "Evaluation is not available."
            )

        detailed_result = create_recruiter_result(
            self.evaluation
        )

        return {
            "assessment_id": self.assessment_id,

            "student_id": self.student_id,

            "student_name": self.student_name,

            "started_at": self.started_at,

            "submitted_at": self.submitted_at,

            "evaluation": detailed_result
        }


# ---------------------------------------------------------
# DEMO
# ---------------------------------------------------------

if __name__ == "__main__":

    print("\n")
    print("=" * 70)
    print("CAMPUSLINK - STUDENT SELF ASSESSMENT DEMO")
    print("=" * 70)

    # -----------------------------------------------------
    # CREATE ASSESSMENT
    # -----------------------------------------------------

    assessment = SelfAssessment(
        student_id="STU001",
        student_name="Demo Student",
        skills=[
            "Python",
            "SQL",
            "OOP",
            "DSA"
        ],
        total_questions=8
    )

    # -----------------------------------------------------
    # START
    # -----------------------------------------------------

    student_test = assessment.start()

    print("\nSTUDENT TEST")

    print("-" * 70)

    print(
        f"Assessment ID: "
        f"{student_test['assessment_id']}"
    )

    print(
        f"Student: "
        f"{student_test['student_name']}"
    )

    print(
        f"Questions: "
        f"{student_test['total_questions']}"
    )

    # -----------------------------------------------------
    # DISPLAY STUDENT QUESTIONS
    # -----------------------------------------------------

    for question in student_test["questions"]:

        print("\n")

        print(
            f"Question ID: "
            f"{question['question_id']}"
        )

        print(
            f"Skill: "
            f"{question['skill']}"
        )

        print(
            f"Difficulty: "
            f"{question['difficulty']}"
        )

        print(
            f"Question: "
            f"{question['question']}"
        )

        print(
            f"Options: "
            f"{question['options']}"
        )

        # Security check.
        assert (
            "correct_answer"
            not in question
        )

        assert (
            "explanation"
            not in question
        )

    # -----------------------------------------------------
    # SIMULATE STUDENT ANSWERS
    # -----------------------------------------------------

    print("\n")
    print("=" * 70)
    print("SUBMITTING STUDENT ANSWERS")
    print("=" * 70)

    for index, question in enumerate(
        assessment.questions
    ):

        question_id = question[
            "question_id"
        ]

        # Demo answer pattern.
        answers = ["A", "B", "C", "D"]

        answer = answers[
            index % len(answers)
        ]

        response = assessment.submit_answer(
            question_id=question_id,
            answer=answer
        )

        print(response)

        # Verify that no evaluation is returned.
        assert (
            "is_correct"
            not in response
        )

        assert (
            "correct_answer"
            not in response
        )

    # -----------------------------------------------------
    # PROGRESS
    # -----------------------------------------------------

    print("\n")
    print("=" * 70)
    print("ASSESSMENT PROGRESS")
    print("=" * 70)

    print(
        assessment.get_progress()
    )

    # -----------------------------------------------------
    # FINAL SUBMISSION
    # -----------------------------------------------------

    print("\n")
    print("=" * 70)
    print("FINAL SUBMISSION")
    print("=" * 70)

    final_result = (
        assessment.submit_assessment()
    )

    print("\nSTUDENT RESULT:")

    print(final_result)

    # -----------------------------------------------------
    # DETAILED INTERNAL RESULT
    # -----------------------------------------------------

    print("\n")
    print("=" * 70)
    print("RECRUITER / ADMIN RESULT")
    print("=" * 70)

    detailed_result = (
        assessment.get_detailed_result()
    )

    print(detailed_result)

    print("\n")
    print("=" * 70)
    print("SELF-ASSESSMENT DEMO COMPLETE")
    print("=" * 70)