from pathlib import Path
import csv
import json
import re
import sys
from itertools import product


# ============================================================
# CAMPUSLINK - Student Job Training Dataset Builder
# ============================================================
#
# Purpose:
#   Build a real labelled dataset for the Student-Job Matcher.
#
# Input:
#   data/students/students.json
#   data/jobs/jobs.json
#   data/requirements/job_requirements.json
#   data/processed/match_labels.csv   <- human/validated labels
#
# Output:
#   data/processed/student_job_training.csv
#
# Important:
#   This script NEVER invents match labels.
#   Labels must come from real/validated project decisions.
# ============================================================


ROOT_DIR = Path(__file__).resolve().parents[1]

STUDENTS_FILE = ROOT_DIR / "data" / "students" / "students.json"
JOBS_FILE = ROOT_DIR / "data" / "jobs" / "jobs.json"
REQUIREMENTS_FILE = ROOT_DIR / "data" / "requirements" / "job_requirements.json"

LABELS_FILE = ROOT_DIR / "data" / "processed" / "match_labels.csv"
OUTPUT_FILE = ROOT_DIR / "data" / "processed" / "student_job_training.csv"


# ------------------------------------------------------------
# Utility functions
# ------------------------------------------------------------

def load_json(path: Path):
    """Load a JSON file."""
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def normalize_text(value):
    """Convert a value into normalized lowercase text."""
    if value is None:
        return ""

    if isinstance(value, (list, tuple, set)):
        return " ".join(str(item) for item in value)

    if isinstance(value, dict):
        return " ".join(str(v) for v in value.values())

    return str(value)


def normalize_name(value):
    """
    Normalize a skill/language/degree string.

    Examples:
        'Python' -> 'python'
        'Fast API' -> 'fast api'
        'C++' -> 'c++'
    """
    text = normalize_text(value).strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def as_list(value):
    """
    Convert different JSON representations into a list.

    Supports:
        ["Python", "SQL"]
        "Python, SQL"
        "Python;SQL"
        None
    """
    if value is None:
        return []

    if isinstance(value, list):
        return [
            item
            for item in (
                normalize_name(v)
                for v in value
            )
            if item
        ]

    if isinstance(value, tuple):
        return [
            item
            for item in (
                normalize_name(v)
                for v in value
            )
            if item
        ]

    if isinstance(value, str):
        parts = re.split(r"[,;|]", value)

        return [
            normalize_name(part)
            for part in parts
            if normalize_name(part)
        ]

    if isinstance(value, dict):
        return [
            normalize_name(v)
            for v in value.values()
            if normalize_name(v)
        ]

    return [normalize_name(value)]


def first_value(data: dict, keys, default=None):
    """Return the first existing value among possible keys."""
    if not isinstance(data, dict):
        return default

    for key in keys:
        if key in data and data[key] is not None:
            return data[key]

    return default


def safe_float(value, default=0.0):
    """Convert value to float safely."""
    if value is None or value == "":
        return default

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value, default=0):
    """Convert value to integer safely."""
    if value is None or value == "":
        return default

    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def get_records(payload, possible_keys):
    """
    Extract a list of records from different JSON layouts.

    Accepted examples:

        [
          {...},
          {...}
        ]

    or:

        {
          "students": [
            {...}
          ]
        }

    or:

        {
          "jobs": [...]
        }
    """
    if isinstance(payload, list):
        return payload

    if isinstance(payload, dict):
        for key in possible_keys:
            value = payload.get(key)

            if isinstance(value, list):
                return value

        # Single-record dictionary
        if any(
            key in payload
            for key in [
                "student_id",
                "job_id",
                "id",
                "studentId",
                "jobId",
            ]
        ):
            return [payload]

    raise ValueError(
        f"Could not find a list of records. "
        f"Expected one of: {possible_keys}"
    )


# ------------------------------------------------------------
# Student normalization
# ------------------------------------------------------------

