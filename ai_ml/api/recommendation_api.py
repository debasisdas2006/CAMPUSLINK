"""
CAMPUSLINK - Job Recommendation API

Flow:

Student Profile
      ↓
Job Requirements
      ↓
Job Matching
      ↓
Eligibility
      ↓
Final Match Percentage
      ↓
Job Recommendation
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
# IMPORTS
# ============================================================

from src.matching.job_matching import (
    match_student_to_job,
    match_student_to_jobs,
    recommend_jobs,
    get_eligible_jobs,
)


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
# PYDANTIC MODELS
# ============================================================

if FASTAPI_AVAILABLE:

    class StudentProfile(BaseModel):
        student_id: str

        degree: str = ""

        cgpa: float = 0.0

        experience: float = 0.0

        programming_languages: List[str] = Field(
            default_factory=list
        )

        skills: List[str] = Field(
            default_factory=list
        )


    class JobRequirement(BaseModel):
        job_id: str

        company_id: str = ""

        title: str = ""

        degree: str = ""

        min_cgpa: float = 0.0

        experience: float = 0.0

        programming_languages: List[str] = Field(
            default_factory=list
        )

        technical_skills: List[str] = Field(
            default_factory=list
        )


    class RecommendationRequest(BaseModel):
        student: StudentProfile

        jobs: List[JobRequirement]

        minimum_match_score: float = 50.0


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def student_to_dict(student: Any) -> Dict[str, Any]:
    """
    Convert StudentProfile to dictionary.
    """

    if hasattr(student, "model_dump"):
        return student.model_dump()

    if hasattr(student, "dict"):
        return student.dict()

    if isinstance(student, dict):
        return student

    return {}


def job_to_dict(job: Any) -> Dict[str, Any]:
    """
    Convert JobRequirement to dictionary.
    """

    if hasattr(job, "model_dump"):
        return job.model_dump()

    if hasattr(job, "dict"):
        return job.dict()

    if isinstance(job, dict):
        return job

    return {}


# ============================================================
# RECOMMENDATION FUNCTIONS
# ============================================================

def generate_job_recommendations(
    student: Dict[str, Any],
    jobs: List[Dict[str, Any]],
    minimum_match_score: float = 50.0
) -> Dict[str, Any]:
    """
    Generate job recommendations for one student.
    """

    if not student:
        raise ValueError(
            "Student profile cannot be empty."
        )

    if not jobs:
        return {
            "student_id": student.get("student_id"),
            "total_jobs": 0,
            "recommended_jobs": [],
            "eligible_jobs": [],
        }

    matches = match_student_to_jobs(
        student,
        jobs
    )

    recommendations = recommend_jobs(
        student,
        jobs,
        minimum_match_score
    )

    eligible_jobs = get_eligible_jobs(
        student,
        jobs
    )

    return {
        "student_id": student.get("student_id"),

        "total_jobs": len(jobs),

        "recommended_jobs": recommendations,

        "recommended_count": len(
            recommendations
        ),

        "eligible_jobs": eligible_jobs,

        "eligible_count": len(
            eligible_jobs
        ),

        "all_matches": matches,
    }


def get_top_recommendations(
    student: Dict[str, Any],
    jobs: List[Dict[str, Any]],
    top_n: int = 5
) -> List[Dict[str, Any]]:
    """
    Return the top N job matches.
    """

    matches = match_student_to_jobs(
        student,
        jobs
    )

    return matches[:max(0, top_n)]


def get_student_eligible_jobs(
    student: Dict[str, Any],
    jobs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Return jobs where the student satisfies
    the eligibility criteria.
    """

    return get_eligible_jobs(
        student,
        jobs
    )


# ============================================================
# FASTAPI APP
# ============================================================

