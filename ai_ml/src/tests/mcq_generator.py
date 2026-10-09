import json
import random
import sys
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


DATA_DIR = BASE_DIR / "data"

QUESTION_BANK_FILE = (
    DATA_DIR
    / "test_questions"
    / "question_bank.json"
)


# ============================================================
# QUESTION BANK
# ============================================================

def load_question_bank():

    if not QUESTION_BANK_FILE.exists():

        raise FileNotFoundError(
            f"Question bank not found:\n"
            f"{QUESTION_BANK_FILE}"
        )

    with open(
        QUESTION_BANK_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


# ============================================================
# NORMALIZATION
# ============================================================

SKILL_ALIASES = {
    "python3": "python",
    "py": "python",
    "js": "javascript",
    "dsa": "data structures",
    "ml": "machine learning",
    "rest": "rest api",
    "restful api": "rest api"
}


def normalize_skill(skill):

    if skill is None:
        return ""

    skill = str(skill).strip().lower()

    skill = skill.replace("-", " ")
    skill = skill.replace("_", " ")

    return SKILL_ALIASES.get(
        skill,
        skill
    )


# ============================================================
# QUESTION FILTERING
# ============================================================

def get_questions_for_skills(
    question_bank,
    skills
):
    """
    Return questions relevant to the student's
    target skills.
    """

    normalized_skills = {
        normalize_skill(skill)
        for skill in skills
    }

    questions = []

    for question in question_bank:

        question_skill = normalize_skill(
            question.get("skill")
        )

        if question_skill in normalized_skills:

            questions.append(question)

    return questions


# ============================================================
# DIFFICULTY FILTER
# ============================================================

def get_questions_by_difficulty(
    questions,
    difficulty
):

    difficulty = difficulty.lower()

    return [
        question
        for question in questions
        if question.get(
            "difficulty",
            ""
        ).lower() == difficulty
    ]


# ============================================================
# RANDOM OPTION ORDER
# ============================================================

def randomize_options(question):

    options = question.get(
        "options",
        {}
    )

    correct_answer = question.get(
        "correct_answer"
    )

    option_items = list(
        options.items()
    )

    random.shuffle(option_items)

    randomized_options = {}

    correct_option = None

    labels = [
        "A",
        "B",
        "C",
        "D"
    ]

    for index, (_, value) in enumerate(
        option_items
    ):

        new_label = labels[index]

        randomized_options[
            new_label
        ] = value

        original_label = option_items[index][0]

        if original_label == correct_answer:
            correct_option = new_label

    result = dict(question)

    result["options"] = randomized_options

    # Internal answer used only by evaluator.
    result["_correct_answer"] = correct_option

    return result


# ============================================================
# CREATE TEST
# ============================================================

def generate_mcq_test(
    skills,
    question_count=5,
    difficulty=None,
    seed=None
):
    """
    Generate a randomized MCQ test.

    Parameters
    ----------
    skills:
        Required skills for the target job.

    question_count:
        Number of questions.

    difficulty:
        Optional easy/medium/hard filter.

    seed:
        Optional seed for deterministic testing.
    """

    if seed is not None:
        random.seed(seed)

    question_bank = load_question_bank()

    # --------------------------------------------------------
    # Find relevant questions
    # --------------------------------------------------------

    available_questions = (
        get_questions_for_skills(
            question_bank,
            skills
        )
    )

    # --------------------------------------------------------
    # Difficulty filter
    # --------------------------------------------------------

    if difficulty:

        filtered_questions = (
            get_questions_by_difficulty(
                available_questions,
                difficulty
            )
        )

        # Only apply difficulty filter if
        # enough questions are available.
        if len(filtered_questions) >= question_count:

            available_questions = (
                filtered_questions
            )

    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    if not available_questions:

        raise ValueError(
            "No MCQ questions found for "
            f"skills: {skills}"
        )

    # --------------------------------------------------------
    # Select questions
    # --------------------------------------------------------

    selected_questions = random.sample(
        available_questions,
        min(
            question_count,
            len(available_questions)
        )
    )

    # --------------------------------------------------------
    # Randomize options
    # --------------------------------------------------------

    test_questions = []

    for question in selected_questions:

        randomized = randomize_options(
            question
        )

        # Do not expose answer to student.
        randomized.pop(
            "correct_answer",
            None
        )

        test_questions.append(
            randomized
        )

    return test_questions


# ============================================================
# BUILD TEST FROM JOB
# ============================================================

def generate_test_for_job(
    student,
    job,
    question_count=5,
    difficulty=None,
    seed=None
):
    """
    Generate a self-assessment test based on
    the skills required by a job.
    """

    required_skills = []

    required_skills.extend(
        job.get(
            "required_skills",
            []
        )
    )

    required_skills.extend(
        job.get(
            "required_languages",
            []
        )
    )

    # Remove duplicates while preserving order.
    unique_skills = []

    for skill in required_skills:

        normalized = normalize_skill(skill)

        if (
            normalized
            and normalized not in unique_skills
        ):

            unique_skills.append(
                normalized
            )

    questions = generate_mcq_test(
        skills=unique_skills,
        question_count=question_count,
        difficulty=difficulty,
        seed=seed
    )

    return {
        "test_id": (
            f"SELF_{student['student_id']}_"
            f"{job['job_id']}"
        ),

        "test_type":
            "SELF_ASSESSMENT",

        "student_id":
            student["student_id"],

        "job_id":
            job["job_id"],

        "job_title":
            job["job_title"],

        "skills":
            unique_skills,

        "question_count":
            len(questions),

        "questions":
            questions
    }


# ============================================================
# DISPLAY TEST
# ============================================================

def print_test(test):

    print()
    print("=" * 70)

    print(
        "CAMPUSLINK SELF-ASSESSMENT TEST"
    )

    print("=" * 70)

    print(
        f"Test ID : {test['test_id']}"
    )

    print(
        f"Student : {test['student_id']}"
    )

    print(
        f"Job     : {test['job_title']}"
    )

    print(
        f"Questions: {test['question_count']}"
    )

    print()

    for index, question in enumerate(
        test["questions"],
        start=1
    ):

        print(
            f"Q{index}. "
            f"[{question['skill']}] "
            f"[{question['difficulty']}]"
        )

        print(
            question["question"]
        )

        for label, option in question[
            "options"
        ].items():

            print(
                f"  {label}. {option}"
            )

        print()


# ============================================================
# STANDALONE TEST
# ============================================================

def main():

    print(
        ">>> CAMPUSLINK MCQ GENERATOR STARTED <<<"
    )

    # --------------------------------------------------------
    # Example student
    # --------------------------------------------------------

    student = {
        "student_id": "STU001",
        "name": "Rahul Sharma"
    }

    # --------------------------------------------------------
    # Example job
    # --------------------------------------------------------

    job = {
        "job_id": "JOB001",
        "job_title": "Python Developer",

        "required_languages": [
            "Python",
            "SQL"
        ],

        "required_skills": [
            "Python",
            "SQL",
            "OOP",
            "Data Structures",
            "REST API"
        ]
    }

    # --------------------------------------------------------
    # Generate test
    # --------------------------------------------------------

    test = generate_test_for_job(
        student=student,
        job=job,
        question_count=5,
        seed=42
    )

    print_test(test)

    print("=" * 70)
    print(
        "MCQ GENERATION SUCCESSFUL"
    )
    print("=" * 70)


if __name__ == "__main__":
    main()