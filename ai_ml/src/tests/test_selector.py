import random
import sys
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


# ============================================================
# IMPORT QUESTION BANK
# ============================================================

from src.tests.mcq_generator import (
    load_question_bank,
    normalize_skill
)


# ============================================================
# TEST CONFIGURATION
# ============================================================

DEFAULT_QUESTION_COUNT = 10

DIFFICULTY_DISTRIBUTION = {
    "easy": 0.40,
    "medium": 0.40,
    "hard": 0.20
}


# ============================================================
# FILTER QUESTIONS BY SKILLS
# ============================================================

def filter_questions_by_skills(
    question_bank,
    skills
):
    """
    Return questions matching the requested skills.
    """

    normalized_skills = {
        normalize_skill(skill)
        for skill in skills
    }

    normalized_skills.discard("")

    return [
        question
        for question in question_bank
        if normalize_skill(
            question.get("skill", "")
        ) in normalized_skills
    ]


# ============================================================
# GROUP QUESTIONS BY SKILL
# ============================================================

def group_questions_by_skill(
    questions
):
    grouped = {}

    for question in questions:

        skill = normalize_skill(
            question.get("skill", "")
        )

        if not skill:
            continue

        grouped.setdefault(
            skill,
            []
        ).append(question)

    return grouped


# ============================================================
# GROUP QUESTIONS BY DIFFICULTY
# ============================================================

def group_questions_by_difficulty(
    questions
):
    grouped = {
        "easy": [],
        "medium": [],
        "hard": []
    }

    for question in questions:

        difficulty = (
            question.get(
                "difficulty",
                ""
            )
            .strip()
            .lower()
        )

        if difficulty in grouped:

            grouped[difficulty].append(
                question
            )

    return grouped


# ============================================================
# CALCULATE DIFFICULTY COUNTS
# ============================================================

def calculate_difficulty_counts(
    question_count
):
    """
    Calculate target number of questions
    for each difficulty.
    """

    easy_count = round(
        question_count
        * DIFFICULTY_DISTRIBUTION["easy"]
    )

    medium_count = round(
        question_count
        * DIFFICULTY_DISTRIBUTION["medium"]
    )

    hard_count = (
        question_count
        - easy_count
        - medium_count
    )

    return {
        "easy": easy_count,
        "medium": medium_count,
        "hard": hard_count
    }


# ============================================================
# BALANCED SKILL SELECTION
# ============================================================

def select_questions_by_skill(
    questions,
    question_count
):
    """
    Distribute selected questions across
    available skills as evenly as possible.
    """

    if question_count <= 0:
        return []

    grouped = group_questions_by_skill(
        questions
    )

    if not grouped:
        return []

    skills = list(grouped.keys())

    random.shuffle(skills)

    selected = []

    # --------------------------------------------------------
    # Round-robin selection
    # --------------------------------------------------------

    while (
        len(selected) < question_count
        and skills
    ):

        progress = False

        for skill in list(skills):

            if len(selected) >= question_count:
                break

            available = grouped[skill]

            if not available:
                skills.remove(skill)
                continue

            question = random.choice(
                available
            )

            selected.append(question)

            available.remove(question)

            progress = True

        if not progress:
            break

    return selected


# ============================================================
# DIFFICULTY SELECTION
# ============================================================

def select_questions_by_difficulty(
    questions,
    difficulty,
    count
):
    """
    Select up to `count` questions for
    a specific difficulty.
    """

    if count <= 0:
        return []

    candidates = [
        question
        for question in questions
        if question.get(
            "difficulty",
            ""
        ).lower() == difficulty
    ]

    if not candidates:
        return []

    return random.sample(
        candidates,
        min(
            count,
            len(candidates)
        )
    )


# ============================================================
# BALANCED TEST SELECTION
# ============================================================

