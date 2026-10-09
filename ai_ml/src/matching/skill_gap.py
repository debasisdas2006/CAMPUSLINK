"""
CAMPUSLINK AI/ML
Skill Gap Analysis Engine

Analyzes the difference between:
    1. Student's existing technical skills
    2. Job's required technical skills

The engine provides:
    - STRONG skills
    - PARTIAL skills
    - MISSING skills
    - Per-skill score
    - Overall skill gap percentage
    - Priority skills
    - Learning recommendations
"""

from typing import Any, Dict, List


# ============================================================
# SKILL ALIASES
# ============================================================

SKILL_ALIASES = {
    "py": "python",
    "python3": "python",
    "python 3": "python",

    "js": "javascript",
    "javascript": "javascript",

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


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_skill(skill: Any) -> str:
    """Normalize one skill."""

    if skill is None:
        return ""

    value = str(skill).strip().lower()

    value = value.replace("-", " ")

    value = " ".join(value.split())

    return SKILL_ALIASES.get(
        value,
        value
    )


def normalize_skills(skills: Any) -> List[str]:
    """Normalize and remove duplicate skills."""

    if skills is None:
        return []

    if isinstance(skills, str):
        skills = skills.split(",")

    normalized = []

    for skill in skills:

        value = normalize_skill(skill)

        if value and value not in normalized:
            normalized.append(value)

    return normalized


# ============================================================
# STATUS CALCULATION
# ============================================================

def calculate_skill_status(
    skill: str,
    student_skills: List[str]
) -> Dict[str, Any]:
    """
    Calculate the status of one required skill.

    Current implementation:

        STRONG  -> Student has the skill
        MISSING -> Student does not have the skill

    PARTIAL is reserved for future proficiency-level data.
    """

    normalized_skill = normalize_skill(skill)

    student_set = set(
        normalize_skills(student_skills)
    )

    if normalized_skill in student_set:

        return {
            "skill": normalized_skill,
            "status": "STRONG",
            "score": 100
        }

    return {
        "skill": normalized_skill,
        "status": "MISSING",
        "score": 0
    }


# ============================================================
# LEARNING RECOMMENDATION
# ============================================================

def generate_learning_recommendation(
    skill: str
) -> str:
    """
    Generate a simple learning recommendation
    for a missing or partial skill.
    """

    return (
        f"Improve {skill} through structured learning, "
        f"hands-on practice, projects, and interview questions."
    )


# ============================================================
# SKILL GAP ANALYSIS
# ============================================================

def analyze_skill_gap(
    student: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyze the student's skill gap for a job.

    Student example:

        {
            "student_id": "STU-001",
            "skills": [
                "Python",
                "SQL",
                "Machine Learning"
            ]
        }

    Job example:

        {
            "job_id": "JOB-001",
            "required_skills": [
                "Python",
                "SQL",
                "FastAPI",
                "Docker"
            ]
        }
    """

    student_skills = normalize_skills(
        student.get(
            "skills",
            student.get(
                "technical_skills",
                []
            )
        )
    )

    required_skills = normalize_skills(
        job.get(
            "required_skills",
            job.get(
                "technical_skills",
                []
            )
        )
    )

    skill_analysis = []

    strong_skills = []
    partial_skills = []
    missing_skills = []

    total_score = 0

    for skill in required_skills:

        result = calculate_skill_status(
            skill,
            student_skills
        )

        skill_analysis.append(result)

        score = result["score"]

        total_score += score

        if result["status"] == "STRONG":

            strong_skills.append(
                result["skill"]
            )

        elif result["status"] == "PARTIAL":

            partial_skills.append(
                result["skill"]
            )

        else:

            missing_skills.append(
                result["skill"]
            )

    required_count = len(required_skills)

    if required_count == 0:

        overall_match = 0.0
        overall_gap = 0.0

    else:

        overall_match = (
            total_score / required_count
        )

        overall_gap = 100.0 - overall_match

    # Missing and partial skills have the highest priority.
    priority_skills = (
        missing_skills
        + partial_skills
    )

    learning_recommendations = [
        {
            "skill": skill,
            "priority": (
                "HIGH"
                if skill in missing_skills
                else "MEDIUM"
            ),
            "recommendation":
                generate_learning_recommendation(
                    skill
                )
        }
        for skill in priority_skills
    ]

    return {
        "student_id": student.get(
            "student_id"
        ),

        "job_id": job.get(
            "job_id"
        ),

        "overall_gap": round(
            overall_gap,
            2
        ),

        "overall_skill_match": round(
            overall_match,
            2
        ),

        "skills": skill_analysis,

        "strong_skills": strong_skills,

        "partial_skills": partial_skills,

        "missing_skills": missing_skills,

        "priority_skills": priority_skills,

        "learning_recommendations":
            learning_recommendations,

        "required_skill_count":
            required_count,

        "strong_skill_count":
            len(strong_skills),

        "partial_skill_count":
            len(partial_skills),

        "missing_skill_count":
            len(missing_skills)
    }


# ============================================================
# DEMO
# ============================================================

def demo():

    student = {
        "student_id": "STU-001",

        "skills": [
            "Python",
            "SQL",
            "Machine Learning"
        ]
    }

    job = {
        "job_id": "JOB-001",

        "required_skills": [
            "Python",
            "SQL",
            "FastAPI",
            "Docker"
        ]
    }

    result = analyze_skill_gap(
        student,
        job
    )

    print()
    print("=" * 70)
    print("CAMPUSLINK AI/ML - SKILL GAP ANALYSIS")
    print("=" * 70)

    print()
    print(
        f"Student ID       : "
        f"{result['student_id']}"
    )

    print(
        f"Job ID           : "
        f"{result['job_id']}"
    )

    print(
        f"Overall Match    : "
        f"{result['overall_skill_match']}%"
    )

    print(
        f"Overall Gap      : "
        f"{result['overall_gap']}%"
    )

    print()
    print("Skill Analysis:")
    print("-" * 70)

    for item in result["skills"]:

        print(
            f"{item['skill']:25} "
            f"{item['status']:10} "
            f"{item['score']}%"
        )

    print()
    print(
        "Strong Skills    :",
        result["strong_skills"]
    )

    print(
        "Partial Skills   :",
        result["partial_skills"]
    )

    print(
        "Missing Skills   :",
        result["missing_skills"]
    )

    print(
        "Priority Skills  :",
        result["priority_skills"]
    )

    print()
    print("Learning Recommendations:")

    for item in result[
        "learning_recommendations"
    ]:

        print(
            f"- {item['skill']} "
            f"({item['priority']}): "
            f"{item['recommendation']}"
        )

    print()
    print("=" * 70)
    print("SKILL GAP ANALYSIS SUCCESSFUL")
    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()