def normalize_student(student: dict):
    student_id = first_value(
        student,
        [
            "student_id",
            "studentId",
            "id",
            "user_id",
        ],
    )

    if student_id is None:
        return None

    skills = as_list(
        first_value(
            student,
            [
                "skills",
                "technical_skills",
                "technicalSkills",
                "skill_set",
            ],
            [],
        )
    )

    languages = as_list(
        first_value(
            student,
            [
                "languages",
                "programming_languages",
                "programmingLanguages",
                "language",
            ],
            [],
        )
    )

    degree = normalize_name(
        first_value(
            student,
            [
                "degree",
                "education_degree",
                "qualification",
            ],
            "",
        )
    )

    cgpa = safe_float(
        first_value(
            student,
            [
                "cgpa",
                "CGPA",
                "grade",
            ],
            0,
        )
    )

    experience = safe_float(
        first_value(
            student,
            [
                "experience",
                "experience_years",
                "experienceYears",
                "years_of_experience",
            ],
            0,
        )
    )

    return {
        "student_id": str(student_id),
        "skills": sorted(set(skills)),
        "languages": sorted(set(languages)),
        "degree": degree,
        "cgpa": cgpa,
        "experience_years": experience,
    }


# ------------------------------------------------------------
# Job normalization
# ------------------------------------------------------------

def normalize_job(job: dict):
    job_id = first_value(
        job,
        [
            "job_id",
            "jobId",
            "id",
        ],
    )

    if job_id is None:
        return None

    degree = normalize_name(
        first_value(
            job,
            [
                "degree",
                "education",
                "required_degree",
                "minimum_degree",
            ],
            "",
        )
    )

    minimum_cgpa = safe_float(
        first_value(
            job,
            [
                "minimum_cgpa",
                "min_cgpa",
                "minimumCGPA",
                "minCGPA",
                "cgpa",
            ],
            0,
        )
    )

    experience = safe_float(
        first_value(
            job,
            [
                "experience",
                "experience_years",
                "minimum_experience",
                "min_experience",
                "required_experience",
            ],
            0,
        )
    )

    languages = as_list(
        first_value(
            job,
            [
                "languages",
                "programming_languages",
                "required_languages",
                "programmingLanguages",
            ],
            [],
        )
    )

    technical_skills = as_list(
        first_value(
            job,
            [
                "technical_skills",
                "technicalSkills",
                "skills",
                "required_skills",
            ],
            [],
        )
    )

    requirements_text = normalize_text(
        first_value(
            job,
            [
                "requirements",
                "other_requirements",
                "otherRequirements",
                "description",
            ],
            "",
        )
    )

    return {
        "job_id": str(job_id),
        "title": normalize_text(
            first_value(
                job,
                [
                    "title",
                    "job_title",
                    "name",
                ],
                "",
            )
        ),
        "degree": degree,
        "minimum_cgpa": minimum_cgpa,
        "experience_years": experience,
        "languages": sorted(set(languages)),
        "technical_skills": sorted(set(technical_skills)),
        "requirements": requirements_text,
    }


# ------------------------------------------------------------
# Requirement normalization
# ------------------------------------------------------------

def normalize_requirements(payload):
    """
    Convert job requirements JSON into:

        {
            "JOB001": {
                ...
            }
        }

    Supports:
        [
            {...}
        ]

    and:

        {
            "JOB001": {...},
            "JOB002": {...}
        }

    and:

        {
            "requirements": [...]
        }
    """

    result = {}

    if isinstance(payload, list):
        records = payload

    elif isinstance(payload, dict):

        if isinstance(payload.get("requirements"), list):
            records = payload["requirements"]

        else:
            records = []

            for key, value in payload.items():

                if isinstance(value, dict):
                    item = dict(value)

                    if not any(
                        existing_key in item
                        for existing_key in [
                            "job_id",
                            "jobId",
                            "id",
                        ]
                    ):
                        item["job_id"] = key

                    records.append(item)

    else:
        records = []

    for item in records:

        if not isinstance(item, dict):
            continue

        job_id = first_value(
            item,
            [
                "job_id",
                "jobId",
                "id",
            ],
        )

        if job_id is None:
            continue

        result[str(job_id)] = item

    return result


# ------------------------------------------------------------
# Feature calculation
# ------------------------------------------------------------

def calculate_degree_match(student_degree, job_degree):
    """
    Binary degree compatibility.

    1 = compatible
    0 = not compatible

    Empty requirement is treated as no restriction.
    """
    student_degree = normalize_name(student_degree)
    job_degree = normalize_name(job_degree)

    if not job_degree:
        return 1

    if not student_degree:
        return 0

    if student_degree == job_degree:
        return 1

    # Handle cases such as:
    # "b.tech cse" vs "b.tech"
    student_words = set(student_degree.split())
    job_words = set(job_degree.split())

    if job_words and job_words.issubset(student_words):
        return 1

    return 0