def select_balanced_questions(
    questions,
    question_count
):
    """
    Create a test with the configured
    difficulty distribution.
    """

    if not questions:
        return []

    question_count = min(
        question_count,
        len(questions)
    )

    target_counts = (
        calculate_difficulty_counts(
            question_count
        )
    )

    selected = []

    # --------------------------------------------------------
    # First pass: difficulty targets
    # --------------------------------------------------------

    for difficulty in [
        "easy",
        "medium",
        "hard"
    ]:

        count = target_counts[
            difficulty
        ]

        chosen = (
            select_questions_by_difficulty(
                questions,
                difficulty,
                count
            )
        )

        selected.extend(chosen)

    # --------------------------------------------------------
    # Fill remaining slots if a difficulty
    # does not have enough questions.
    # --------------------------------------------------------

    if len(selected) < question_count:

        selected_ids = {
            question["question_id"]
            for question in selected
        }

        remaining = [
            question
            for question in questions
            if question.get(
                "question_id"
            ) not in selected_ids
        ]

        random.shuffle(remaining)

        needed = (
            question_count
            - len(selected)
        )

        selected.extend(
            remaining[:needed]
        )

    # --------------------------------------------------------
    # Final shuffle
    # --------------------------------------------------------

    random.shuffle(selected)

    return selected


# ============================================================
# SKILL + DIFFICULTY BALANCED SELECTOR
# ============================================================

def select_test_questions(
    skills,
    question_count=DEFAULT_QUESTION_COUNT,
    seed=None
):
    """
    Main test-selection function.

    Steps:
        1. Load question bank
        2. Filter by job skills
        3. Balance difficulty
        4. Remove duplicates
        5. Shuffle
    """

    if seed is not None:
        random.seed(seed)

    question_bank = load_question_bank()

    # --------------------------------------------------------
    # Filter skills
    # --------------------------------------------------------

    available_questions = (
        filter_questions_by_skills(
            question_bank,
            skills
        )
    )

    if not available_questions:

        raise ValueError(
            "No questions available for "
            f"skills: {skills}"
        )

    # --------------------------------------------------------
    # Select balanced questions
    # --------------------------------------------------------

    selected_questions = (
        select_balanced_questions(
            available_questions,
            question_count
        )
    )

    # --------------------------------------------------------
    # Ensure unique question IDs
    # --------------------------------------------------------

    unique_questions = []

    seen_ids = set()

    for question in selected_questions:

        question_id = question.get(
            "question_id"
        )

        if question_id in seen_ids:
            continue

        seen_ids.add(question_id)

        unique_questions.append(
            question
        )

    return unique_questions


# ============================================================
# CREATE STUDENT-SAFE TEST
# ============================================================

def prepare_student_test(
    questions
):
    """
    Remove answer information before
    sending questions to a student.
    """

    student_questions = []

    for question in questions:

        safe_question = {
            "question_id":
                question.get(
                    "question_id"
                ),

            "skill":
                question.get(
                    "skill"
                ),

            "difficulty":
                question.get(
                    "difficulty"
                ),

            "question":
                question.get(
                    "question"
                ),

            "options":
                question.get(
                    "options"
                )
        }

        student_questions.append(
            safe_question
        )

    return student_questions


# ============================================================
# DISPLAY
# ============================================================

def print_selected_questions(
    questions
):

    print()
    print("=" * 70)

    print(
        "CAMPUSLINK TEST QUESTION SELECTOR"
    )

    print("=" * 70)

    print(
        f"Selected Questions: "
        f"{len(questions)}"
    )

    print()

    for index, question in enumerate(
        questions,
        start=1
    ):

        print(
            f"{index}. "
            f"{question['question_id']} | "
            f"{question['skill']} | "
            f"{question['difficulty']}"
        )

        print(
            f"   {question['question']}"
        )

    print("=" * 70)


# ============================================================
# MAIN TEST
# ============================================================

def main():

    print(
        ">>> CAMPUSLINK TEST SELECTOR STARTED <<<"
    )

    skills = [
        "Python",
        "SQL",
        "OOP",
        "Data Structures",
        "REST API"
    ]

    print()
    print(
        "Required Skills:"
    )

    for skill in skills:
        print(
            f"  • {skill}"
        )

    questions = select_test_questions(
        skills=skills,
        question_count=10,
        seed=42
    )

    print_selected_questions(
        questions
    )

    # --------------------------------------------------------
    # Student-safe version
    # --------------------------------------------------------

    safe_questions = (
        prepare_student_test(
            questions
        )
    )

    print()
    print(
        "Student-safe question count: "
        f"{len(safe_questions)}"
    )

    # Verify answers are not exposed.
    answer_exposed = any(
        "correct_answer" in question
        or "_correct_answer" in question
        for question in safe_questions
    )

    print(
        "Correct answers exposed: "
        f"{answer_exposed}"
    )

    print()
    print("=" * 70)
    print(
        "TEST SELECTOR SUCCESSFUL"
    )
    print("=" * 70)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()