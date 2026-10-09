"""
CAMPUSLINK - Test / Self-Assessment API

Flow:

Student
   ↓
Start Test
   ↓
Generate MCQ Questions
   ↓
Student Answers
   ↓
Submit Final Test
   ↓
Evaluate Answers
   ↓
Performance
   ↓
Student Result / Recruiter Result
"""

import sys
from pathlib import Path
from typing import Any, Dict, List

# ============================================================
# PROJECT ROOT
# ============================================================

ROOT_DIR = Path(__file__).resolve().parents[1]

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


# ============================================================
# IMPORT TEST ENGINE
# ============================================================

from src.tests.test_engine import MCQTestEngine


# ============================================================
# FASTAPI
# ============================================================

try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field

    FASTAPI_AVAILABLE = True

except ImportError:
    FASTAPI_AVAILABLE = False

    FastAPI = None
    BaseModel = object


# ============================================================
# IN-MEMORY TEST SESSIONS
# ============================================================

"""
Temporary development storage.

In the final CAMPUSLINK system, test sessions and results
should be stored through the backend/database.

Authentication and authorization belong to the backend.
"""

TEST_SESSIONS: Dict[str, MCQTestEngine] = {}


# ============================================================
# PYDANTIC MODELS
# ============================================================

if FASTAPI_AVAILABLE:

    class StartTestRequest(BaseModel):
        student_id: str

        student_name: str = ""

        skills: List[str] = Field(
            default_factory=list
        )

        total_questions: int = 10

        test_type: str = "SELF_ASSESSMENT"


    class AnswerRequest(BaseModel):
        question_id: str

        answer: str


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def convert_to_dict(value: Any) -> Dict[str, Any]:
    """
    Safely convert an object into a dictionary.
    """

    if isinstance(value, dict):
        return value

    if hasattr(value, "model_dump"):
        return value.model_dump()

    if hasattr(value, "dict"):
        return value.dict()

    return {}


def extract_questions(test_data: Any) -> List[Dict[str, Any]]:
    """
    Extract the actual question list from the structure
    returned by MCQTestEngine.get_student_test().

    The engine may return:

        [
            {...},
            {...}
        ]

    OR:

        {
            "questions": [
                {...},
                {...}
            ]
        }

    OR another nested structure.

    This function handles the supported structures safely.
    """

    # --------------------------------------------------------
    # Direct list
    # --------------------------------------------------------

    if isinstance(test_data, list):

        return [
            item
            for item in test_data
            if isinstance(item, dict)
        ]


    # --------------------------------------------------------
    # Dictionary
    # --------------------------------------------------------

    if isinstance(test_data, dict):

        possible_keys = [
            "questions",
            "test_questions",
            "items",
            "data",
        ]

        for key in possible_keys:

            value = test_data.get(key)

            if isinstance(value, list):

                return [
                    item
                    for item in value
                    if isinstance(item, dict)
                ]


        # ----------------------------------------------------
        # Nested data
        # ----------------------------------------------------

        data = test_data.get("data")

        if isinstance(data, dict):

            return extract_questions(data)


    return []


def create_test_id(
    student_id: str,
    engine: MCQTestEngine
) -> str:
    """
    Get the test/session identifier.

    Supports the current MCQTestEngine and future versions.
    """

    if hasattr(engine, "test_id"):

        value = getattr(
            engine,
            "test_id"
        )

        if value:
            return str(value)


    if hasattr(engine, "assessment_id"):

        value = getattr(
            engine,
            "assessment_id"
        )

        if value:
            return str(value)


    return f"{student_id}_test"


def get_session(
    test_id: str
) -> MCQTestEngine:
    """
    Retrieve an active test session.
    """

    engine = TEST_SESSIONS.get(
        test_id
    )

    if engine is None:

        raise HTTPException(
            status_code=404,
            detail="Test session not found."
        )

    return engine


# ============================================================
# TEST SERVICE FUNCTIONS
# ============================================================

