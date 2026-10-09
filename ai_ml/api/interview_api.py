from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, Optional

# ============================================================
# PROJECT PATH
# ============================================================

ROOT_DIR = Path(__file__).resolve().parents[1]

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

DATA_DIR = ROOT_DIR / "data"

JOB_FILE = DATA_DIR / "jobs" / "jobs.json"
STUDENT_FILE = DATA_DIR / "students" / "students.json"


# ============================================================
# FASTAPI / PYDANTIC
# ============================================================

try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field

    FASTAPI_AVAILABLE = True

except ImportError:
    FASTAPI_AVAILABLE = False

    FastAPI = None
    BaseModel = object
    Field = None


# ============================================================
# AI/ML COMPONENTS
# ============================================================

from src.interview.interview_service import (
    InterviewService,
)

from src.interview.final_evaluation import (
    generate_final_evaluation,
    create_student_final_result,
    create_recruiter_final_result,
)


# ============================================================
# TEMPORARY IN-MEMORY STORAGE
# ============================================================

SERVICES: Dict[
    str,
    InterviewService,
] = {}

INTERVIEW_META: Dict[
    str,
    Dict[str, Any],
] = {}


# ============================================================
# REQUEST MODELS
# ============================================================

if FASTAPI_AVAILABLE:

    class StartInterviewRequest(
        BaseModel
    ):
        student_id: str

        job_id: str

        recruiter_id: str = ""

        total_questions: int = Field(
            default=5,
            ge=1,
            le=100,
        )

        self_assessment_scores: Dict[
            str,
            float,
        ] = Field(
            default_factory=dict
        )

        seed: Optional[int] = None


    class AnswerRequest(
        BaseModel
    ):
        question_id: str = ""

        answer: str = ""

        metadata: Dict[
            str,
            Any,
        ] = Field(
            default_factory=dict
        )


    class SkipRequest(
        BaseModel
    ):
        reason: str = ""


    class FinalEvaluationRequest(
        BaseModel
    ):
        eligibility_percentage: float = 0.0

        job_match_percentage: float = 0.0

        eligibility_cutoff: float = 70.0

        interview_cutoff: float = 60.0

        final_cutoff: float = 70.0

        weights: Dict[
            str,
            float,
        ] = Field(
            default_factory=lambda: {
                "eligibility": 40.0,
                "job_match": 30.0,
                "interview": 30.0,
            }
        )


# ============================================================
# HELPERS
# ============================================================

def load_json(
    path: Path,
) -> Any:

    if not path.exists():

        raise FileNotFoundError(
            f"Required data file not found: {path}"
        )

    with path.open(
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)


def find_by_id(
    records: Any,
    key: str,
    value: str,
) -> Optional[
    Dict[str, Any]
]:

    if not isinstance(
        records,
        list,
    ):

        return None

    for record in records:

        if (
            isinstance(
                record,
                dict,
            )
            and record.get(key) == value
        ):

            return record

    return None


def clamp_score(
    value: Any,
    default: float = 0.0,
) -> float:

    try:

        score = float(value)

    except (
        TypeError,
        ValueError,
    ):

        score = default

    return round(
        max(
            0.0,
            min(
                score,
                100.0,
            ),
        ),
        2,
    )


def get_service(
    interview_id: str,
) -> InterviewService:

    service = SERVICES.get(
        interview_id
    )

    if service is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Interview session not found."
            ),
        )

    return service


def get_meta(
    interview_id: str,
) -> Dict[str, Any]:

    meta = INTERVIEW_META.get(
        interview_id
    )

    if meta is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Interview metadata not found."
            ),
        )

    return meta


def get_job_for_interview(
    interview_id: str,
) -> Dict[str, Any]:

    meta = get_meta(
        interview_id
    )

    jobs = load_json(
        JOB_FILE
    )

    job = find_by_id(
        jobs,
        "job_id",
        meta["job_id"],
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Job not found: "
                f"{meta['job_id']}"
            ),
        )

    return job