def calculate_language_match(student_languages, job_languages):
    """
    Percentage of required languages matched.

    Returns value between 0 and 1.
    """
    required = set(
        normalize_name(language)
        for language in job_languages
        if normalize_name(language)
    )

    available = set(
        normalize_name(language)
        for language in student_languages
        if normalize_name(language)
    )

    if not required:
        return 1.0

    matched = required.intersection(available)

    return len(matched) / len(required)


def calculate_skill_match(student_skills, job_skills):
    """
    Percentage of required technical skills matched.

    Returns value between 0 and 1.
    """
    required = set(
        normalize_name(skill)
        for skill in job_skills
        if normalize_name(skill)
    )

    available = set(
        normalize_name(skill)
        for skill in student_skills
        if normalize_name(skill)
    )

    if not required:
        return 1.0, 0, 0

    matched = required.intersection(available)

    score = len(matched) / len(required)

    return score, len(required), len(matched)


# ------------------------------------------------------------
# Labels
# ------------------------------------------------------------

def load_labels():
    """
    Load real/human validated labels.

    Required CSV columns:

        student_id
        job_id
        match_label

    match_label:
        1 = positive/good match
        0 = negative/poor match
    """

    if not LABELS_FILE.exists():
        return {}

    labels = {}

    with LABELS_FILE.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        reader = csv.DictReader(file)

        required_columns = {
            "student_id",
            "job_id",
            "match_label",
        }

        if not reader.fieldnames:
            raise ValueError(
                f"{LABELS_FILE} has no header row."
            )

        missing = required_columns.difference(
            set(reader.fieldnames)
        )

        if missing:
            raise ValueError(
                "Missing label columns: "
                + ", ".join(sorted(missing))
            )

        for row in reader:

            student_id = str(
                row["student_id"]
            ).strip()

            job_id = str(
                row["job_id"]
            ).strip()

            label = str(
                row["match_label"]
            ).strip()

            if not student_id or not job_id:
                continue

            if label not in {"0", "1"}:
                raise ValueError(
                    f"Invalid match_label '{label}' "
                    f"for {student_id}/{job_id}. "
                    f"Use only 0 or 1."
                )

            labels[
                (student_id, job_id)
            ] = int(label)

    return labels


# ------------------------------------------------------------
# Create label template
# ------------------------------------------------------------

def create_label_template(students, jobs):
    """
    Create a template containing every possible
    student-job pair.

    The user/team must fill match_label manually.
    """

    LABELS_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with LABELS_FILE.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            "student_id",
            "job_id",
            "match_label",
        ])

        for student, job in product(students, jobs):

            writer.writerow([
                student["student_id"],
                job["job_id"],
                "",
            ])

    print()
    print("[INFO] Label template created:")
    print(LABELS_FILE)
    print()
    print("Fill match_label with:")
    print("  1 = positive/good match")
    print("  0 = negative/poor match")
    print()
    print("Do not leave labels blank for rows used for training.")


# ------------------------------------------------------------
# Build dataset
# ------------------------------------------------------------

