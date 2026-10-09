"""
CAMPUSLINK - Matching API

Purpose:
    API layer for:
        1. Student eligibility calculation
        2. Student-job matching
        3. Job recommendation based on matching results
        4. Skill gap analysis

This file is designed to be called by the CAMPUSLINK backend.

The AI/ML layer calculates scores.
Authentication and authorization remain the responsibility
of the backend.
"""

from typing import Dict, Any, List, Optional


# ============================================================
# FASTAPI / PYDANTIC
# ============================================================

try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field

    FASTAPI_AVAILABLE = True

except ImportError:
    FASTAPI_AVAILABLE = False


# ============================================================
# PROJECT ROOT / IMPORT PATH
# ============================================================

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


# ============================================================
# AI/ML IMPORTS
# ============================================================

from src.matching.eligibility import calculate_eligibility
from src.matching.job_matching import match_student_to_job
from src.matching.skill_gap import analyze_skill_gap


# ============================================================
# FASTAPI APP
# ============================================================

if FASTAPI_AVAILABLE:

    app = FastAPI(
        title="CAMPUSLINK AI/ML Matching API",
        description=(
            "AI/ML APIs for student eligibility, "
            "student-job matching and skill gap analysis."
        ),
        version="1.1.0"
    )

else:

    app = None


# ============================================================
# REQUEST MODELS
# ============================================================

if FASTAPI_AVAILABLE:

    class StudentProfile(BaseModel):
        """
        Student information consumed by the AI/ML layer.
        """

        student_id: Optional[str] = None

        name: Optional[str] = None

        degree: Optional[str] = None

        cgpa: float = Field(
            default=0.0,
            ge=0.0,
            le=10.0
        )

        experience: float = Field(
            default=0.0,
            ge=0.0
        )

        programming_languages: List[str] = Field(
            default_factory=list
        )

        skills: List[str] = Field(
            default_factory=list
        )

        college_id: Optional[str] = None


    class JobRequirement(BaseModel):
        """
        Job requirements consumed by the AI/ML layer.
        """

        job_id: Optional[str] = None

        company_id: Optional[str] = None

        title: Optional[str] = None

        degree: Optional[str] = None

        min_cgpa: float = Field(
            default=0.0,
            ge=0.0,
            le=10.0
        )

        min_experience: float = Field(
            default=0.0,
            ge=0.0
        )

        required_languages: List[str] = Field(
            default_factory=list
        )

        required_skills: List[str] = Field(
            default_factory=list
        )

        eligibility_cutoff: float = Field(
            default=70.0,
            ge=0.0,
            le=100.0
        )


    class MatchingRequest(BaseModel):
        """
        Complete student-job matching request.
        """

        student: StudentProfile

        job: JobRequirement


    class MultipleJobsRequest(BaseModel):
        """
        Request for matching one student against
        multiple jobs.
        """

        student: StudentProfile

        jobs: List[JobRequirement]


# ============================================================
# DATA CONVERSION
# ============================================================

def student_to_dict(
    student: Any
) -> Dict[str, Any]:
    """
    Convert Pydantic/object student into dictionary.
    """

    if isinstance(student, dict):
        return student

    if hasattr(student, "model_dump"):
        return student.model_dump()

    if hasattr(student, "dict"):
        return student.dict()

    return {
        "student_id": getattr(
            student,
            "student_id",
            None
        ),
        "name": getattr(
            student,
            "name",
            None
        ),
        "degree": getattr(
            student,
            "degree",
            None
        ),
        "cgpa": getattr(
            student,
            "cgpa",
            0.0
        ),
        "experience": getattr(
            student,
            "experience",
            0.0
        ),
        "programming_languages": getattr(
            student,
            "programming_languages",
            []
        ),
        "skills": getattr(
            student,
            "skills",
            []
        ),
        "college_id": getattr(
            student,
            "college_id",
            None
        )
    }


