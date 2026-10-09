"""
CAMPUSLINK - Student Job Matching Engine

This module matches a student profile against a job requirement.

The matching process combines:
1. Technical skill matching
2. Eligibility calculation
3. Final job-match percentage

The company/recruiter defines the job requirements.
The AI/ML layer calculates how well the student matches
those predefined requirements.
"""

from typing import Any, Dict, List


# ============================================================
# SAFE HELPERS
# ============================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    """Convert a value to float safely."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_text(value: Any) -> str:
    """Normalize text for comparison."""
    if value is None:
        return ""

    return str(value).strip().lower()


def normalize_list(value: Any) -> List[str]:
    """
    Convert different input formats into a normalized list of strings.
    """
    if value is None:
        return []

    if isinstance(value, str):
        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    if isinstance(value, (list, tuple, set)):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    return []


# ============================================================
# SKILL MATCHING
# ============================================================

def calculate_skill_match(
    student_skills: List[str],
    required_skills: List[str]
) -> Dict[str, Any]:
    """
    Calculate technical skill matching percentage.

    Example:

    Student:
        Python, Java, SQL

    Job:
        Python, SQL, React

    Matched:
        Python, SQL

    Skill match:
        2 / 3 * 100 = 66.67%
    """

    student = {
        normalize_text(skill)
        for skill in normalize_list(student_skills)
    }

    required = {
        normalize_text(skill)
        for skill in normalize_list(required_skills)
    }

    # Remove empty values
    student.discard("")
    required.discard("")

    if not required:
        return {
            "skill_match_percentage": 100.0,
            "matched_skills": [],
            "missing_skills": [],
            "student_skills": list(student),
            "required_skills": list(required),
        }

    matched_skills = sorted(student.intersection(required))
    missing_skills = sorted(required.difference(student))

    percentage = (
        len(matched_skills) / len(required)
    ) * 100

    return {
        "skill_match_percentage": round(percentage, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "student_skills": sorted(student),
        "required_skills": sorted(required),
    }


# ============================================================
# PROGRAMMING LANGUAGE MATCHING
# ============================================================

def calculate_language_match(
    student_languages: List[str],
    required_languages: List[str]
) -> Dict[str, Any]:
    """
    Calculate programming-language matching percentage.
    """

    student = {
        normalize_text(language)
        for language in normalize_list(student_languages)
    }

    required = {
        normalize_text(language)
        for language in normalize_list(required_languages)
    }

    student.discard("")
    required.discard("")

    if not required:
        return {
            "language_match_percentage": 100.0,
            "matched_languages": [],
            "missing_languages": [],
        }

    matched = sorted(student.intersection(required))
    missing = sorted(required.difference(student))

    percentage = (
        len(matched) / len(required)
    ) * 100

    return {
        "language_match_percentage": round(percentage, 2),
        "matched_languages": matched,
        "missing_languages": missing,
    }


# ============================================================
# DEGREE MATCHING
# ============================================================

def calculate_degree_match(
    student_degree: Any,
    required_degree: Any
) -> float:
    """
    Check whether student's degree matches the job requirement.

    Returns:
        100.0 -> matching degree
        0.0   -> not matching
    """

    if not required_degree:
        return 100.0

    student = normalize_text(student_degree)
    required = normalize_text(required_degree)

    if not student:
        return 0.0

    if student == required:
        return 100.0

    # Allow partial matching for values such as:
    # "B.Tech Computer Science"
    # "Computer Science"
    if required in student or student in required:
        return 100.0

    return 0.0


# ============================================================
# CGPA MATCHING
# ============================================================

def calculate_cgpa_match(
    student_cgpa: Any,
    minimum_cgpa: Any
) -> float:
    """
    Calculate CGPA requirement score.

    If the student meets the minimum CGPA:
        100

    Otherwise:
        proportional score
    """

    minimum = safe_float(minimum_cgpa, 0.0)
    student = safe_float(student_cgpa, 0.0)

    if minimum <= 0:
        return 100.0

    if student >= minimum:
        return 100.0

    if student <= 0:
        return 0.0

    percentage = (student / minimum) * 100

    return round(min(percentage, 100.0), 2)


# ============================================================
# EXPERIENCE MATCHING
# ============================================================

def calculate_experience_match(
    student_experience: Any,
    required_experience: Any
) -> float:
    """
    Calculate experience requirement score.

    Experience is expected in years.
    """

    required = safe_float(required_experience, 0.0)
    student = safe_float(student_experience, 0.0)

    if required <= 0:
        return 100.0

    if student >= required:
        return 100.0

    if student <= 0:
        return 0.0

    percentage = (student / required) * 100

    return round(min(percentage, 100.0), 2)


# ============================================================
# BASIC ELIGIBILITY
# ============================================================

def calculate_basic_eligibility(
    student: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate basic eligibility using job-defined requirements.

    Criteria:
        Degree
        CGPA
        Experience
    """

    student_degree = student.get("degree")
    student_cgpa = student.get("cgpa", 0)
    student_experience = student.get(
        "experience",
        student.get("experience_years", 0)
    )

    required_degree = job.get("degree")
    required_cgpa = job.get(
        "min_cgpa",
        job.get("minimum_cgpa", 0)
    )

    required_experience = job.get(
        "experience",
        job.get("experience_years", 0)
    )

    degree_score = calculate_degree_match(
        student_degree,
        required_degree
    )

    cgpa_score = calculate_cgpa_match(
        student_cgpa,
        required_cgpa
    )

    experience_score = calculate_experience_match(
        student_experience,
        required_experience
    )

    eligibility_score = (
        degree_score * 0.40
        + cgpa_score * 0.40
        + experience_score * 0.20
    )

    # Strict degree eligibility
    degree_eligible = degree_score == 100.0

    # Minimum eligibility threshold
    eligibility_percentage = round(
        eligibility_score,
        2
    )

    eligible = (
        degree_eligible
        and eligibility_percentage >= 70.0
    )

    return {
        "eligibility_percentage": eligibility_percentage,
        "degree_score": round(degree_score, 2),
        "cgpa_score": round(cgpa_score, 2),
        "experience_score": round(experience_score, 2),
        "degree_eligible": degree_eligible,
        "eligible": eligible,
    }


# ============================================================
# FINAL JOB MATCH
# ============================================================

def match_student_to_job(
    student: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main student-to-job matching function.

    This function is used by matching_api.py.

    Final match formula:

        60% Technical Match
        40% Eligibility

    Technical Match consists of:

        60% Skills
        40% Programming Languages
    """

    # --------------------------------------------------------
    # Student skills
    # --------------------------------------------------------

    student_skills = student.get(
        "skills",
        student.get("technical_skills", [])
    )

    student_languages = student.get(
        "programming_languages",
        student.get("languages", [])
    )

    # --------------------------------------------------------
    # Job requirements
    # --------------------------------------------------------

    required_skills = job.get(
        "technical_skills",
        job.get("required_skills", [])
    )

    required_languages = job.get(
        "programming_languages",
        job.get("languages", [])
    )

    # --------------------------------------------------------
    # Skill matching
    # --------------------------------------------------------

    skill_result = calculate_skill_match(
        student_skills,
        required_skills
    )

    # --------------------------------------------------------
    # Language matching
    # --------------------------------------------------------

    language_result = calculate_language_match(
        student_languages,
        required_languages
    )

    # --------------------------------------------------------
    # Technical match
    # --------------------------------------------------------

    technical_match = (
        skill_result["skill_match_percentage"] * 0.60
        + language_result["language_match_percentage"] * 0.40
    )

    technical_match = round(
        technical_match,
        2
    )

    # --------------------------------------------------------
    # Eligibility
    # --------------------------------------------------------

    eligibility_result = calculate_basic_eligibility(
        student,
        job
    )

    eligibility_percentage = eligibility_result[
        "eligibility_percentage"
    ]

    # --------------------------------------------------------
    # Final match
    # --------------------------------------------------------

    final_match_score = (
        technical_match * 0.60
        + eligibility_percentage * 0.40
    )

    final_match_score = round(
        final_match_score,
        2
    )

    # --------------------------------------------------------
    # Final status
    # --------------------------------------------------------

    eligible = eligibility_result["eligible"]

    if eligible and final_match_score >= 70:
        status = "ELIGIBLE"

    elif final_match_score >= 50:
        status = "PARTIALLY_ELIGIBLE"

    else:
        status = "NOT_ELIGIBLE"

    return {
        "student_id": student.get("student_id"),
        "job_id": job.get("job_id"),
        "company_id": job.get("company_id"),

        "skill_match_percentage": skill_result[
            "skill_match_percentage"
        ],

        "language_match_percentage": language_result[
            "language_match_percentage"
        ],

        "technical_match_percentage": technical_match,

        "eligibility_percentage": eligibility_percentage,

        "final_match_percentage": final_match_score,

        "status": status,

        "eligible": eligible,

        "matched_skills": skill_result[
            "matched_skills"
        ],

        "missing_skills": skill_result[
            "missing_skills"
        ],

        "matched_languages": language_result[
            "matched_languages"
        ],

        "missing_languages": language_result[
            "missing_languages"
        ],

        "degree_score": eligibility_result[
            "degree_score"
        ],

        "cgpa_score": eligibility_result[
            "cgpa_score"
        ],

        "experience_score": eligibility_result[
            "experience_score"
        ],
    }


# ============================================================
# MULTIPLE JOB MATCHING
# ============================================================

def match_student_to_jobs(
    student: Dict[str, Any],
    jobs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Match one student against multiple jobs.

    Results are sorted by final match percentage.
    """

    results = []

    for job in jobs:

        result = match_student_to_job(
            student,
            job
        )

        results.append(result)

    results.sort(
        key=lambda item: item.get(
            "final_match_percentage",
            0
        ),
        reverse=True
    )

    return results


# ============================================================
# ELIGIBLE JOBS
# ============================================================

def get_eligible_jobs(
    student: Dict[str, Any],
    jobs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Return only jobs for which the student is eligible.
    """

    matches = match_student_to_jobs(
        student,
        jobs
    )

    return [
        result
        for result in matches
        if result.get("eligible") is True
    ]


# ============================================================
# JOB RECOMMENDATION
# ============================================================

def recommend_jobs(
    student: Dict[str, Any],
    jobs: List[Dict[str, Any]],
    minimum_match_score: float = 50.0
) -> List[Dict[str, Any]]:
    """
    Recommend jobs based on final matching percentage.
    """

    matches = match_student_to_jobs(
        student,
        jobs
    )

    recommendations = [
        result
        for result in matches
        if result.get(
            "final_match_percentage",
            0
        ) >= minimum_match_score
    ]

    return recommendations


# ============================================================
# DEMO
# ============================================================

def demo():
    """Run a simple matching demonstration."""

    student = {
        "student_id": "STU001",
        "degree": "B.Tech Computer Science",
        "cgpa": 8.2,
        "experience": 1,
        "programming_languages": [
            "Python",
            "Java",
            "SQL"
        ],
        "skills": [
            "Python",
            "SQL",
            "OOP",
            "DSA"
        ]
    }

    job = {
        "job_id": "JOB001",
        "company_id": "COMP001",
        "degree": "B.Tech Computer Science",
        "min_cgpa": 7.0,
        "experience": 0,
        "programming_languages": [
            "Python",
            "Java",
            "JavaScript"
        ],
        "technical_skills": [
            "Python",
            "SQL",
            "OOP",
            "React"
        ]
    }

    result = match_student_to_job(
        student,
        job
    )

    print("=" * 60)
    print("CAMPUSLINK JOB MATCHING DEMO")
    print("=" * 60)

    for key, value in result.items():
        print(f"{key}: {value}")

    print("=" * 60)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()