def build_dataset(
    students,
    jobs,
    requirements,
    labels,
):
    rows = []

    for student in students:

        for job in jobs:

            job_id = job["job_id"]

            # Merge additional requirements if available.
            requirement = requirements.get(
                job_id,
                {},
            )

            merged_job = dict(job)

            requirement_degree = first_value(
                requirement,
                [
                    "degree",
                    "required_degree",
                    "minimum_degree",
                ],
                None,
            )

            if requirement_degree:
                merged_job["degree"] = requirement_degree

            requirement_cgpa = first_value(
                requirement,
                [
                    "minimum_cgpa",
                    "min_cgpa",
                    "minimumCGPA",
                    "minCGPA",
                ],
                None,
            )

            if requirement_cgpa is not None:
                merged_job["minimum_cgpa"] = safe_float(
                    requirement_cgpa
                )

            requirement_experience = first_value(
                requirement,
                [
                    "experience",
                    "experience_years",
                    "minimum_experience",
                    "min_experience",
                ],
                None,
            )

            if requirement_experience is not None:
                merged_job["experience_years"] = safe_float(
                    requirement_experience
                )

            requirement_languages = first_value(
                requirement,
                [
                    "languages",
                    "programming_languages",
                    "required_languages",
                    "programmingLanguages",
                ],
                None,
            )

            if requirement_languages is not None:
                merged_job["languages"] = as_list(
                    requirement_languages
                )

            requirement_skills = first_value(
                requirement,
                [
                    "technical_skills",
                    "technicalSkills",
                    "skills",
                    "required_skills",
                ],
                None,
            )

            if requirement_skills is not None:
                merged_job["technical_skills"] = as_list(
                    requirement_skills
                )

            degree_match = calculate_degree_match(
                student["degree"],
                merged_job.get("degree", ""),
            )

            language_match = calculate_language_match(
                student["languages"],
                merged_job.get("languages", []),
            )

            technical_skill_match, required_count, matched_count = (
                calculate_skill_match(
                    student["skills"],
                    merged_job.get("technical_skills", []),
                )
            )

            student_experience = student[
                "experience_years"
            ]

            required_experience = safe_float(
                merged_job.get(
                    "experience_years",
                    0,
                )
            )

            experience_match = (
                1
                if student_experience >= required_experience
                else 0
            )

            minimum_cgpa = safe_float(
                merged_job.get(
                    "minimum_cgpa",
                    0,
                )
            )

            cgpa_match = (
                1
                if student["cgpa"] >= minimum_cgpa
                else 0
            )

            key = (
                student["student_id"],
                job_id,
            )

            row = {
                "student_id": student["student_id"],
                "job_id": job_id,
                "cgpa": round(
                    student["cgpa"],
                    2,
                ),
                "experience_years": round(
                    student["experience_years"],
                    2,
                ),
                "degree_match": degree_match,
                "language_match": round(
                    language_match,
                    4,
                ),
                "technical_skill_match": round(
                    technical_skill_match,
                    4,
                ),
                "required_skill_count": required_count,
                "matched_skill_count": matched_count,
                "experience_match": experience_match,
                "cgpa_match": cgpa_match,
                "match_label": labels.get(key, ""),
            }

            rows.append(row)

    return rows


# ------------------------------------------------------------
# Save dataset
# ------------------------------------------------------------

def save_dataset(rows):
    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    fieldnames = [
        "student_id",
        "job_id",
        "cgpa",
        "experience_years",
        "degree_match",
        "language_match",
        "technical_skill_match",
        "required_skill_count",
        "matched_skill_count",
        "experience_match",
        "cgpa_match",
        "match_label",
    ]

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        writer.writerows(rows)


# ------------------------------------------------------------
# Statistics
# ------------------------------------------------------------

def print_statistics(rows, labels):
    total = len(rows)

    labelled = [
        row
        for row in rows
        if row["match_label"] in (0, 1)
        or str(row["match_label"]) in {"0", "1"}
    ]

    positive = sum(
        1
        for row in labelled
        if int(row["match_label"]) == 1
    )

    negative = sum(
        1
        for row in labelled
        if int(row["match_label"]) == 0
    )

    print()
    print("=" * 60)
    print("DATASET SUMMARY")
    print("=" * 60)

    print(f"Total student-job pairs : {total}")
    print(f"Labelled pairs           : {len(labelled)}")
    print(f"Positive labels (1)      : {positive}")
    print(f"Negative labels (0)      : {negative}")
    print(f"Unlabelled pairs         : {total - len(labelled)}")

    if total:
        print(
            f"Label coverage           : "
            f"{(len(labelled) / total) * 100:.2f}%"
        )

    print()

    if not labels:
        print("[WARNING]")
        print("No real labels were found.")

    elif positive == 0 or negative == 0:
        print("[WARNING]")
        print(
            "Both classes are required for supervised learning."
        )
        print(
            "You need at least some label=1 and label=0 rows."
        )

    else:
        print("[OK]")
        print("Both positive and negative labels are present.")

    print("=" * 60)


# ------------------------------------------------------------
# Main
# ------------------------------------------------------------

