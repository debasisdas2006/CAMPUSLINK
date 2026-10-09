import sys
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


# ============================================================
# IMPORT AI/ML COMPONENTS
# ============================================================

from src.matching.skill_matching import (
    calculate_complete_skill_match
)

from src.matching.eligibility import (
    calculate_eligibility,
    load_students,
    load_jobs
)


# ============================================================
# RECOMMENDATION CONFIGURATION
# ============================================================

# Recommendation score combines:
#
#   Skill Match  = 60%
#   Eligibility  = 40%
#
# This is a recommendation/ranking score.
# It is NOT the same as eligibility percentage.

SKILL_MATCH_WEIGHT = 0.60
ELIGIBILITY_WEIGHT = 0.40


# ============================================================
# RECOMMENDATION SCORE
# ============================================================

def calculate_recommendation_score(
    skill_match,
    eligibility_percentage
):
    """
    Calculate the overall job recommendation score.

    Formula:

        Recommendation Score =
            Skill Match * 60%
            +
            Eligibility * 40%
    """

    score = (
        skill_match * SKILL_MATCH_WEIGHT
        +
        eligibility_percentage
        * ELIGIBILITY_WEIGHT
    )

    return round(score, 2)


# ============================================================
# SINGLE JOB RECOMMENDATION
# ============================================================

def recommend_job_for_student(
    student,
    job
):
    """
    Evaluate one student against one job.
    """

    # --------------------------------------------------------
    # Skill matching
    # --------------------------------------------------------

    skill_result = calculate_complete_skill_match(
        student,
        job
    )

    # --------------------------------------------------------
    # Eligibility
    # --------------------------------------------------------

    eligibility_result = calculate_eligibility(
        student,
        job
    )

    # --------------------------------------------------------
    # Recommendation score
    # --------------------------------------------------------

    recommendation_score = (
        calculate_recommendation_score(
            skill_result["overall_match"],
            eligibility_result[
                "eligibility_percentage"
            ]
        )
    )

    # --------------------------------------------------------
    # Recommendation status
    # --------------------------------------------------------

    if eligibility_result["status"] == "ELIGIBLE":

        recommendation_status = "RECOMMENDED"

    else:

        recommendation_status = "NOT_RECOMMENDED"

    # --------------------------------------------------------
    # Build transparent reason
    # --------------------------------------------------------

    reasons = []

    if eligibility_result["status"] == "ELIGIBLE":

        reasons.append(
            "Student satisfies the eligibility requirements."
        )

    else:

        reasons.append(
            "Student does not currently satisfy all "
            "eligibility requirements."
        )

    if skill_result["overall_match"] >= 80:

        reasons.append(
            "Strong technical skill match."
        )

    elif skill_result["overall_match"] >= 60:

        reasons.append(
            "Moderate technical skill match."
        )

    else:

        reasons.append(
            "Technical skill match is currently low."
        )

    if skill_result["missing_skills"]:

        reasons.append(
            "Missing skills: "
            + ", ".join(
                skill_result["missing_skills"]
            )
        )

    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    return {

        "student_id":
            student.get("student_id"),

        "student_name":
            student.get("name"),

        "job_id":
            job.get("job_id"),

        "job_title":
            job.get("job_title"),

        "company_id":
            job.get("company_id"),

        "skill_match_percentage":
            skill_result["overall_match"],

        "eligibility_percentage":
            eligibility_result[
                "eligibility_percentage"
            ],

        "eligibility_cutoff":
            eligibility_result[
                "eligibility_cutoff"
            ],

        "recommendation_score":
            recommendation_score,

        "eligibility_status":
            eligibility_result["status"],

        "recommendation_status":
            recommendation_status,

        "matched_skills":
            skill_result["matched_skills"],

        "missing_skills":
            skill_result["missing_skills"],

        "matched_languages":
            skill_result["matched_languages"],

        "missing_languages":
            skill_result["missing_languages"],

        "hard_requirement_failures":
            eligibility_result[
                "hard_requirement_failures"
            ],

        "reasons":
            reasons
    }


# ============================================================
# ALL JOBS FOR ONE STUDENT
# ============================================================

def recommend_jobs_for_student(
    student,
    jobs
):
    """
    Evaluate every job for one student.
    """

    recommendations = []

    for job in jobs:

        result = recommend_job_for_student(
            student,
            job
        )

        recommendations.append(result)

    # --------------------------------------------------------
    # Sort by recommendation score
    # --------------------------------------------------------

    recommendations.sort(
        key=lambda item: (
            item["eligibility_status"] == "ELIGIBLE",
            item["recommendation_score"]
        ),
        reverse=True
    )

    return recommendations


