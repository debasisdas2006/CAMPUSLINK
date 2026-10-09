"""
CAMPUSLINK - Final Evaluation Engine

Combines:
    1. Eligibility result
    2. Job match result
    3. Interview performance
    4. Interview feedback

The module produces a transparent evaluation that can be consumed
by the backend and displayed to students/recruiters.

IMPORTANT:
    This module does not independently decide hiring.
    It reports scores and predefined criteria.
"""

from typing import Dict, Any, List


# ============================================================
# DEFAULT WEIGHTS
# ============================================================

DEFAULT_WEIGHTS = {
    "eligibility": 40,
    "job_match": 30,
    "interview": 30
}


# ============================================================
# HELPERS
# ============================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert a value to float."""

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def clamp_score(score: Any) -> float:
    """Keep a percentage score between 0 and 100."""

    score = safe_float(score)

    return max(0.0, min(100.0, score))


def normalize_weights(weights: Dict[str, Any]) -> Dict[str, float]:
    """
    Normalize evaluation weights so their total is 100.
    """

    if not weights:
        weights = DEFAULT_WEIGHTS.copy()

    eligibility = safe_float(
        weights.get("eligibility", 0)
    )

    job_match = safe_float(
        weights.get("job_match", 0)
    )

    interview = safe_float(
        weights.get("interview", 0)
    )

    total = eligibility + job_match + interview

    if total <= 0:
        return DEFAULT_WEIGHTS.copy()

    return {
        "eligibility": round(
            eligibility / total * 100,
            2
        ),
        "job_match": round(
            job_match / total * 100,
            2
        ),
        "interview": round(
            interview / total * 100,
            2
        )
    }


# ============================================================
# INTERVIEW SCORE
# ============================================================

def extract_interview_score(
    interview_result: Dict[str, Any]
) -> float:
    """
    Extract interview performance score from different
    possible result structures.
    """

    if not interview_result:
        return 0.0

    possible_fields = [
        "overall_score",
        "performance_score",
        "interview_score",
        "score"
    ]

    for field in possible_fields:

        if field in interview_result:
            return clamp_score(
                interview_result[field]
            )

    performance = interview_result.get(
        "performance",
        {}
    )

    if isinstance(performance, dict):

        for field in possible_fields:

            if field in performance:
                return clamp_score(
                    performance[field]
                )

    return 0.0


# ============================================================
# ELIGIBILITY SCORE
# ============================================================

def extract_eligibility_score(
    eligibility_result: Dict[str, Any]
) -> float:
    """
    Extract eligibility percentage.
    """

    if not eligibility_result:
        return 0.0

    possible_fields = [
        "eligibility_percentage",
        "eligibility_score",
        "percentage",
        "score"
    ]

    for field in possible_fields:

        if field in eligibility_result:
            return clamp_score(
                eligibility_result[field]
            )

    return 0.0


# ============================================================
# JOB MATCH SCORE
# ============================================================

def extract_job_match_score(
    job_match_result: Dict[str, Any]
) -> float:
    """
    Extract job-match percentage.

    Accepts the field names used by CAMPUSLINK's
    current matching engine, including ``final_match_percentage``.
    A numeric value is also accepted for compatibility.
    """

    if job_match_result is None:
        return 0.0

    if isinstance(
        job_match_result,
        (int, float),
    ):
        return clamp_score(
            job_match_result
        )

    if not isinstance(
        job_match_result,
        dict,
    ):
        return 0.0

    possible_fields = [
        "final_match_score",
        "final_match_percentage",
        "job_match_score",
        "match_score",
        "matching_percentage",
        "score"
    ]

    for field in possible_fields:

        if field in job_match_result:
            return clamp_score(
                job_match_result[field]
            )

    return 0.0


# ============================================================
# WEIGHTED FINAL SCORE
# ============================================================

