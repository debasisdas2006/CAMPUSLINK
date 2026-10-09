"""
CAMPUSLINK AI/ML
Preprocessing Module

This module:
1. Loads JSON datasets
2. Normalizes student data
3. Normalizes job data
4. Normalizes skills
5. Prints a preprocessing report
"""

import json
import re
from pathlib import Path


# ============================================================
# PROJECT PATHS
# ============================================================

SRC_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SRC_DIR.parent
DATA_DIR = PROJECT_DIR / "data"


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
    "typescript": "typescript",

    "cpp": "c++",
    "c plus plus": "c++",

    "c sharp": "c#",
    "csharp": "c#",

    "postgres": "postgresql",
    "postgre sql": "postgresql",

    "mongo": "mongodb",

    "ml": "machine learning",
    "machine-learning": "machine learning",

    "ai": "artificial intelligence",
    "artificial-intelligence": "artificial intelligence"
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(value):
    """
    Convert a value into clean lowercase text.
    """

    if value is None:
        return ""

    value = str(value).strip().lower()

    value = value.replace("-", " ")

    value = re.sub(r"\s+", " ", value)

    return value


# ============================================================
# SKILL NORMALIZATION
# ============================================================

def normalize_skill(skill):
    """
    Normalize one skill.
    """

    skill = normalize_text(skill)

    if not skill:
        return ""

    return SKILL_ALIASES.get(skill, skill)


def normalize_skill_list(skills):
    """
    Normalize and remove duplicate skills.
    """

    if not skills:
        return []

    normalized_skills = []

    for skill in skills:

        normalized = normalize_skill(skill)

        if normalized and normalized not in normalized_skills:
            normalized_skills.append(normalized)

    return normalized_skills


# ============================================================
# JSON LOADER
# ============================================================

def load_json(file_path):
    """
    Load JSON data from a file.
    """

    print(f"Loading: {file_path}")

    if not file_path.exists():
        raise FileNotFoundError(
            f"\nData file does not exist:\n{file_path}"
        )

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


# ============================================================
# LOAD STUDENTS
# ============================================================

def load_students():

    file_path = (
        DATA_DIR
        / "students"
        / "students.json"
    )

    return load_json(file_path)


# ============================================================
# LOAD JOBS
# ============================================================

def load_jobs():

    file_path = (
        DATA_DIR
        / "jobs"
        / "jobs.json"
    )

    return load_json(file_path)


# ============================================================
# LOAD COMPANIES
# ============================================================

def load_companies():

    file_path = (
        DATA_DIR
        / "companies"
        / "companies.json"
    )

    return load_json(file_path)


# ============================================================
# LOAD COLLEGES
# ============================================================

def load_colleges():

    file_path = (
        DATA_DIR
        / "colleges"
        / "colleges.json"
    )

    return load_json(file_path)


# ============================================================
# LOAD REQUIREMENTS
# ============================================================

def load_requirements():

    file_path = (
        DATA_DIR
        / "requirements"
        / "job_requirements.json"
    )

    return load_json(file_path)


# ============================================================
# PREPROCESS STUDENT
# ============================================================

def preprocess_student(student):

    processed = dict(student)

    processed["student_id"] = str(
        student.get("student_id", "")
    ).strip()

    processed["name"] = str(
        student.get("name", "")
    ).strip()

    processed["email"] = str(
        student.get("email", "")
    ).strip().lower()

    processed["college_id"] = str(
        student.get("college_id", "")
    ).strip()

    processed["degree"] = str(
        student.get("degree", "")
    ).strip()

    processed["branch"] = str(
        student.get("branch", "")
    ).strip()

    processed["cgpa"] = float(
        student.get("cgpa", 0)
    )

    processed["experience_years"] = float(
        student.get(
            "experience_years",
            0
        )
    )

    processed["skills"] = normalize_skill_list(
        student.get("skills", [])
    )

    processed["programming_languages"] = (
        normalize_skill_list(
            student.get(
                "programming_languages",
                []
            )
        )
    )

    return processed


# ============================================================
# PREPROCESS ALL STUDENTS
# ============================================================

def preprocess_students(students):

    processed_students = []

    for student in students:

        processed_student = preprocess_student(
            student
        )

        processed_students.append(
            processed_student
        )

    return processed_students


# ============================================================
# PREPROCESS JOB
# ============================================================