def main():

    print("=" * 60)
    print("CAMPUSLINK TRAINING DATASET BUILDER")
    print("=" * 60)

    try:

        # ----------------------------------------------------
        # 1. Load students
        # ----------------------------------------------------

        print()
        print("[1] Loading students...")

        students_payload = load_json(
            STUDENTS_FILE
        )

        student_records = get_records(
            students_payload,
            [
                "students",
                "data",
                "records",
            ],
        )

        students = []

        for record in student_records:

            normalized = normalize_student(
                record
            )

            if normalized:
                students.append(
                    normalized
                )

        print(
            f"Students loaded: {len(students)}"
        )

        # ----------------------------------------------------
        # 2. Load jobs
        # ----------------------------------------------------

        print()
        print("[2] Loading jobs...")

        jobs_payload = load_json(
            JOBS_FILE
        )

        job_records = get_records(
            jobs_payload,
            [
                "jobs",
                "data",
                "records",
            ],
        )

        jobs = []

        for record in job_records:

            normalized = normalize_job(
                record
            )

            if normalized:
                jobs.append(
                    normalized
                )

        print(
            f"Jobs loaded: {len(jobs)}"
        )

        # ----------------------------------------------------
        # 3. Load requirements
        # ----------------------------------------------------

        print()
        print("[3] Loading job requirements...")

        if REQUIREMENTS_FILE.exists():

            requirements_payload = load_json(
                REQUIREMENTS_FILE
            )

            requirements = normalize_requirements(
                requirements_payload
            )

            print(
                f"Requirement records: "
                f"{len(requirements)}"
            )

        else:

            print(
                "[INFO] No separate requirements file found."
            )

            requirements = {}

        # ----------------------------------------------------
        # 4. Label template
        # ----------------------------------------------------

        print()
        print("[4] Checking real labels...")

        labels = load_labels()

        if not labels:

            print(
                "[INFO] No match_labels.csv found."
            )

            print(
                "[INFO] Creating label template..."
            )

            create_label_template(
                students,
                jobs,
            )

            print()
            print("NEXT ACTION:")
            print("1. Open:")
            print(LABELS_FILE)
            print()
            print("2. Fill match_label:")
            print("   1 = positive/good match")
            print("   0 = negative/poor match")
            print()
            print("3. Save the CSV.")
            print()
            print(
                "4. Run this script again."
            )

            return

        print(
            f"Validated labels found: {len(labels)}"
        )

        # ----------------------------------------------------
        # 5. Build feature dataset
        # ----------------------------------------------------

        print()
        print("[5] Building student-job features...")

        rows = build_dataset(
            students=students,
            jobs=jobs,
            requirements=requirements,
            labels=labels,
        )

        # ----------------------------------------------------
        # 6. Save
        # ----------------------------------------------------

        print()
        print("[6] Saving training dataset...")

        save_dataset(rows)

        print(
            f"Dataset saved to:\n{OUTPUT_FILE}"
        )

        # ----------------------------------------------------
        # 7. Statistics
        # ----------------------------------------------------

        print_statistics(
            rows,
            labels,
        )

        # ----------------------------------------------------
        # 8. Training readiness
        # ----------------------------------------------------

        labelled = [
            row
            for row in rows
            if row["match_label"] in (0, 1)
        ]

        positive = sum(
            1
            for row in labelled
            if int(row["match_label"]) == 1
        )

        negative = sum(
            1
            for row in labelled
            if int(row["match_label"]) == 0
        )

        print()

        if (
            len(labelled) >= 20
            and positive > 0
            and negative > 0
        ):
            print("[READY]")
            print(
                "The dataset has enough labelled rows "
                "for the initial training script."
            )
            print(
                "You can proceed to Step 2: model training."
            )

        else:
            print("[NOT READY YET]")

            if len(labelled) < 20:
                print(
                    f"- Labelled rows: {len(labelled)}"
                )
                print(
                    "- Recommended minimum for this "
                    "initial project model: 20+"
                )

            if positive == 0:
                print(
                    "- Add positive match labels (1)."
                )

            if negative == 0:
                print(
                    "- Add negative match labels (0)."
                )

        print()
        print("=" * 60)
        print("DATASET BUILD FINISHED")
        print("=" * 60)

    except Exception as exc:

        print()
        print("=" * 60)
        print("ERROR")
        print("=" * 60)
        print(str(exc))
        print("=" * 60)

        sys.exit(1)


if __name__ == "__main__":
    main()