def start_test(
    student_id: str,
    student_name: str,
    skills: List[str],
    total_questions: int = 10,
    test_type: str = "SELF_ASSESSMENT"
) -> Dict[str, Any]:
    """
    Create and start a new MCQ test.
    """

    if not student_id:

        raise ValueError(
            "student_id is required."
        )


    if not skills:

        raise ValueError(
            "At least one skill is required."
        )


    if total_questions <= 0:

        raise ValueError(
            "total_questions must be greater than 0."
        )


    engine = MCQTestEngine(
        student_id=student_id,

        student_name=student_name,

        skills=skills,

        test_type=test_type,

        total_questions=total_questions,
    )


    # --------------------------------------------------------
    # Generate questions
    # --------------------------------------------------------

    engine.generate_test()


    # --------------------------------------------------------
    # Start test
    # --------------------------------------------------------

    engine.start()


    # --------------------------------------------------------
    # Test ID
    # --------------------------------------------------------

    test_id = create_test_id(
        student_id,
        engine
    )


    TEST_SESSIONS[test_id] = engine


    # --------------------------------------------------------
    # Student-safe test
    # --------------------------------------------------------

    student_test = engine.get_student_test()


    return {
        "test_id": test_id,

        "student_id": student_id,

        "test_type": test_type,

        "total_questions": total_questions,

        "test": student_test,

        "progress": engine.get_progress(),
    }


def submit_answer(
    test_id: str,
    question_id: str,
    answer: str
) -> Dict[str, Any]:
    """
    Store one answer.

    Evaluation is not revealed to the student
    before final submission.
    """

    engine = get_session(
        test_id
    )


    if not question_id:

        raise ValueError(
            "question_id is required."
        )


    result = engine.submit_answer(
        question_id,
        answer
    )


    return {
        "test_id": test_id,

        "success": True,

        "message": "Answer submitted.",

        "result": result,

        "progress": engine.get_progress(),
    }


def submit_test(
    test_id: str
) -> Dict[str, Any]:
    """
    Final test submission.

    Evaluation happens only after final submission.
    """

    engine = get_session(
        test_id
    )


    submission_result = engine.submit_test()


    student_result = engine.get_student_result()


    return {
        "test_id": test_id,

        "success": True,

        "message": "Test submitted successfully.",

        "result": student_result,

        "submission": submission_result,
    }


def get_test_progress(
    test_id: str
) -> Dict[str, Any]:
    """
    Get current test progress.
    """

    engine = get_session(
        test_id
    )

    return engine.get_progress()


def get_student_result(
    test_id: str
) -> Dict[str, Any]:
    """
    Return student-safe result.
    """

    engine = get_session(
        test_id
    )

    return engine.get_student_result()


def get_recruiter_result(
    test_id: str
) -> Dict[str, Any]:
    """
    Return detailed recruiter/internal result.

    May contain:

        - student answers
        - correct answers
        - explanations
        - skill performance
        - question-level evaluation
    """

    engine = get_session(
        test_id
    )

    return engine.get_recruiter_result()


# ============================================================
# FASTAPI APPLICATION
# ============================================================