def preprocess_job(job):

    processed = dict(job)

    processed["job_id"] = str(
        job.get("job_id", "")
    ).strip()

    processed["company_id"] = str(
        job.get("company_id", "")
    ).strip()

    processed["job_title"] = str(
        job.get("job_title", "")
    ).strip()

    processed["minimum_cgpa"] = float(
        job.get("minimum_cgpa", 0)
    )

    processed["experience_required"] = float(
        job.get(
            "experience_required",
            0
        )
    )

    processed["required_languages"] = (
        normalize_skill_list(
            job.get(
                "required_languages",
                []
            )
        )
    )

    processed["required_skills"] = (
        normalize_skill_list(
            job.get(
                "required_skills",
                []
            )
        )
    )

    processed["degree_required"] = [
        str(degree).strip()
        for degree in job.get(
            "degree_required",
            []
        )
    ]

    processed["eligibility_cutoff"] = float(
        job.get(
            "eligibility_cutoff",
            70
        )
    )

    processed["interview_cutoff"] = float(
        job.get(
            "interview_cutoff",
            60
        )
    )

    return processed


# ============================================================
# PREPROCESS ALL JOBS
# ============================================================

def preprocess_jobs(jobs):

    processed_jobs = []

    for job in jobs:

        processed_job = preprocess_job(
            job
        )

        processed_jobs.append(
            processed_job
        )

    return processed_jobs


# ============================================================
# PRINT STUDENT REPORT
# ============================================================

def print_student_report(students):

    print()
    print("=" * 70)
    print("PROCESSED STUDENT DATA")
    print("=" * 70)

    for student in students:

        print()
        print(
            f"Student ID : {student['student_id']}"
        )

        print(
            f"Name       : {student['name']}"
        )

        print(
            f"College    : {student['college_id']}"
        )

        print(
            f"Degree     : {student['degree']}"
        )

        print(
            f"Branch     : {student['branch']}"
        )

        print(
            f"CGPA       : {student['cgpa']}"
        )

        print(
            f"Experience : "
            f"{student['experience_years']} years"
        )

        print(
            f"Skills     : "
            f"{', '.join(student['skills'])}"
        )

        print(
            f"Languages  : "
            f"{', '.join(student['programming_languages'])}"
        )


# ============================================================
# PRINT JOB REPORT
# ============================================================

def print_job_report(jobs):

    print()
    print("=" * 70)
    print("PROCESSED JOB DATA")
    print("=" * 70)

    for job in jobs:

        print()

        print(
            f"Job ID     : {job['job_id']}"
        )

        print(
            f"Job Title  : {job['job_title']}"
        )

        print(
            f"Company ID : {job['company_id']}"
        )

        print(
            f"Min CGPA   : {job['minimum_cgpa']}"
        )

        print(
            f"Experience : "
            f"{job['experience_required']} years"
        )

        print(
            f"Languages  : "
            f"{', '.join(job['required_languages'])}"
        )

        print(
            f"Skills     : "
            f"{', '.join(job['required_skills'])}"
        )

        print(
            f"Degrees    : "
            f"{', '.join(job['degree_required'])}"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("CAMPUSLINK AI/ML PREPROCESSING")
    print("=" * 70)

    print()
    print(f"Project directory:")
    print(PROJECT_DIR)

    print()
    print(f"Data directory:")
    print(DATA_DIR)

    print()
    print("Loading datasets...")
    print("-" * 70)

    students = load_students()

    jobs = load_jobs()

    companies = load_companies()

    colleges = load_colleges()

    requirements = load_requirements()

    print()
    print("Dataset loading completed.")

    print()
    print("=" * 70)
    print("DATASET COUNTS")
    print("=" * 70)

    print(
        f"Students     : {len(students)}"
    )

    print(
        f"Jobs         : {len(jobs)}"
    )

    print(
        f"Companies    : {len(companies)}"
    )

    print(
        f"Colleges     : {len(colleges)}"
    )

    print(
        f"Requirements : {len(requirements)}"
    )

    print()
    print("Starting preprocessing...")

    processed_students = preprocess_students(
        students
    )

    processed_jobs = preprocess_jobs(
        jobs
    )

    print()
    print("Preprocessing completed.")

    print_student_report(
        processed_students
    )

    print_job_report(
        processed_jobs
    )

    print()
    print("=" * 70)
    print("PREPROCESSING SUCCESSFUL")
    print("=" * 70)


# ============================================================
# PROGRAM ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()