def get_completed_result(
    interview_id: str,
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    try:

        return service.get_final_result(
            interview_id
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


# ============================================================
# START INTERVIEW
# ============================================================

def start_interview(
    student_id: str,
    job_id: str,
    recruiter_id: str = "",
    total_questions: int = 5,
    self_assessment_scores: Optional[
        Dict[str, float]
    ] = None,
    seed: Optional[int] = None,
) -> Dict[str, Any]:

    if not student_id:

        raise ValueError(
            "student_id is required."
        )

    if not job_id:

        raise ValueError(
            "job_id is required."
        )

    if total_questions <= 0:

        raise ValueError(
            "total_questions must be greater than 0."
        )

    students = load_json(
        STUDENT_FILE
    )

    jobs = load_json(
        JOB_FILE
    )

    student = find_by_id(
        students,
        "student_id",
        student_id,
    )

    if student is None:

        raise ValueError(
            f"Student not found: {student_id}"
        )

    job = find_by_id(
        jobs,
        "job_id",
        job_id,
    )

    if job is None:

        raise ValueError(
            f"Job not found: {job_id}"
        )

    service = InterviewService()

    created = service.create_interview(
        job=job,
        student=student,
        question_count=total_questions,
        self_assessment_scores=(
            self_assessment_scores
            or {}
        ),
        seed=seed,
    )

    interview_id = created[
        "interview_id"
    ]

    started = service.start_interview(
        interview_id
    )

    SERVICES[
        interview_id
    ] = service

    INTERVIEW_META[
        interview_id
    ] = {
        "student_id": student_id,
        "job_id": job_id,
        "recruiter_id": recruiter_id,
        "job_title": job.get(
            "job_title",
            "",
        ),
    }

    return {
        "interview_id": interview_id,

        "session_id": interview_id,

        "student_id": student_id,

        "job_id": job_id,

        "recruiter_id": recruiter_id,

        "job_title": job.get(
            "job_title",
            "",
        ),

        "status": started.get(
            "status"
        ),

        "question_count": created.get(
            "question_count",
            0,
        ),

        "weak_skills": created.get(
            "weak_skills",
            [],
        ),

        "current_question": started.get(
            "current_question"
        ),

        "questions": created.get(
            "questions",
            [],
        ),
    }


# ============================================================
# CURRENT QUESTION
# ============================================================

def get_current_question(
    interview_id: str,
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    question = (
        service.get_current_question(
            interview_id
        )
    )

    return {
        "interview_id": interview_id,

        "question_available": (
            question is not None
        ),

        "question": question,
    }


# ============================================================
# SUBMIT ANSWER
# ============================================================

def submit_interview_answer(
    interview_id: str,
    question_id: str,
    answer: str,
    metadata: Optional[
        Dict[str, Any]
    ] = None,
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    current_question = (
        service.get_current_question(
            interview_id
        )
    )

    if current_question is None:

        raise ValueError(
            "There is no active question to answer."
        )

    current_question_id = (
        current_question.get(
            "question_id"
        )
    )

    if (
        question_id
        and question_id
        != current_question_id
    ):

        raise ValueError(
            "question_id does not match "
            "the current interview question."
        )

    if not isinstance(
        answer,
        str,
    ):

        raise TypeError(
            "answer must be a string."
        )

    result = service.submit_answer(
        interview_id=interview_id,
        answer=answer,
        metadata=metadata,
    )

    return {
        "interview_id": interview_id,

        "success": True,

        "result": result,
    }


# ============================================================
# SKIP QUESTION
# ============================================================

def skip_interview_question(
    interview_id: str,
    reason: str = "",
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    result = service.skip_question(
        interview_id=interview_id,
        reason=(
            reason
            or None
        ),
    )

    return {
        "interview_id": interview_id,

        "success": True,

        "result": result,
    }


# ============================================================
# COMPLETE INTERVIEW
# ============================================================

def complete_interview(
    interview_id: str,
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    job = get_job_for_interview(
        interview_id
    )

    result = service.complete_interview(
        interview_id=interview_id,
        job=job,
    )

    return {
        "interview_id": interview_id,

        "success": True,

        "result": result,
    }


# ============================================================
# PERFORMANCE
# ============================================================

def get_interview_performance(
    interview_id: str,
) -> Dict[str, Any]:

    completed = (
        get_completed_result(
            interview_id
        )
    )

    return {
        "interview_id": interview_id,

        "performance": completed.get(
            "performance",
            {},
        ),
    }


# ============================================================
# FEEDBACK
# ============================================================

def get_interview_feedback(
    interview_id: str,
) -> Dict[str, Any]:

    completed = (
        get_completed_result(
            interview_id
        )
    )

    return {
        "interview_id": interview_id,

        "feedback": completed.get(
            "feedback",
            {},
        ),
    }


# ============================================================
# STUDENT RESULT
# ============================================================

def get_student_result(
    interview_id: str,
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    try:

        result = service.get_student_result(
            interview_id
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    return {
        "interview_id": interview_id,

        "result": result,
    }


# ============================================================
# RECRUITER RESULT
# ============================================================

def get_recruiter_result(
    interview_id: str,
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    try:

        result = service.get_recruiter_result(
            interview_id
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    return {
        "interview_id": interview_id,

        "result": result,
    }


# ============================================================
# INTERVIEW PROGRESS
# ============================================================

def get_progress(
    interview_id: str,
) -> Dict[str, Any]:

    service = get_service(
        interview_id
    )

    session = service.sessions.get(
        interview_id
    )

    if session is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Interview session not found."
            ),
        )

    # --------------------------------------------------------
    # Get normal session progress
    # --------------------------------------------------------

    try:

        progress = (
            session.get_progress()
        )

    except AttributeError:

        # Compatibility fallback
        total_questions = len(
            getattr(
                session,
                "questions",
                [],
            )
            or []
        )

        current_question_index = (
            getattr(
                session,
                "current_question_index",
                0,
            )
        )

        responses = (
            getattr(
                session,
                "responses",
                [],
            )
            or []
        )

        answered = len(
            responses
        )

        if total_questions > 0:

            progress_percentage = round(
                answered
                / total_questions
                * 100,
                2,
            )

        else:

            progress_percentage = 0.0

        progress = {
            "interview_id": (
                interview_id
            ),

            "status": (
                session.status
            ),

            "total_questions": (
                total_questions
            ),

            "answered": (
                answered
            ),

            "unanswered": (
                max(
                    total_questions
                    - answered,
                    0,
                )
            ),

            "progress_percentage": (
                progress_percentage
            ),

            "current_question_index": (
                current_question_index
            ),
        }

    # --------------------------------------------------------
    # Adaptive state
    # --------------------------------------------------------

    adaptive_state = (
        getattr(
            service,
            "adaptive_state",
            {},
        ).get(
            interview_id,
            {},
        )
    )

    if not isinstance(
        adaptive_state,
        dict,
    ):

        adaptive_state = {}

    asked_question_ids = (
        adaptive_state.get(
            "asked_question_ids",
            [],
        )
    )

    if not isinstance(
        asked_question_ids,
        list,
    ):

        asked_question_ids = []

    weak_skills = (
        adaptive_state.get(
            "weak_skills",
            [],
        )
    )

    if not isinstance(
        weak_skills,
        list,
    ):

        weak_skills = []

    return {
        "interview_id": interview_id,

        "status": session.status,

        "progress": progress,

        "adaptive_status": {
            "current_difficulty": (
                adaptive_state.get(
                    "current_difficulty",
                    "medium",
                )
            ),

            "last_score": (
                adaptive_state.get(
                    "last_score"
                )
            ),

            "asked_question_count": (
                len(
                    asked_question_ids
                )
            ),

            "weak_skills": weak_skills,
        },
    }


# ============================================================
# FINAL EVALUATION
# ============================================================

def build_final_evaluation(
    interview_id: str,
    eligibility_percentage: float,
    job_match_percentage: float,
    eligibility_cutoff: float = 70.0,
    interview_cutoff: float = 60.0,
    final_cutoff: float = 70.0,
    weights: Optional[
        Dict[str, float]
    ] = None,
) -> Dict[str, Any]:

    completed = (
        get_completed_result(
            interview_id
        )
    )

    performance = (
        completed.get(
            "performance",
            {},
        )
    )

    final_result = (
        generate_final_evaluation(
            eligibility_result={
                "eligibility_percentage": (
                    clamp_score(
                        eligibility_percentage
                    )
                )
            },

            job_match_result={
                "final_match_percentage": (
                    clamp_score(
                        job_match_percentage
                    )
                )
            },

            interview_result=performance,

            weights=(
                weights
                or {
                    "eligibility": 40,
                    "job_match": 30,
                    "interview": 30,
                }
            ),

            eligibility_cutoff=(
                clamp_score(
                    eligibility_cutoff
                )
            ),

            interview_cutoff=(
                clamp_score(
                    interview_cutoff
                )
            ),

            final_cutoff=(
                clamp_score(
                    final_cutoff
                )
            ),
        )
    )

    final_result[
        "interview_feedback"
    ] = completed.get(
        "feedback",
        {},
    )

    final_result[
        "eligibility_result"
    ] = {
        "eligibility_percentage": (
            clamp_score(
                eligibility_percentage
            )
        )
    }

    final_result[
        "job_match_result"
    ] = {
        "final_match_percentage": (
            clamp_score(
                job_match_percentage
            )
        )
    }

    student_result = (
        create_student_final_result(
            final_result
        )
    )

    recruiter_result = (
        create_recruiter_final_result(
            final_result
        )
    )

    return {
        "interview_id": interview_id,

        "final_evaluation": (
            final_result
        ),

        "student_result": (
            student_result
        ),

        "recruiter_result": (
            recruiter_result
        ),
    }


# ============================================================
# FASTAPI APPLICATION
# ============================================================

if FASTAPI_AVAILABLE:

    app = FastAPI(
        title=(
            "CAMPUSLINK AI Interview API"
        ),

        description=(
            "AI/ML API for interview "
            "question generation, "
            "answer evaluation, "
            "performance scoring, "
            "feedback and final evaluation."
        ),

        version="1.1.0",
    )

    # ========================================================
    # ROOT
    # ========================================================

    @app.get("/")
    def root() -> Dict[str, Any]:

        return {
            "project": "CAMPUSLINK",

            "module": "AI Interview",

            "status": "running",

            "api_version": "1.1.0",

            "port": 8003,
        }

    # ========================================================
    # HEALTH
    # ========================================================

    @app.get("/health")
    def health() -> Dict[str, Any]:

        return {
            "status": "healthy",

            "module": "interview",

            "active_interviews": len(
                SERVICES
            ),

            "port": 8003,
        }

    # ========================================================
    # START
    # ========================================================

    @app.post(
        "/interview/start"
    )
    def api_start_interview(
        request: StartInterviewRequest,
    ) -> Dict[str, Any]:

        try:

            return {
                "success": True,

                "result": start_interview(
                    student_id=(
                        request.student_id
                    ),

                    job_id=(
                        request.job_id
                    ),

                    recruiter_id=(
                        request.recruiter_id
                    ),

                    total_questions=(
                        request.total_questions
                    ),

                    self_assessment_scores=(
                        request.self_assessment_scores
                    ),

                    seed=request.seed,
                ),
            }

        except (
            ValueError,
            TypeError,
        ) as exc:

            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc),
            ) from exc

    # ========================================================
    # CURRENT QUESTION
    # ========================================================

    @app.get(
        "/interview/{interview_id}/question"
    )
    def api_current_question(
        interview_id: str,
    ) -> Dict[str, Any]:

        return get_current_question(
            interview_id
        )

    # ========================================================
    # ANSWER
    # ========================================================

    @app.post(
        "/interview/{interview_id}/answer"
    )
    def api_submit_answer(
        interview_id: str,
        request: AnswerRequest,
    ) -> Dict[str, Any]:

        try:

            return submit_interview_answer(
                interview_id=(
                    interview_id
                ),

                question_id=(
                    request.question_id
                ),

                answer=(
                    request.answer
                ),

                metadata=(
                    request.metadata
                ),
            )

        except HTTPException:

            raise

        except (
            ValueError,
            TypeError,
        ) as exc:

            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc),
            ) from exc

    # ========================================================
    # SKIP
    # ========================================================

    @app.post(
        "/interview/{interview_id}/skip"
    )
    def api_skip_question(
        interview_id: str,
        request: SkipRequest,
    ) -> Dict[str, Any]:

        try:

            return skip_interview_question(
                interview_id=(
                    interview_id
                ),

                reason=(
                    request.reason
                ),
            )

        except HTTPException:

            raise

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

    # ========================================================
    # PROGRESS
    # ========================================================

    @app.get(
        "/interview/{interview_id}/progress"
    )
    def api_progress(
        interview_id: str,
    ) -> Dict[str, Any]:

        try:

            return get_progress(
                interview_id
            )

        except HTTPException:

            raise

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc),
            ) from exc

    # ========================================================
    # COMPLETE
    # ========================================================

    @app.post(
        "/interview/{interview_id}/complete"
    )
    def api_complete(
        interview_id: str,
    ) -> Dict[str, Any]:

        try:

            return complete_interview(
                interview_id
            )

        except HTTPException:

            raise

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

    # ========================================================
    # STUDENT RESULT
    # ========================================================

    @app.get(
        "/interview/{interview_id}/result/student"
    )
    def api_student_result(
        interview_id: str,
    ) -> Dict[str, Any]:

        return {
            "success": True,

            **get_student_result(
                interview_id
            ),
        }

    # ========================================================
    # RECRUITER RESULT
    # ========================================================

    @app.get(
        "/interview/{interview_id}/result/recruiter"
    )
    def api_recruiter_result(
        interview_id: str,
    ) -> Dict[str, Any]:

        return {
            "success": True,

            **get_recruiter_result(
                interview_id
            ),
        }

    # ========================================================
    # PERFORMANCE
    # ========================================================

    @app.get(
        "/interview/{interview_id}/performance"
    )
    def api_performance(
        interview_id: str,
    ) -> Dict[str, Any]:

        try:

            return {
                "success": True,

                **get_interview_performance(
                    interview_id
                ),
            }

        except HTTPException:

            raise

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

    # ========================================================
    # FEEDBACK
    # ========================================================

    @app.get(
        "/interview/{interview_id}/feedback"
    )
    def api_feedback(
        interview_id: str,
    ) -> Dict[str, Any]:

        try:

            return {
                "success": True,

                **get_interview_feedback(
                    interview_id
                ),
            }

        except HTTPException:

            raise

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

    # ========================================================
    # FINAL EVALUATION
    # ========================================================

    @app.post(
        "/interview/{interview_id}/final-evaluation"
    )
    def api_final_evaluation(
        interview_id: str,
        request: FinalEvaluationRequest,
    ) -> Dict[str, Any]:

        try:

            return {
                "success": True,

                **build_final_evaluation(
                    interview_id=(
                        interview_id
                    ),

                    eligibility_percentage=(
                        request.eligibility_percentage
                    ),

                    job_match_percentage=(
                        request.job_match_percentage
                    ),

                    eligibility_cutoff=(
                        request.eligibility_cutoff
                    ),

                    interview_cutoff=(
                        request.interview_cutoff
                    ),

                    final_cutoff=(
                        request.final_cutoff
                    ),

                    weights=(
                        request.weights
                    ),
                ),
            }

        except HTTPException:

            raise

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

else:

    app = None


# ============================================================
# STANDALONE CHECK
# ============================================================

if __name__ == "__main__":

    print("=" * 70)

    print(
        "CAMPUSLINK AI INTERVIEW API"
    )

    print("=" * 70)

    print(
        "FastAPI available:",
        FASTAPI_AVAILABLE,
    )

    print(
        "Port: 8003"
    )

    print(
        "Interview endpoints ready."
    )