def job_to_dict(
    job: Any
) -> Dict[str, Any]:
    """
    Convert Pydantic/object job into dictionary.
    """

    if isinstance(job, dict):
        return job

    if hasattr(job, "model_dump"):
        return job.model_dump()

    if hasattr(job, "dict"):
        return job.dict()

    return {
        "job_id": getattr(
            job,
            "job_id",
            None
        ),
        "company_id": getattr(
            job,
            "company_id",
            None
        ),
        "title": getattr(
            job,
            "title",
            None
        ),
        "degree": getattr(
            job,
            "degree",
            None
        ),
        "min_cgpa": getattr(
            job,
            "min_cgpa",
            0.0
        ),
        "min_experience": getattr(
            job,
            "min_experience",
            0.0
        ),
        "required_languages": getattr(
            job,
            "required_languages",
            []
        ),
        "required_skills": getattr(
            job,
            "required_skills",
            []
        ),
        "eligibility_cutoff": getattr(
            job,
            "eligibility_cutoff",
            70.0
        )
    }


# ============================================================
# ELIGIBILITY
# ============================================================

def calculate_student_eligibility(
    student: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate eligibility for one student and one job.
    """

    try:

        result = calculate_eligibility(
            student,
            job
        )

        if isinstance(result, dict):
            return result

        return {
            "eligibility_percentage": float(
                result
            )
        }

    except TypeError:

        try:

            result = calculate_eligibility(
                student_data=student,
                job_data=job
            )

            if isinstance(result, dict):
                return result

            return {
                "eligibility_percentage": float(
                    result
                )
            }

        except Exception as exc:

            raise RuntimeError(
                f"Eligibility calculation failed: {exc}"
            ) from exc

    except Exception as exc:

        raise RuntimeError(
            f"Eligibility calculation failed: {exc}"
        ) from exc


# ============================================================
# STUDENT-JOB MATCHING
# ============================================================

def calculate_student_job_match(
    student: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate student-job match using the existing
    AI/ML matching engine.
    """

    try:

        result = match_student_to_job(
            student,
            job
        )

        if isinstance(result, dict):
            return result

        return {
            "final_match_score": float(
                result
            )
        }

    except TypeError:

        try:

            result = match_student_to_job(
                student_data=student,
                job_data=job
            )

            if isinstance(result, dict):
                return result

            return {
                "final_match_score": float(
                    result
                )
            }

        except Exception as exc:

            raise RuntimeError(
                f"Job matching failed: {exc}"
            ) from exc

    except Exception as exc:

        raise RuntimeError(
            f"Job matching failed: {exc}"
        ) from exc


# ============================================================
# SKILL GAP ANALYSIS
# ============================================================

def calculate_student_skill_gap(
    student: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate the student's skill gap for a job.

    Uses the existing AI/ML skill gap engine.
    """

    try:

        result = analyze_skill_gap(
            student,
            job
        )

        if not isinstance(result, dict):
            raise RuntimeError(
                "Skill gap engine returned an invalid result."
            )

        return result

    except Exception as exc:

        raise RuntimeError(
            f"Skill gap analysis failed: {exc}"
        ) from exc


# ============================================================
# COMPLETE MATCH
# ============================================================

def generate_match_result(
    student: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate complete matching result.

    Includes:
        eligibility
        job match
        combined information
    """

    eligibility_result = (
        calculate_student_eligibility(
            student,
            job
        )
    )

    job_match_result = (
        calculate_student_job_match(
            student,
            job
        )
    )

    eligibility_score = float(
        eligibility_result.get(
            "eligibility_percentage",
            eligibility_result.get(
                "eligibility_score",
                eligibility_result.get(
                    "percentage",
                    0
                )
            )
        )
    )

    match_score = float(
        job_match_result.get(
            "final_match_score",
            job_match_result.get(
                "final_match_percentage",
                job_match_result.get(
                    "match_score",
                    job_match_result.get(
                        "job_match_score",
                        0
                    )
                )
            )
        )
    )

    cutoff = float(
        job.get(
            "eligibility_cutoff",
            70
        )
    )

    eligible = (
        eligibility_score >= cutoff
    )

    return {
        "student_id": student.get(
            "student_id"
        ),

        "job_id": job.get(
            "job_id"
        ),

        "company_id": job.get(
            "company_id"
        ),

        "eligibility": eligibility_result,

        "job_match": job_match_result,

        "eligibility_percentage": round(
            eligibility_score,
            2
        ),

        "match_percentage": round(
            match_score,
            2
        ),

        "eligibility_cutoff": cutoff,

        "eligible": eligible,

        "status": (
            "ELIGIBLE"
            if eligible
            else "NOT_ELIGIBLE"
        )
    }


# ============================================================
# MULTIPLE JOB MATCHING
# ============================================================

def match_student_with_multiple_jobs(
    student: Dict[str, Any],
    jobs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Match one student against multiple jobs.
    """

    results = []

    for job in jobs:

        try:

            result = generate_match_result(
                student,
                job
            )

            results.append(result)

        except Exception as exc:

            results.append({
                "student_id": student.get(
                    "student_id"
                ),
                "job_id": job.get(
                    "job_id"
                ),
                "company_id": job.get(
                    "company_id"
                ),
                "error": str(exc),
                "status": "MATCHING_ERROR"
            })

    results.sort(
        key=lambda item: float(
            item.get(
                "match_percentage",
                0
            )
        ),
        reverse=True
    )

    return results


# ============================================================
# ELIGIBLE JOBS ONLY
# ============================================================

def get_eligible_jobs(
    matching_results: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Return only jobs where configured eligibility
    requirements were satisfied.
    """

    return [
        result
        for result in matching_results
        if result.get(
            "eligible",
            False
        )
    ]


# ============================================================
# FASTAPI ROUTES
# ============================================================

if FASTAPI_AVAILABLE:

    @app.get("/")
    def root():
        """
        API health endpoint.
        """

        return {
            "service": "CAMPUSLINK AI/ML Matching API",
            "status": "running",
            "version": "1.1.0",
            "features": [
                "eligibility",
                "job_matching",
                "skill_gap"
            ]
        }


    @app.get("/health")
    def health():
        """
        Health check.
        """

        return {
            "status": "healthy",
            "module": "matching",
            "skill_gap": True
        }


    # ========================================================
    # ELIGIBILITY ENDPOINT
    # ========================================================

    @app.post("/matching/eligibility")
    def eligibility_endpoint(
        request: MatchingRequest
    ):
        """
        Calculate student eligibility for a job.
        """

        student = student_to_dict(
            request.student
        )

        job = job_to_dict(
            request.job
        )

        try:

            result = calculate_student_eligibility(
                student,
                job
            )

            return {
                "success": True,

                "student_id": student.get(
                    "student_id"
                ),

                "job_id": job.get(
                    "job_id"
                ),

                "result": result
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


    # ========================================================
    # JOB MATCHING ENDPOINT
    # ========================================================

    @app.post("/matching/job")
    def job_matching_endpoint(
        request: MatchingRequest
    ):
        """
        Calculate student-job matching score.
        """

        student = student_to_dict(
            request.student
        )

        job = job_to_dict(
            request.job
        )

        try:

            result = calculate_student_job_match(
                student,
                job
            )

            return {
                "success": True,

                "student_id": student.get(
                    "student_id"
                ),

                "job_id": job.get(
                    "job_id"
                ),

                "result": result
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


    # ========================================================
    # COMPLETE MATCHING ENDPOINT
    # ========================================================

    @app.post("/matching/complete")
    def complete_matching_endpoint(
        request: MatchingRequest
    ):
        """
        Calculate eligibility + job match together.
        """

        student = student_to_dict(
            request.student
        )

        job = job_to_dict(
            request.job
        )

        try:

            result = generate_match_result(
                student,
                job
            )

            return {
                "success": True,
                "result": result
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


    # ========================================================
    # MULTIPLE JOB MATCHING
    # ========================================================

    @app.post("/matching/jobs")
    def multiple_jobs_endpoint(
        request: MultipleJobsRequest
    ):
        """
        Match one student against multiple jobs.
        """

        student = student_to_dict(
            request.student
        )

        jobs = [
            job_to_dict(job)
            for job in request.jobs
        ]

        try:

            results = (
                match_student_with_multiple_jobs(
                    student,
                    jobs
                )
            )

            eligible_jobs = get_eligible_jobs(
                results
            )

            return {
                "success": True,

                "student_id": student.get(
                    "student_id"
                ),

                "total_jobs": len(
                    results
                ),

                "eligible_jobs_count": len(
                    eligible_jobs
                ),

                "results": results,

                "eligible_jobs": eligible_jobs
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


    # ========================================================
    # SKILL GAP ANALYSIS ENDPOINT
    # ========================================================

    @app.post("/skill-gap/analyze")
    def skill_gap_endpoint(
        request: MatchingRequest
    ):
        """
        Analyze the student's skill gap for a job.

        Returns:

            overall skill match
            overall skill gap
            STRONG skills
            PARTIAL skills
            MISSING skills
            priority skills
            learning recommendations
        """

        student = student_to_dict(
            request.student
        )

        job = job_to_dict(
            request.job
        )

        try:

            result = calculate_student_skill_gap(
                student,
                job
            )

            return {
                "success": True,

                "student_id": student.get(
                    "student_id"
                ),

                "job_id": job.get(
                    "job_id"
                ),

                "result": result
            }

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=str(exc)
            )


# ============================================================
# LOCAL DEMO
# ============================================================

def demo():
    """
    Local Python demo without starting FastAPI.
    """

    print("=" * 70)
    print("CAMPUSLINK - MATCHING API DEMO")
    print("=" * 70)

    student = {
        "student_id": "STU001",
        "name": "Demo Student",
        "degree": "B.Tech",
        "cgpa": 8.2,
        "experience": 1,
        "programming_languages": [
            "Python",
            "Java"
        ],
        "skills": [
            "OOP",
            "DSA",
            "SQL"
        ],
        "college_id": "COL001"
    }

    job = {
        "job_id": "JOB001",
        "company_id": "COMP001",
        "title": "Python Developer",
        "degree": "B.Tech",
        "min_cgpa": 7.0,
        "min_experience": 0,
        "required_languages": [
            "Python"
        ],
        "required_skills": [
            "OOP",
            "DSA",
            "SQL",
            "FastAPI"
        ],
        "eligibility_cutoff": 70
    }

    print("\nStudent:")
    print(student)

    print("\nJob:")
    print(job)

    print("\nCalculating complete match...")

    try:

        result = generate_match_result(
            student,
            job
        )

        print("\nRESULT")
        print("-" * 70)

        print(
            f"Eligibility: "
            f"{result['eligibility_percentage']}%"
        )

        print(
            f"Job Match: "
            f"{result['match_percentage']}%"
        )

        print(
            f"Status: "
            f"{result['status']}"
        )

        print(
            f"Student ID: "
            f"{result['student_id']}"
        )

        print(
            f"Job ID: "
            f"{result['job_id']}"
        )

        print("\nSkill Gap:")

        skill_gap = calculate_student_skill_gap(
            student,
            job
        )

        print(
            f"Overall Skill Match: "
            f"{skill_gap['overall_skill_match']}%"
        )

        print(
            f"Overall Skill Gap: "
            f"{skill_gap['overall_gap']}%"
        )

        print(
            f"Strong Skills: "
            f"{skill_gap['strong_skills']}"
        )

        print(
            f"Partial Skills: "
            f"{skill_gap['partial_skills']}"
        )

        print(
            f"Missing Skills: "
            f"{skill_gap['missing_skills']}"
        )

    except Exception as exc:

        print(
            "\nMatching could not be completed."
        )

        print(
            f"Error: {exc}"
        )

    print("\n" + "=" * 70)
    print("DEMO COMPLETED")
    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    demo()