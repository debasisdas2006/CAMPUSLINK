import sys
from pathlib import Path


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


# ============================================================
# IMPORT
# ============================================================

from src.tests.mcq_generator import load_question_bank


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_answer(answer):
    """
    Normalize a student's answer.

    Examples:
        "a" -> "A"
        " A " -> "A"
    """

    if answer is None:
        return ""

    return str(answer).strip().upper()


# ============================================================
# VALIDATE ANSWER
# ============================================================

def is_valid_answer(answer):
    return normalize_answer(answer) in {
        "A",
        "B",
        "C",
        "D"
    }


# ============================================================
# EVALUATE SINGLE QUESTION
# ============================================================

def evaluate_question(
    question,
    student_answer
):
    """
    Evaluate one MCQ question.
    """

    student_answer = normalize_answer(
        student_answer
    )

    correct_answer = normalize_answer(
        question.get("correct_answer")
    )

    is_correct = (
        student_answer == correct_answer
    )

    return {
        "question_id":
            question.get("question_id"),

        "skill":
            question.get("skill"),

        "difficulty":
            question.get("difficulty"),

        "student_answer":
            student_answer,

        "correct_answer":
            correct_answer,

        "is_correct":
            is_correct,

        "question":
            question.get("question"),

        "explanation":
            question.get("explanation", "")
    }


# ============================================================
# SKILL PERFORMANCE
# ============================================================

def calculate_skill_performance(
    question_results
):
    """
    Calculate performance for each skill.
    """

    skill_stats = {}

    for result in question_results:

        skill = result.get(
            "skill",
            "unknown"
        )

        if skill not in skill_stats:

            skill_stats[skill] = {
                "total_questions": 0,
                "correct_answers": 0,
                "incorrect_answers": 0
            }

        skill_stats[skill][
            "total_questions"
        ] += 1

        if result["is_correct"]:

            skill_stats[skill][
                "correct_answers"
            ] += 1

        else:

            skill_stats[skill][
                "incorrect_answers"
            ] += 1

    # --------------------------------------------------------
    # Percentages
    # --------------------------------------------------------

    for skill, stats in skill_stats.items():

        total = stats[
            "total_questions"
        ]

        correct = stats[
            "correct_answers"
        ]

        if total > 0:

            stats["score_percentage"] = round(
                (correct / total) * 100,
                2
            )

        else:

            stats["score_percentage"] = 0.0

    return skill_stats


# ============================================================
# DIFFICULTY PERFORMANCE
# ============================================================

def calculate_difficulty_performance(
    question_results
):
    """
    Calculate performance by difficulty.
    """

    difficulty_stats = {}

    for result in question_results:

        difficulty = result.get(
            "difficulty",
            "unknown"
        ).lower()

        if difficulty not in difficulty_stats:

            difficulty_stats[difficulty] = {
                "total_questions": 0,
                "correct_answers": 0,
                "incorrect_answers": 0
            }

        difficulty_stats[difficulty][
            "total_questions"
        ] += 1

        if result["is_correct"]:

            difficulty_stats[difficulty][
                "correct_answers"
            ] += 1

        else:

            difficulty_stats[difficulty][
                "incorrect_answers"
            ] += 1

    # --------------------------------------------------------
    # Percentages
    # --------------------------------------------------------

    for difficulty, stats in (
        difficulty_stats.items()
    ):

        total = stats[
            "total_questions"
        ]

        correct = stats[
            "correct_answers"
        ]

        if total > 0:

            stats["score_percentage"] = round(
                (correct / total) * 100,
                2
            )

        else:

            stats["score_percentage"] = 0.0

    return difficulty_stats


# ============================================================
# COMPLETE TEST EVALUATION
# ============================================================

def evaluate_test(
    questions,
    student_answers
):
    """
    Evaluate an entire MCQ test.

    Parameters
    ----------
    questions:
        Questions containing correct_answer.

    student_answers:
        Dictionary:

        {
            "Q001": "B",
            "Q002": "C"
        }
    """

    if not isinstance(
        student_answers,
        dict
    ):

        raise TypeError(
            "student_answers must be a dictionary."
        )

    question_results = []

    for question in questions:

        question_id = question.get(
            "question_id"
        )

        student_answer = (
            student_answers.get(
                question_id
            )
        )

        result = evaluate_question(
            question,
            student_answer
        )

        question_results.append(
            result
        )

    # --------------------------------------------------------
    # Overall statistics
    # --------------------------------------------------------

    total_questions = len(
        question_results
    )

    correct_answers = sum(
        1
        for result in question_results
        if result["is_correct"]
    )

    incorrect_answers = (
        total_questions
        - correct_answers
    )

    unanswered_questions = sum(
        1
        for result in question_results
        if not result["student_answer"]
    )

    # --------------------------------------------------------
    # Overall percentage
    # --------------------------------------------------------

    if total_questions > 0:

        score_percentage = round(
            (
                correct_answers
                / total_questions
            ) * 100,
            2
        )

    else:

        score_percentage = 0.0

    # --------------------------------------------------------
    # Skill performance
    # --------------------------------------------------------

    skill_performance = (
        calculate_skill_performance(
            question_results
        )
    )

    # --------------------------------------------------------
    # Difficulty performance
    # --------------------------------------------------------

    difficulty_performance = (
        calculate_difficulty_performance(
            question_results
        )
    )

    # --------------------------------------------------------
    # Performance level
    # --------------------------------------------------------

    if score_percentage >= 80:

        performance_level = "EXCELLENT"

    elif score_percentage >= 60:

        performance_level = "GOOD"

    elif score_percentage >= 40:

        performance_level = "AVERAGE"

    else:

        performance_level = "NEEDS_IMPROVEMENT"

    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    return {

        "total_questions":
            total_questions,

        "correct_answers":
            correct_answers,

        "incorrect_answers":
            incorrect_answers,

        "unanswered_questions":
            unanswered_questions,

        "score_percentage":
            score_percentage,

        "performance_level":
            performance_level,

        "skill_performance":
            skill_performance,

        "difficulty_performance":
            difficulty_performance,

        "question_results":
            question_results
    }


