import json
import re
from pathlib import Path


print(">>> CAMPUSLINK ELIGIBILITY ENGINE LOADED <<<", flush=True)


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"

STUDENTS_FILE = DATA_DIR / "students" / "students.json"
JOBS_FILE = DATA_DIR / "jobs" / "jobs.json"


# ============================================================
# ELIGIBILITY WEIGHTS
# ============================================================

CGPA_WEIGHT = 0.25
EDUCATION_WEIGHT = 0.15
EXPERIENCE_WEIGHT = 0.10
TECHNICAL_SKILLS_WEIGHT = 0.50


# ============================================================
# SKILL NORMALIZATION
# ============================================================

SKILL_ALIASES = {
    "python3": "python",
    "py": "python",
    "java8": "java",
    "java11": "java",
    "js": "javascript",
    "ts": "typescript",
    "sql": "sql",
    "structured query language": "sql",
    "ml": "machine learning",
    "machinelearning": "machine learning",
    "dsa": "data structures",
    "rest": "rest api",
    "restful api": "rest api",
}


def normalize_text(value):
    if value is None:
        return ""

    value = str(value).strip().lower()
    value = re.sub(r"\s+", " ", value)

    return value


def normalize_skill(skill):
    skill = normalize_text(skill)

    if not skill:
        return ""

    skill = skill.replace("-", " ")
    skill = skill.replace("_", " ")
    skill = re.sub(r"\s+", " ", skill).strip()

    return SKILL_ALIASES.get(skill, skill)


def normalize_skill_list(skills):
    if not skills:
        return []

    result = []

    for skill in skills:
        normalized = normalize_skill(skill)

        if normalized and normalized not in result:
            result.append(normalized)

    return result


# ============================================================
# DATA LOADING
# ============================================================