def calculate_final_score(
    eligibility_score: float,
    job_match_score: float,
    interview_score: float,
    weights: Dict[str, Any] = None
) -> float:
    """
    Calculate weighted final evaluation score.
    """

    normalized_weights = normalize_weights(
        weights or DEFAULT_WEIGHTS
    )

    eligibility_score = clamp_score(
        eligibility_score
    )

    job_match_score = clamp_score(
        job_match_score
    )

    interview_score = clamp_score(
        interview_score
    )

    final_score = (
        eligibility_score
        * normalized_weights["eligibility"]
        / 100
    ) + (
        job_match_score
        * normalized_weights["job_match"]
        / 100
    ) + (
        interview_score
        * normalized_weights["interview"]
        / 100
    )

    return round(
        final_score,
        2
    )


# ============================================================
# PERFORMANCE LEVEL
# ============================================================

def get_performance_level(
    score: float
) -> str:
    """
    Convert final score to a descriptive level.
    """

    score = clamp_score(score)

    if score >= 85:
        return "EXCELLENT"

    if score >= 70:
        return "GOOD"

    if score >= 50:
        return "AVERAGE"

    if score >= 30:
        return "WEAK"

    return "POOR"


# ============================================================
# ELIGIBILITY STATUS
# ============================================================

def determine_eligibility_status(
    eligibility_result: Dict[str, Any],
    eligibility_cutoff: float = 70
) -> Dict[str, Any]:
    """
    Determine whether predefined eligibility requirements
    are satisfied.

    Degree requirement is also considered when available.
    """

    score = extract_eligibility_score(
        eligibility_result
    )

    cutoff = clamp_score(
        eligibility_cutoff
    )

    degree_score = safe_float(
        eligibility_result.get(
            "degree_score",
            100
        )
        if eligibility_result
        else 0
    )

    degree_requirement_met = (
        degree_score >= 100
    )

    score_requirement_met = (
        score >= cutoff
    )

    eligible = (
        degree_requirement_met
        and score_requirement_met
    )

    return {
        "eligible": eligible,
        "eligibility_score": round(
            score,
            2
        ),
        "eligibility_cutoff": round(
            cutoff,
            2
        ),
        "degree_requirement_met": (
            degree_requirement_met
        ),
        "score_requirement_met": (
            score_requirement_met
        )
    }


# ============================================================
# INTERVIEW STATUS
# ============================================================

def determine_interview_status(
    interview_score: float,
    interview_cutoff: float = 60
) -> Dict[str, Any]:
    """
    Check interview performance against the predefined
    interview cutoff.
    """

    score = clamp_score(
        interview_score
    )

    cutoff = clamp_score(
        interview_cutoff
    )

    passed = score >= cutoff

    return {
        "passed": passed,
        "interview_score": round(
            score,
            2
        ),
        "interview_cutoff": round(
            cutoff,
            2
        )
    }


# ============================================================
# FINAL CRITERIA
# ============================================================

def evaluate_criteria(
    eligibility_status: Dict[str, Any],
    interview_status: Dict[str, Any],
    final_score: float,
    final_cutoff: float = 70
) -> Dict[str, Any]:
    """
    Evaluate predefined final criteria.

    No hiring decision is made here.
    """

    final_cutoff = clamp_score(
        final_cutoff
    )

    final_score = clamp_score(
        final_score
    )

    final_score_requirement_met = (
        final_score >= final_cutoff
    )

    return {
        "eligibility_requirement_met": (
            eligibility_status["eligible"]
        ),
        "interview_requirement_met": (
            interview_status["passed"]
        ),
        "final_score_requirement_met": (
            final_score_requirement_met
        ),
        "final_cutoff": round(
            final_cutoff,
            2
        )
    }


# ============================================================
# RESULT STATUS
# ============================================================

def generate_result_status(
    criteria: Dict[str, Any]
) -> str:
    """
    Generate a transparent status based on configured criteria.

    This is a criteria status, not a hiring recommendation.
    """

    if (
        criteria["eligibility_requirement_met"]
        and criteria["interview_requirement_met"]
        and criteria["final_score_requirement_met"]
    ):
        return "MEETS_CONFIGURED_CRITERIA"

    if not criteria["eligibility_requirement_met"]:
        return "ELIGIBILITY_CRITERIA_NOT_MET"

    if not criteria["interview_requirement_met"]:
        return "INTERVIEW_CRITERIA_NOT_MET"

    return "FINAL_SCORE_CRITERIA_NOT_MET"


# ============================================================
# REASON GENERATOR
# ============================================================