if FASTAPI_AVAILABLE:

    app = FastAPI(
        title="CAMPUSLINK Test API",

        description=(
            "AI/ML API for MCQ self-assessment "
            "and technical testing."
        ),

        version="1.0.0",
    )


    # ========================================================
    # ROOT
    # ========================================================

    @app.get("/")
    def root():

        return {
            "project": "CAMPUSLINK",

            "module": "Test / Self-Assessment",

            "status": "running",
        }


    # ========================================================
    # HEALTH
    # ========================================================

    @app.get("/health")
    def health():

        return {
            "status": "healthy",

            "module": "test",
        }


    # ========================================================
    # START TEST
    # ========================================================

    @app.post("/test/start")
    def api_start_test(
        request: StartTestRequest
    ):

        try:

            result = start_test(

                student_id=request.student_id,

                student_name=request.student_name,

                skills=request.skills,

                total_questions=request.total_questions,

                test_type=request.test_type,
            )


            return {
                "success": True,

                "result": result,
            }


        except ValueError as exc:

            raise HTTPException(
                status_code=400,

                detail=str(exc)
            )


        except Exception as exc:

            raise HTTPException(
                status_code=500,

                detail=str(exc)
            )


    # ========================================================
    # GET TEST
    # ========================================================

    @app.get("/test/{test_id}")
    def api_get_test(
        test_id: str
    ):

        engine = get_session(
            test_id
        )


        return {
            "success": True,

            "test_id": test_id,

            "test": engine.get_student_test(),

            "progress": engine.get_progress(),
        }


    # ========================================================
    # SUBMIT ANSWER
    # ========================================================

    @app.post("/test/{test_id}/answer")
    def api_submit_answer(
        test_id: str,

        request: AnswerRequest
    ):

        try:

            return submit_answer(

                test_id=test_id,

                question_id=request.question_id,

                answer=request.answer,
            )


        except HTTPException:

            raise


        except Exception as exc:

            raise HTTPException(
                status_code=400,

                detail=str(exc)
            )


    # ========================================================
    # TEST PROGRESS
    # ========================================================

    @app.get("/test/{test_id}/progress")
    def api_test_progress(
        test_id: str
    ):

        try:

            progress = get_test_progress(
                test_id
            )


            return {
                "success": True,

                "test_id": test_id,

                "progress": progress,
            }


        except HTTPException:

            raise


        except Exception as exc:

            raise HTTPException(
                status_code=500,

                detail=str(exc)
            )


    # ========================================================
    # FINAL SUBMISSION
    # ========================================================

    @app.post("/test/{test_id}/submit")
    def api_submit_test(
        test_id: str
    ):

        try:

            return submit_test(
                test_id
            )


        except HTTPException:

            raise


        except Exception as exc:

            raise HTTPException(
                status_code=400,

                detail=str(exc)
            )


    # ========================================================
    # STUDENT RESULT
    # ========================================================

    @app.get("/test/{test_id}/result/student")
    def api_student_result(
        test_id: str
    ):

        try:

            result = get_student_result(
                test_id
            )


            return {
                "success": True,

                "test_id": test_id,

                "result": result,
            }


        except HTTPException:

            raise


        except Exception as exc:

            raise HTTPException(
                status_code=500,

                detail=str(exc)
            )


    # ========================================================
    # RECRUITER RESULT
    # ========================================================

    @app.get("/test/{test_id}/result/recruiter")
    def api_recruiter_result(
        test_id: str
    ):

        try:

            result = get_recruiter_result(
                test_id
            )


            return {
                "success": True,

                "test_id": test_id,

                "result": result,
            }


        except HTTPException:

            raise


        except Exception as exc:

            raise HTTPException(
                status_code=500,

                detail=str(exc)
            )


# ============================================================
# DEMO
# ============================================================