def load_json(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_students():
    return load_json(STUDENTS_FILE)


def load_jobs():
    return load_json(JOBS_FILE)


# ============================================================
# CGPA
# ============================================================

def calculate_cgpa_score(student_cgpa, minimum_cgpa):

    try:
        student_cgpa = float(student_cgpa)
        minimum_cgpa = float(minimum_cgpa)
    except (TypeError, ValueError):
        return 0.0

    if minimum_cgpa <= 0:
        return 100.0

    score = (student_cgpa / minimum_cgpa) * 100

    return round(
        min(max(score, 0.0), 100.0),
        2
    )


# ============================================================
# EDUCATION
# ============================================================

def calculate_education_score(
    student_degree,
    required_degrees
):

    student_degree = normalize_text(
        student_degree
    )

    required_degrees = [
        normalize_text(degree)
        for degree in (required_degrees or [])
    ]

    required_degrees = [
        degree
        for degree in required_degrees
        if degree
    ]

    if not required_degrees:
        return 100.0

    if student_degree in required_degrees:
        return 100.0

    return 0.0


# ============================================================
# EXPERIENCE
# ============================================================

def calculate_experience_score(
    student_experience,
    minimum_experience
):

    try:
        student_experience = float(
            student_experience or 0
        )

        minimum_experience = float(
            minimum_experience or 0
        )

    except (TypeError, ValueError):
        return 0.0

    if minimum_experience <= 0:
        return 100.0

    score = (
        student_experience
        / minimum_experience
    ) * 100

    return round(
        min(max(score, 0.0), 100.0),
        2
    )


# ============================================================
# TECHNICAL SKILLS
# ============================================================

def calculate_technical_skill_score(
    student_skills,
    required_skills
):

    student_skills = set(
        normalize_skill_list(
            student_skills
        )
    )

    required_skills = set(
        normalize_skill_list(
            required_skills
        )
    )

    if not required_skills:
        return 100.0, [], []

    matched_skills = sorted(
        student_skills.intersection(
            required_skills
        )
    )

    missing_skills = sorted(
        required_skills.difference(
            student_skills
        )
    )

    score = (
        len(matched_skills)
        / len(required_skills)
    ) * 100

    return (
        round(score, 2),
        matched_skills,
        missing_skills
    )


# ============================================================
# HARD REQUIREMENTS
# ============================================================

def check_hard_requirements(
    student,
    job
):

    failures = []

    # ----------------------------
    # CGPA
    # ----------------------------

    student_cgpa = float(
        student.get("cgpa", 0) or 0
    )

    minimum_cgpa = float(
        job.get("minimum_cgpa", 0) or 0
    )

    if student_cgpa < minimum_cgpa:

        failures.append(
            f"CGPA below minimum requirement "
            f"({student_cgpa} < {minimum_cgpa})"
        )

    # ----------------------------
    # Degree
    # ----------------------------

    student_degree = normalize_text(
        student.get("degree", "")
    )

    required_degrees = [
        normalize_text(degree)
        for degree in job.get(
            "degree_required",
            []
        )
    ]

    if (
        required_degrees
        and student_degree not in required_degrees
    ):

        failures.append(
            "Degree does not satisfy requirement "
            f"({student.get('degree', '')})"
        )

    # ----------------------------
    # Experience
    # ----------------------------

    student_experience = float(
        student.get(
            "experience_years",
            0
        ) or 0
    )

    minimum_experience = float(
        job.get(
            "experience_required",
            0
        ) or 0
    )

    if student_experience < minimum_experience:

        failures.append(
            "Experience below minimum requirement "
            f"({student_experience} < "
            f"{minimum_experience} years)"
        )

    # ----------------------------
    # Programming languages
    # ----------------------------

    student_languages = set(
        normalize_skill_list(
            student.get(
                "programming_languages",
                []
            )
        )
    )

    required_languages = set(
        normalize_skill_list(
            job.get(
                "required_languages",
                []
            )
        )
    )

    missing_languages = sorted(
        required_languages
        - student_languages
    )

    if missing_languages:

        failures.append(
            "Missing required programming "
            "languages: "
            + ", ".join(missing_languages)
        )

    return failures


# ============================================================
# COMPLETE ELIGIBILITY
# ============================================================

def calculate_eligibility(
    student,
    job
):

    # ----------------------------
    # Calculate components
    # ----------------------------

    cgpa_score = calculate_cgpa_score(
        student.get("cgpa", 0),
        job.get("minimum_cgpa", 0)
    )

    education_score = calculate_education_score(
        student.get("degree", ""),
        job.get("degree_required", [])
    )

    experience_score = calculate_experience_score(
        student.get(
            "experience_years",
            0
        ),
        job.get(
            "experience_required",
            0
        )
    )

    (
        technical_skill_score,
        matched_skills,
        missing_skills
    ) = calculate_technical_skill_score(
        student.get("skills", []),
        job.get("required_skills", [])
    )

    # ----------------------------
    # Weighted eligibility
    # ----------------------------

    eligibility_score = (
        cgpa_score * CGPA_WEIGHT
        + education_score * EDUCATION_WEIGHT
        + experience_score * EXPERIENCE_WEIGHT
        + technical_skill_score
        * TECHNICAL_SKILLS_WEIGHT
    )

    eligibility_score = round(
        eligibility_score,
        2
    )

    # ----------------------------
    # Hard requirements
    # ----------------------------

    hard_requirement_failures = (
        check_hard_requirements(
            student,
            job
        )
    )

    # ----------------------------
    # Cutoff
    # ----------------------------

    cutoff = float(
        job.get(
            "eligibility_cutoff",
            0
        ) or 0
    )

    meets_score_cutoff = (
        eligibility_score >= cutoff
    )

    hard_requirements_satisfied = (
        len(hard_requirement_failures) == 0
    )

    is_eligible = (
        meets_score_cutoff
        and hard_requirements_satisfied
    )

    status = (
        "ELIGIBLE"
        if is_eligible
        else "NOT_ELIGIBLE"
    )

    # ----------------------------
    # Final result
    # ----------------------------

    return {

        "student_id":
            student.get("student_id"),

        "student_name":
            student.get("name"),

        "job_id":
            job.get("job_id"),

        "job_title":
            job.get("job_title"),

        "eligibility_percentage":
            eligibility_score,

        "eligibility_cutoff":
            cutoff,

        "status":
            status,

        "component_scores": {

            "cgpa":
                cgpa_score,

            "education":
                education_score,

            "experience":
                experience_score,

            "technical_skills":
                technical_skill_score
        },

        "component_weights": {

            "cgpa":
                CGPA_WEIGHT,

            "education":
                EDUCATION_WEIGHT,

            "experience":
                EXPERIENCE_WEIGHT,

            "technical_skills":
                TECHNICAL_SKILLS_WEIGHT
        },

        "matched_skills":
            matched_skills,

        "missing_skills":
            missing_skills,

        "hard_requirement_failures":
            hard_requirement_failures,

        "meets_score_cutoff":
            meets_score_cutoff,

        "hard_requirements_satisfied":
            hard_requirements_satisfied
    }


# ============================================================
# DISPLAY
# ============================================================

def print_result(result):

    print()
    print("=" * 70)

    print(
        f"Student : {result['student_name']}"
    )

    print(
        f"Job     : {result['job_title']}"
    )

    print(
        "Eligibility Score : "
        f"{result['eligibility_percentage']:.2f}%"
    )

    print(
        "Eligibility Cutoff : "
        f"{result['eligibility_cutoff']:.2f}%"
    )

    print(
        f"Status : {result['status']}"
    )

    print("-" * 70)

    scores = result["component_scores"]

    print("Component Scores:")

    print(
        f"  CGPA             : "
        f"{scores['cgpa']:.2f}%"
    )

    print(
        f"  Education        : "
        f"{scores['education']:.2f}%"
    )

    print(
        f"  Experience       : "
        f"{scores['experience']:.2f}%"
    )

    print(
        f"  Technical Skills : "
        f"{scores['technical_skills']:.2f}%"
    )

    print("-" * 70)

    print("Matched Skills:")

    if result["matched_skills"]:

        for skill in result["matched_skills"]:
            print(f"  ✓ {skill}")

    else:
        print("  None")

    print()

    print("Missing Skills:")

    if result["missing_skills"]:

        for skill in result["missing_skills"]:
            print(f"  ✗ {skill}")

    else:
        print("  None")

    print()

    print("Hard Requirement Failures:")

    if result["hard_requirement_failures"]:

        for failure in result[
            "hard_requirement_failures"
        ]:
            print(f"  ✗ {failure}")

    else:
        print("  None")

    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("CAMPUSLINK AI/ML - ELIGIBILITY ENGINE")
    print("=" * 70)

    print()
    print(
        f"Students file: {STUDENTS_FILE}"
    )

    print(
        f"Jobs file    : {JOBS_FILE}"
    )

    # ----------------------------
    # Verify files
    # ----------------------------

    if not STUDENTS_FILE.exists():

        print(
            f"ERROR: Students file not found:"
            f"\n{STUDENTS_FILE}"
        )

        return

    if not JOBS_FILE.exists():

        print(
            f"ERROR: Jobs file not found:"
            f"\n{JOBS_FILE}"
        )

        return

    # ----------------------------
    # Load data
    # ----------------------------

    students = load_students()
    jobs = load_jobs()

    print()
    print(
        f"Students loaded : {len(students)}"
    )

    print(
        f"Jobs loaded     : {len(jobs)}"
    )

    # ----------------------------
    # Weights
    # ----------------------------

    print()
    print("Eligibility Weights:")

    print(
        f"  CGPA             : "
        f"{CGPA_WEIGHT * 100:.0f}%"
    )

    print(
        f"  Education        : "
        f"{EDUCATION_WEIGHT * 100:.0f}%"
    )

    print(
        f"  Experience       : "
        f"{EXPERIENCE_WEIGHT * 100:.0f}%"
    )

    print(
        f"  Technical Skills : "
        f"{TECHNICAL_SKILLS_WEIGHT * 100:.0f}%"
    )

    # ----------------------------
    # Evaluate
    # ----------------------------

    for job in jobs:

        print()
        print("#" * 70)

        print(
            f"JOB: {job['job_id']} - "
            f"{job['job_title']}"
        )

        print("#" * 70)

        for student in students:

            result = calculate_eligibility(
                student,
                job
            )

            print_result(result)

    print()
    print("=" * 70)
    print("ELIGIBILITY ENGINE TEST COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()