# ============================================================
# FEEDBACK
# ============================================================

def generate_test_feedback(
    evaluation
):
    """
    Generate transparent feedback from
    test performance.
    """

    feedback = []

    score = evaluation[
        "score_percentage"
    ]

    if score >= 80:

        feedback.append(
            "Strong overall self-assessment "
            "performance."
        )

    elif score >= 60:

        feedback.append(
            "Good overall performance with "
            "some areas for improvement."
        )

    elif score >= 40:

        feedback.append(
            "Moderate performance. Additional "
            "practice is recommended."
        )

    else:

        feedback.append(
            "Several areas require additional "
            "practice."
        )

    # --------------------------------------------------------
    # Skill feedback
    # --------------------------------------------------------

    for skill, stats in evaluation[
        "skill_performance"
    ].items():

        skill_score = stats[
            "score_percentage"
        ]

        if skill_score < 50:

            feedback.append(
                f"Focus on improving {skill}."
            )

        elif skill_score >= 80:

            feedback.append(
                f"Strong performance in {skill}."
            )

    return feedback


# ============================================================
# DISPLAY
# ============================================================

def print_evaluation(
    evaluation
):
    """
    Print human-readable evaluation.
    """

    print()
    print("=" * 70)

    print(
        "CAMPUSLINK SELF-ASSESSMENT RESULT"
    )

    print("=" * 70)

    print(
        f"Total Questions     : "
        f"{evaluation['total_questions']}"
    )

    print(
        f"Correct Answers     : "
        f"{evaluation['correct_answers']}"
    )

    print(
        f"Incorrect Answers   : "
        f"{evaluation['incorrect_answers']}"
    )

    print(
        f"Unanswered          : "
        f"{evaluation['unanswered_questions']}"
    )

    print(
        f"Score               : "
        f"{evaluation['score_percentage']:.2f}%"
    )

    print(
        f"Performance Level   : "
        f"{evaluation['performance_level']}"
    )

    # --------------------------------------------------------
    # Skill performance
    # --------------------------------------------------------

    print()
    print("-" * 70)

    print(
        "SKILL-WISE PERFORMANCE"
    )

    print("-" * 70)

    for skill, stats in (
        evaluation[
            "skill_performance"
        ].items()
    ):

        print(
            f"{skill}: "
            f"{stats['correct_answers']}/"
            f"{stats['total_questions']} "
            f"({stats['score_percentage']:.2f}%)"
        )

    # --------------------------------------------------------
    # Difficulty performance
    # --------------------------------------------------------

    print()
    print("-" * 70)

    print(
        "DIFFICULTY-WISE PERFORMANCE"
    )

    print("-" * 70)

    for difficulty, stats in (
        evaluation[
            "difficulty_performance"
        ].items()
    ):

        print(
            f"{difficulty}: "
            f"{stats['correct_answers']}/"
            f"{stats['total_questions']} "
            f"({stats['score_percentage']:.2f}%)"
        )

    # --------------------------------------------------------
    # Feedback
    # --------------------------------------------------------

    feedback = generate_test_feedback(
        evaluation
    )

    print()
    print("-" * 70)

    print(
        "FEEDBACK"
    )

    print("-" * 70)

    for item in feedback:

        print(
            f"  • {item}"
        )

    print("=" * 70)


# ============================================================
# STANDALONE TEST
# ============================================================

def main():

    print(
        ">>> CAMPUSLINK TEST EVALUATOR STARTED <<<"
    )

    # --------------------------------------------------------
    # Load questions
    # --------------------------------------------------------

    question_bank = load_question_bank()

    questions = question_bank[:10]

    # --------------------------------------------------------
    # Simulated student answers
    # --------------------------------------------------------

    student_answers = {}

    for index, question in enumerate(
        questions
    ):

        question_id = question[
            "question_id"
        ]

        # Use the correct answer for
        # even-numbered questions and
        # an intentionally different answer
        # for odd-numbered questions.

        if index % 2 == 0:

            student_answers[
                question_id
            ] = question[
                "correct_answer"
            ]

        else:

            student_answers[
                question_id
            ] = "A"

    # --------------------------------------------------------
    # Evaluate
    # --------------------------------------------------------

    evaluation = evaluate_test(
        questions,
        student_answers
    )

    print_evaluation(
        evaluation
    )

    print()
    print("=" * 70)
    print(
        "TEST EVALUATOR SUCCESSFUL"
    )
    print("=" * 70)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()