# ============================================================
# ONLY ELIGIBLE JOBS
# ============================================================

def get_eligible_job_recommendations(
    student,
    jobs
):
    """
    Return only jobs where the student satisfies
    the eligibility rules.
    """

    recommendations = recommend_jobs_for_student(
        student,
        jobs
    )

    return [
        recommendation
        for recommendation in recommendations
        if recommendation[
            "eligibility_status"
        ] == "ELIGIBLE"
    ]


# ============================================================
# DISPLAY
# ============================================================

def print_recommendation(
    recommendation,
    rank=None
):

    print()
    print("-" * 70)

    if rank is not None:

        print(
            f"Rank #{rank}"
        )

    print(
        f"Job     : "
        f"{recommendation['job_title']}"
    )

    print(
        f"Job ID  : "
        f"{recommendation['job_id']}"
    )

    print(
        f"Skill Match       : "
        f"{recommendation['skill_match_percentage']:.2f}%"
    )

    print(
        f"Eligibility       : "
        f"{recommendation['eligibility_percentage']:.2f}%"
    )

    print(
        f"Recommendation    : "
        f"{recommendation['recommendation_score']:.2f}%"
    )

    print(
        f"Eligibility Status: "
        f"{recommendation['eligibility_status']}"
    )

    print(
        f"Recommendation    : "
        f"{recommendation['recommendation_status']}"
    )

    print()

    print("Matched Skills:")

    if recommendation["matched_skills"]:

        for skill in recommendation[
            "matched_skills"
        ]:

            print(
                f"  ✓ {skill}"
            )

    else:

        print("  None")

    print()

    print("Missing Skills:")

    if recommendation["missing_skills"]:

        for skill in recommendation[
            "missing_skills"
        ]:

            print(
                f"  ✗ {skill}"
            )

    else:

        print("  None")

    print()

    print("Matched Languages:")

    if recommendation["matched_languages"]:

        for language in recommendation[
            "matched_languages"
        ]:

            print(
                f"  ✓ {language}"
            )

    else:

        print("  None")

    print()

    print("Missing Languages:")

    if recommendation["missing_languages"]:

        for language in recommendation[
            "missing_languages"
        ]:

            print(
                f"  ✗ {language}"
            )

    else:

        print("  None")

    print()

    print("Reason:")

    for reason in recommendation["reasons"]:

        print(
            f"  • {reason}"
        )

    if recommendation[
        "hard_requirement_failures"
    ]:

        print()

        print(
            "Eligibility Issues:"
        )

        for failure in recommendation[
            "hard_requirement_failures"
        ]:

            print(
                f"  ✗ {failure}"
            )

    print("-" * 70)


# ============================================================
# MAIN TEST
# ============================================================

def main():

    print()
    print("=" * 70)
    print(
        "CAMPUSLINK AI/ML - JOB RECOMMENDATION ENGINE"
    )
    print("=" * 70)

    # --------------------------------------------------------
    # Load datasets
    # --------------------------------------------------------

    students = load_students()
    jobs = load_jobs()

    print()
    print(
        f"Students loaded : {len(students)}"
    )

    print(
        f"Jobs loaded     : {len(jobs)}"
    )

    print()
    print(
        "Recommendation Weights:"
    )

    print(
        f"  Skill Match : "
        f"{SKILL_MATCH_WEIGHT * 100:.0f}%"
    )

    print(
        f"  Eligibility : "
        f"{ELIGIBILITY_WEIGHT * 100:.0f}%"
    )

    # --------------------------------------------------------
    # Test every student
    # --------------------------------------------------------

    for student in students:

        print()
        print("#" * 70)

        print(
            f"STUDENT: "
            f"{student['student_id']} - "
            f"{student['name']}"
        )

        print("#" * 70)

        recommendations = (
            recommend_jobs_for_student(
                student,
                jobs
            )
        )

        # ----------------------------------------------------
        # Display ranking
        # ----------------------------------------------------

        for index, recommendation in enumerate(
            recommendations,
            start=1
        ):

            print_recommendation(
                recommendation,
                index
            )

    print()
    print("=" * 70)
    print(
        "JOB RECOMMENDATION ENGINE TEST COMPLETED"
    )
    print("=" * 70)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()