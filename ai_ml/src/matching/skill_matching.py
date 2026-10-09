"""
CAMPUSLINK AI/ML
Skill Matching Engine

Compares a student's skills against the skills
required by a job.
"""

import sys
from pathlib import Path


# ============================================================
# PROJECT ROOT
# ============================================================

SRC_DIR = Path(__file__).resolve().parents[1]
PROJECT_DIR = SRC_DIR.parent

if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))


# ============================================================
# LOCAL NORMALIZATION
# ============================================================

SKILL_ALIASES = {
    "py": "python",
    "python3": "python",
    "python 3": "python",

    "js": "javascript",

    "ts": "typescript",

    "cpp": "c++",
    "c plus plus": "c++",

    "csharp": "c#",
    "c sharp": "c#",

    "postgres": "postgresql",
    "postgre sql": "postgresql",

    "mongo": "mongodb",

    "ml": "machine learning",
    "machine-learning": "machine learning",

    "ai": "artificial intelligence",
    "artificial-intelligence": "artificial intelligence",
}


def normalize_skill(skill):
    """
    Normalize one skill.
    """

    if skill is None:
        return ""

    skill = str(skill).strip().lower()

    skill = skill.replace("-", " ")

    skill = " ".join(skill.split())

    return SKILL_ALIASES.get(
        skill,
        skill
    )


def normalize_skills(skills):
    """
    Normalize and deduplicate skills.
    """

    normalized = []

    for skill in skills or []:

        value = normalize_skill(skill)

        if value and value not in normalized:
            normalized.append(value)

    return normalized


# ============================================================
# SKILL MATCHING
# ============================================================

def calculate_skill_match(
    student_skills,
    required_skills
):
    """
    Calculate the skill match between a student
    and a job.

    Returns:
        matched_skills
        missing_skills
        extra_skills
        overall_match
    """

    student_skills = normalize_skills(
        student_skills
    )

    required_skills = normalize_skills(
        required_skills
    )

    student_set = set(student_skills)

    required_set = set(required_skills)

    matched_skills = sorted(
        student_set.intersection(
            required_set
        )
    )

    missing_skills = sorted(
        required_set.difference(
            student_set
        )
    )

    extra_skills = sorted(
        student_set.difference(
            required_set
        )
    )

    if len(required_set) == 0:

        overall_match = 0.0

    else:

        overall_match = (
            len(matched_skills)
            / len(required_set)
        ) * 100

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "extra_skills": extra_skills,
        "matched_count": len(matched_skills),
        "required_count": len(required_set),
        "overall_match": round(
            overall_match,
            2
        )
    }


# ============================================================
# PROGRAMMING LANGUAGE MATCHING
# ============================================================

def calculate_language_match(
    student_languages,
    required_languages
):
    """
    Calculate programming-language match.
    """

    student_languages = normalize_skills(
        student_languages
    )

    required_languages = normalize_skills(
        required_languages
    )

    student_set = set(student_languages)

    required_set = set(required_languages)

    matched_languages = sorted(
        student_set.intersection(
            required_set
        )
    )

    missing_languages = sorted(
        required_set.difference(
            student_set
        )
    )

    if len(required_set) == 0:

        language_match = 0.0

    else:

        language_match = (
            len(matched_languages)
            / len(required_set)
        ) * 100

    return {
        "matched_languages": matched_languages,
        "missing_languages": missing_languages,
        "matched_count": len(
            matched_languages
        ),
        "required_count": len(
            required_set
        ),
        "language_match": round(
            language_match,
            2
        )
    }


# ============================================================
# COMBINED SKILL MATCH
# ============================================================

def calculate_complete_skill_match(
    student,
    job
):
    """
    Calculate both technical-skill and
    programming-language matching.
    """

    skill_result = calculate_skill_match(
        student.get("skills", []),
        job.get("required_skills", [])
    )

    language_result = calculate_language_match(
        student.get(
            "programming_languages",
            []
        ),
        job.get(
            "required_languages",
            []
        )
    )

    skill_score = skill_result[
        "overall_match"
    ]

    language_score = language_result[
        "language_match"
    ]

    # Technical skills receive 70%.
    # Programming languages receive 30%.
    overall_match = (
        skill_score * 0.70
        +
        language_score * 0.30
    )

    return {
        "student_id": student.get(
            "student_id"
        ),
        "job_id": job.get(
            "job_id"
        ),
        "skill_match": skill_score,
        "language_match": language_score,
        "overall_match": round(
            overall_match,
            2
        ),
        "matched_skills": skill_result[
            "matched_skills"
        ],
        "missing_skills": skill_result[
            "missing_skills"
        ],
        "extra_skills": skill_result[
            "extra_skills"
        ],
        "matched_languages": language_result[
            "matched_languages"
        ],
        "missing_languages": language_result[
            "missing_languages"
        ]
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    student = {
        "student_id": "STU001",
        "name": "Rahul Sharma",
        "skills": [
            "Python",
            "SQL",
            "Machine Learning",
            "Data Structures",
            "Algorithms",
            "OOP"
        ],
        "programming_languages": [
            "Python",
            "Java",
            "SQL"
        ]
    }

    job = {
        "job_id": "JOB001",
        "job_title": "Python Developer",
        "required_skills": [
            "Python",
            "SQL",
            "OOP",
            "Data Structures",
            "REST API"
        ],
        "required_languages": [
            "Python",
            "SQL"
        ]
    }

    result = calculate_complete_skill_match(
        student,
        job
    )

    print()
    print("=" * 70)
    print("CAMPUSLINK AI/ML - SKILL MATCHING")
    print("=" * 70)

    print()
    print(
        f"Student : {student['name']}"
    )

    print(
        f"Job     : {job['job_title']}"
    )

    print()
    print(
        f"Skill Match     : "
        f"{result['skill_match']}%"
    )

    print(
        f"Language Match  : "
        f"{result['language_match']}%"
    )

    print(
        f"Overall Match   : "
        f"{result['overall_match']}%"
    )

    print()
    print(
        "Matched Skills:"
    )

    for skill in result[
        "matched_skills"
    ]:
        print(
            f"  ✓ {skill}"
        )

    print()
    print(
        "Missing Skills:"
    )

    for skill in result[
        "missing_skills"
    ]:
        print(
            f"  ✗ {skill}"
        )

    print()
    print(
        "Extra Skills:"
    )

    for skill in result[
        "extra_skills"
    ]:
        print(
            f"  + {skill}"
        )

    print()
    print(
        "Matched Languages:"
    )

    for language in result[
        "matched_languages"
    ]:
        print(
            f"  ✓ {language}"
        )

    print()
    print(
        "Missing Languages:"
    )

    for language in result[
        "missing_languages"
    ]:
        print(
            f"  ✗ {language}"
        )

    print()
    print("=" * 70)
    print("SKILL MATCHING SUCCESSFUL")
    print("=" * 70)