def generate_result_reasons(
    criteria: Dict[str, Any]
) -> List[str]:
    """
    Explain why the configured criteria were or were not met.
    """

    reasons = []

    if criteria["eligibility_requirement_met"]:
        reasons.append(
            "The configured eligibility requirements were met."
        )
    else:
        reasons.append(
            "The configured eligibility requirements were not met."
        )

    if criteria["interview_requirement_met"]:
        reasons.append(
            "The configured interview performance requirement was met."
        )
    else:
        reasons.append(
            "The configured interview performance requirement was not met."
        )

    if criteria["final_score_requirement_met"]:
        reasons.append(
            "The configured final score requirement was met."
        )
    else:
        reasons.append(
            "The configured final score requirement was not met."
        )

    return reasons


# ============================================================
# SCORE BREAKDOWN
# ============================================================

def create_score_breakdown(
    eligibility_score: float,
    job_match_score: float,
    interview_score: float,
    weights: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create transparent score and weighted contribution breakdown.
    """

    normalized_weights = normalize_weights(
        weights
    )

    eligibility_score = clamp_score(
        eligibility_score
    )

    job_match_score = clamp_score(
        job_match_score
    )

    interview_score = clamp_score(
        interview_score
    )

    eligibility_contribution = (
        eligibility_score
        * normalized_weights["eligibility"]
        / 100
    )

    job_match_contribution = (
        job_match_score
        * normalized_weights["job_match"]
        / 100
    )

    interview_contribution = (
        interview_score
        * normalized_weights["interview"]
        / 100
    )

    return {
        "eligibility": {
            "score": round(
                eligibility_score,
                2
            ),
            "weight": normalized_weights[
                "eligibility"
            ],
            "weighted_contribution": round(
                eligibility_contribution,
                2
            )
        },

        "job_match": {
            "score": round(
                job_match_score,
                2
            ),
            "weight": normalized_weights[
                "job_match"
            ],
            "weighted_contribution": round(
                job_match_contribution,
                2
            )
        },

        "interview": {
            "score": round(
                interview_score,
                2
            ),
            "weight": normalized_weights[
                "interview"
            ],
            "weighted_contribution": round(
                interview_contribution,
                2
            )
        }
    }


# ============================================================
# COMPLETE FINAL EVALUATION
# ============================================================

def generate_final_evaluation(
    eligibility_result: Dict[str, Any],
    job_match_result: Dict[str, Any],
    interview_result: Dict[str, Any],
    weights: Dict[str, Any] = None,
    eligibility_cutoff: float = 70,
    interview_cutoff: float = 60,
    final_cutoff: float = 70
) -> Dict[str, Any]:
    """
    Generate the complete final evaluation.

    Inputs:
        eligibility_result
        job_match_result
        interview_result

    Outputs:
        transparent score breakdown
        configured criteria status
        result reasons
        interview performance
    """

    weights = weights or DEFAULT_WEIGHTS.copy()

    eligibility_score = extract_eligibility_score(
        eligibility_result
    )

    job_match_score = extract_job_match_score(
        job_match_result
    )

    interview_score = extract_interview_score(
        interview_result
    )

    final_score = calculate_final_score(
        eligibility_score,
        job_match_score,
        interview_score,
        weights
    )

    performance_level = get_performance_level(
        final_score
    )

    eligibility_status = determine_eligibility_status(
        eligibility_result,
        eligibility_cutoff
    )

    interview_status = determine_interview_status(
        interview_score,
        interview_cutoff
    )

    criteria = evaluate_criteria(
        eligibility_status,
        interview_status,
        final_score,
        final_cutoff
    )

    result_status = generate_result_status(
        criteria
    )

    reasons = generate_result_reasons(
        criteria
    )

    score_breakdown = create_score_breakdown(
        eligibility_score,
        job_match_score,
        interview_score,
        weights
    )

    return {
        "final_score": round(
            final_score,
            2
        ),

        "performance_level": performance_level,

        "score_breakdown": score_breakdown,

        "eligibility": eligibility_status,

        "job_match": {
            "job_match_score": round(
                job_match_score,
                2
            )
        },

        "interview": {
            "interview_score": round(
                interview_score,
                2
            ),
            "interview_status": interview_status
        },

        "criteria": criteria,

        "status": result_status,

        "reasons": reasons,

        "decision_note": (
            "This evaluation reports predefined criteria and "
            "performance metrics. The final hiring decision "
            "remains with the authorized recruiter/company."
        )
    }


# ============================================================
# STUDENT VIEW
# ============================================================

def create_student_final_result(
    final_evaluation: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create the student-facing final result.

    The student receives scores, criteria status, and feedback,
    but not internal recruiter information.
    """

    return {
        "final_score": final_evaluation[
            "final_score"
        ],

        "performance_level": final_evaluation[
            "performance_level"
        ],

        "eligibility_score": final_evaluation[
            "eligibility"
        ]["eligibility_score"],

        "job_match_score": final_evaluation[
            "job_match"
        ]["job_match_score"],

        "interview_score": final_evaluation[
            "interview"
        ]["interview_score"],

        "status": final_evaluation[
            "status"
        ],

        "criteria": final_evaluation[
            "criteria"
        ],

        "reasons": final_evaluation[
            "reasons"
        ]
    }


# ============================================================
# RECRUITER VIEW
# ============================================================

def create_recruiter_final_result(
    final_evaluation: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create recruiter-facing final evaluation.

    Includes complete score breakdown and configured criteria.
    """

    return {
        "final_score": final_evaluation[
            "final_score"
        ],

        "performance_level": final_evaluation[
            "performance_level"
        ],

        "score_breakdown": final_evaluation[
            "score_breakdown"
        ],

        "eligibility": final_evaluation[
            "eligibility"
        ],

        "job_match": final_evaluation[
            "job_match"
        ],

        "interview": final_evaluation[
            "interview"
        ],

        "criteria": final_evaluation[
            "criteria"
        ],

        "status": final_evaluation[
            "status"
        ],

        "reasons": final_evaluation[
            "reasons"
        ],

        "decision_note": final_evaluation[
            "decision_note"
        ]
    }


# ============================================================
# DEMO
# ============================================================

def demo():
    """
    Demonstrate the final evaluation engine.
    """

    print("=" * 70)
    print("CAMPUSLINK - FINAL EVALUATION DEMO")
    print("=" * 70)

    eligibility_result = {
        "eligibility_percentage": 85,
        "degree_score": 100
    }

    job_match_result = {
        "final_match_score": 78
    }

    interview_result = {
        "overall_score": 72
    }

    weights = {
        "eligibility": 40,
        "job_match": 30,
        "interview": 30
    }

    result = generate_final_evaluation(
        eligibility_result=eligibility_result,
        job_match_result=job_match_result,
        interview_result=interview_result,
        weights=weights,
        eligibility_cutoff=70,
        interview_cutoff=60,
        final_cutoff=70
    )

    print("\nFINAL SCORE")
    print("-" * 70)

    print(
        f"Final Score: {result['final_score']}%"
    )

    print(
        f"Performance Level: "
        f"{result['performance_level']}"
    )

    print(
        f"Status: {result['status']}"
    )

    print("\nSCORE BREAKDOWN")
    print("-" * 70)

    for category, data in result[
        "score_breakdown"
    ].items():

        print(
            f"{category}: "
            f"{data['score']}% | "
            f"Weight: {data['weight']}% | "
            f"Contribution: "
            f"{data['weighted_contribution']}"
        )

    print("\nCRITERIA")
    print("-" * 70)

    for key, value in result[
        "criteria"
    ].items():

        print(
            f"{key}: {value}"
        )

    print("\nREASONS")
    print("-" * 70)

    for reason in result["reasons"]:
        print(f"- {reason}")

    print("\nSTUDENT RESULT")
    print("-" * 70)

    student_result = create_student_final_result(
        result
    )

    for key, value in student_result.items():
        print(f"{key}: {value}")

    print("\nRECRUITER RESULT")
    print("-" * 70)

    recruiter_result = create_recruiter_final_result(
        result
    )

    for key, value in recruiter_result.items():
        print(f"{key}: {value}")

    print("\n" + "=" * 70)
    print("DEMO COMPLETED")
    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()