def demo():

    print("=" * 70)

    print(
        "CAMPUSLINK TEST API / ENGINE DEMO"
    )

    print("=" * 70)


    # --------------------------------------------------------
    # START TEST
    # --------------------------------------------------------

    try:

        result = start_test(

            student_id="STU001",

            student_name="Demo Student",

            skills=[
                "Python",
                "SQL",
                "OOP",
                "DSA",
            ],

            total_questions=5,

            test_type="SELF_ASSESSMENT",
        )


    except Exception as exc:

        print(
            "\nERROR WHILE STARTING TEST:"
        )

        print(
            str(exc)
        )

        return


    test_id = result.get(
        "test_id"
    )


    print(
        f"\nTest ID: {test_id}"
    )


    print(
        f"Questions Requested: "
        f"{result.get('total_questions')}"
    )


    # --------------------------------------------------------
    # GET STUDENT TEST
    # --------------------------------------------------------

    test_data = result.get(
        "test"
    )


    print(
        "\nRAW TEST STRUCTURE:"
    )

    print(
        type(test_data).__name__
    )


    # --------------------------------------------------------
    # EXTRACT QUESTIONS
    # --------------------------------------------------------

    questions = extract_questions(
        test_data
    )


    print(
        f"Questions Received: "
        f"{len(questions)}"
    )


    # --------------------------------------------------------
    # DISPLAY QUESTIONS
    # --------------------------------------------------------

    print("\nQUESTIONS")

    print("-" * 70)


    if not questions:

        print(
            "No questions were returned."
        )

        print(
            "\nReturned test data:"
        )

        print(
            test_data
        )

        return


    for index, question in enumerate(
        questions,
        start=1
    ):

        question_id = question.get(
            "question_id",
            f"QUESTION_{index}"
        )


        print(
            f"\nQuestion {index}"
        )


        print(
            f"ID: {question_id}"
        )


        print(
            f"Skill: "
            f"{question.get('skill', '')}"
        )


        print(
            f"Difficulty: "
            f"{question.get('difficulty', '')}"
        )


        print(
            f"Type: "
            f"{question.get('question_type', 'MCQ')}"
        )


        print(
            f"Question: "
            f"{question.get('question', '')}"
        )


        options = question.get(
            "options",
            []
        )


        if isinstance(
            options,
            list
        ):

            for option in options:

                print(
                    f"  {option}"
                )


    # --------------------------------------------------------
    # SUBMIT DEMO ANSWERS
    # --------------------------------------------------------

    print(
        "\nSUBMITTING DEMO ANSWERS"
    )

    print("-" * 70)


    submitted_count = 0


    for question in questions:

        question_id = question.get(
            "question_id"
        )


        if not question_id:

            continue


        options = question.get(
            "options",
            []
        )


        # Use the first available option
        # only for demonstration.

        if isinstance(
            options,
            list
        ) and options:

            answer = options[0]

        else:

            answer = ""


        try:

            answer_result = submit_answer(

                test_id=test_id,

                question_id=question_id,

                answer=answer,
            )


            print(
                f"{question_id}: "
                f"{answer_result.get('message')}"
            )


            submitted_count += 1


        except Exception as exc:

            print(
                f"{question_id}: "
                f"ERROR - {exc}"
            )


    print(
        f"\nAnswers submitted: "
        f"{submitted_count}/{len(questions)}"
    )


    # --------------------------------------------------------
    # FINAL SUBMISSION
    # --------------------------------------------------------

    print(
        "\nFINAL SUBMISSION"
    )

    print("-" * 70)


    try:

        final_result = submit_test(
            test_id
        )


        print(
            final_result
        )


    except Exception as exc:

        print(
            "ERROR DURING FINAL SUBMISSION:"
        )

        print(
            str(exc)
        )

        return


    # --------------------------------------------------------
    # STUDENT RESULT
    # --------------------------------------------------------

    print(
        "\nSTUDENT RESULT"
    )

    print("-" * 70)


    try:

        student_result = get_student_result(
            test_id
        )


        print(
            student_result
        )


    except Exception as exc:

        print(
            "ERROR GETTING STUDENT RESULT:"
        )

        print(
            str(exc)
        )


    # --------------------------------------------------------
    # RECRUITER RESULT
    # --------------------------------------------------------

    print(
        "\nRECRUITER RESULT"
    )

    print("-" * 70)


    try:

        recruiter_result = get_recruiter_result(
            test_id
        )


        print(
            recruiter_result
        )


    except Exception as exc:

        print(
            "ERROR GETTING RECRUITER RESULT:"
        )

        print(
            str(exc)
        )


    print(
        "\n" + "=" * 70
    )

    print(
        "TEST DEMO COMPLETED"
    )

    print(
        "=" * 70
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    demo()


    if FASTAPI_AVAILABLE:

        print(
            "\nFastAPI is available."
        )


        print(
            "Start API with:"
        )


        print(
            "uvicorn api.test_api:app --reload"
        )


    else:

        print(
            "\nFastAPI is not installed."
        )


        print(
            "Install with:"
        )


        print(
            "pip install fastapi uvicorn"
        )