if FASTAPI_AVAILABLE:

    app = FastAPI(
        title="CAMPUSLINK Job Recommendation API",
        description=(
            "AI/ML API for student job matching "
            "and job recommendation."
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
            "module": "Job Recommendation",
            "status": "running",
        }


    # ========================================================
    # HEALTH
    # ========================================================

    @app.get("/health")
    def health():
        return {
            "status": "healthy",
            "module": "recommendation",
        }


    # ========================================================
    # SINGLE JOB RECOMMENDATION
    # ========================================================

    @app.post("/recommendation/single")
    def recommend_single_job(
        student: StudentProfile,
        job: JobRequirement,
    ):
        """
        Match one student against one job.
        """

        student_data = student_to_dict(
            student
        )

        job_data = job_to_dict(
            job
        )

        try:

            result = match_student_to_job(
                student_data,
                job_data
            )

            return {
                "success": True,
                "result": result,
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


    # ========================================================
    # MULTIPLE JOB RECOMMENDATION
    # ========================================================

    @app.post("/recommendation/jobs")
    def recommend_multiple_jobs(
        request: RecommendationRequest,
    ):
        """
        Recommend jobs for a student
        from multiple available jobs.
        """

        student_data = student_to_dict(
            request.student
        )

        jobs_data = [
            job_to_dict(job)
            for job in request.jobs
        ]

        try:

            result = generate_job_recommendations(
                student_data,
                jobs_data,
                request.minimum_match_score
            )

            return {
                "success": True,
                "result": result,
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


    # ========================================================
    # TOP JOBS
    # ========================================================

    @app.post("/recommendation/top")
    def recommend_top_jobs(
        request: RecommendationRequest,
    ):
        """
        Return top matching jobs.
        """

        student_data = student_to_dict(
            request.student
        )

        jobs_data = [
            job_to_dict(job)
            for job in request.jobs
        ]

        try:

            recommendations = get_top_recommendations(
                student_data,
                jobs_data,
                top_n=5
            )

            return {
                "success": True,
                "student_id": student_data.get(
                    "student_id"
                ),
                "recommendations": recommendations,
                "count": len(recommendations),
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


    # ========================================================
    # ELIGIBLE JOBS
    # ========================================================

    @app.post("/recommendation/eligible")
    def eligible_jobs(
        request: RecommendationRequest,
    ):
        """
        Return jobs for which the student
        satisfies eligibility criteria.
        """

        student_data = student_to_dict(
            request.student
        )

        jobs_data = [
            job_to_dict(job)
            for job in request.jobs
        ]

        try:

            jobs = get_student_eligible_jobs(
                student_data,
                jobs_data
            )

            return {
                "success": True,
                "student_id": student_data.get(
                    "student_id"
                ),
                "eligible_jobs": jobs,
                "count": len(jobs),
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


# ============================================================
# DEMO
# ============================================================

def demo():
    """
    Run recommendation without starting FastAPI.
    """

    student = {
        "student_id": "STU001",

        "degree": "B.Tech Computer Science",

        "cgpa": 8.2,

        "experience": 1,

        "programming_languages": [
            "Python",
            "Java",
            "SQL",
        ],

        "skills": [
            "Python",
            "SQL",
            "OOP",
            "DSA",
        ],
    }


    jobs = [
        {
            "job_id": "JOB001",

            "company_id": "COMP001",

            "title": "Python Developer",

            "degree": "B.Tech Computer Science",

            "min_cgpa": 7.0,

            "experience": 0,

            "programming_languages": [
                "Python",
                "SQL",
            ],

            "technical_skills": [
                "Python",
                "SQL",
                "OOP",
            ],
        },

        {
            "job_id": "JOB002",

            "company_id": "COMP002",

            "title": "Java Developer",

            "degree": "B.Tech Computer Science",

            "min_cgpa": 7.5,

            "experience": 1,

            "programming_languages": [
                "Java",
                "SQL",
            ],

            "technical_skills": [
                "Java",
                "OOP",
                "DSA",
            ],
        },

        {
            "job_id": "JOB003",

            "company_id": "COMP003",

            "title": "Frontend Developer",

            "degree": "B.Tech Computer Science",

            "min_cgpa": 8.0,

            "experience": 2,

            "programming_languages": [
                "JavaScript",
            ],

            "technical_skills": [
                "React",
                "JavaScript",
                "HTML",
                "CSS",
            ],
        },
    ]


    print("=" * 70)
    print("CAMPUSLINK JOB RECOMMENDATION DEMO")
    print("=" * 70)


    result = generate_job_recommendations(
        student,
        jobs,
        minimum_match_score=50.0
    )


    print(
        f"Student ID: "
        f"{result['student_id']}"
    )

    print(
        f"Total Jobs: "
        f"{result['total_jobs']}"
    )

    print(
        f"Recommended Jobs: "
        f"{result['recommended_count']}"
    )

    print(
        f"Eligible Jobs: "
        f"{result['eligible_count']}"
    )


    print("\nRECOMMENDATIONS")
    print("-" * 70)


    for index, job in enumerate(
        result["recommended_jobs"],
        start=1
    ):

        print(
            f"{index}. "
            f"Job ID: {job.get('job_id')} | "
            f"Status: {job.get('status')} | "
            f"Match: "
            f"{job.get('final_match_percentage')}%"
        )


    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    demo()

    if FASTAPI_AVAILABLE:

        print()
        print(
            "FastAPI is available."
        )

        print(
            "Start the API with:"
        )

        print(
            "uvicorn api.recommendation_api:app "
            "--reload"
        )

    else:

        print()
        print(
            "FastAPI is not installed."
        )

        print(
            "Install it with:"
        )

        print(
            "pip install fastapi uvicorn"
        )