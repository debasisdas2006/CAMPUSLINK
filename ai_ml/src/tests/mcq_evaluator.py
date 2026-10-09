"""
MCQ Evaluator
-------------
Reusable evaluation engine for:
1. Student self-assessment
2. Recruiter/AI interview MCQs

Important:
- Student answers are NOT evaluated while answering.
- Evaluation happens only after final submission.
- Correct answers and explanations are internal.
- Student-facing result does not expose correct answers.
- Recruiter/admin can receive detailed evaluation.
"""

from typing import Any, Dict, List


VALID_ANSWERS = {"A", "B", "C", "D"}


def normalize_answer(answer: Any) -> str:
    """
    Normalize a student's answer.

    Examples:
        "a" -> "A"
        " B " -> "B"
        None -> ""
    """

    if answer is None:
        return ""

    return str(answer).strip().upper()


def evaluate_question(
    question: Dict[str, Any],
    student_answer: Any = None
) -> Dict[str, Any]:
    """
    Evaluate one MCQ.

    This function should only be called AFTER final submission.
    """

    question_id = question.get("question_id")
    skill = question.get("skill", "Unknown")
    difficulty = question.get("difficulty", "Unknown")

    correct_answer = normalize_answer(
        question.get("correct_answer")
    )

    student_answer = normalize_answer(student_answer)

    answered = student_answer in VALID_ANSWERS

    is_correct = (
        answered
        and student_answer == correct_answer
    )

    return {
        "question_id": question_id,
        "skill": skill,
        "difficulty": difficulty,
        "student_answer": student_answer if answered else None,
        "correct_answer": correct_answer,
        "is_answered": answered,
        "is_correct": is_correct,
        "explanation": question.get("explanation", "")
    }


def evaluate_questions(
    questions: List[Dict[str, Any]],
    student_answers: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Evaluate all questions after final submission.

    student_answers format:

    {
        "PY001": "A",
        "PY002": "C",
        "SQL001": "B"
    }
    """

    results = []

    for question in questions:

        question_id = question.get("question_id")

        student_answer = student_answers.get(
            question_id
        )

        result = evaluate_question(
            question,
            student_answer
        )

        results.append(result)

    return results


def calculate_overall_performance(
    evaluation_results: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Calculate overall MCQ performance.
    """

    total_questions = len(evaluation_results)

    answered = sum(
        1
        for result in evaluation_results
        if result["is_answered"]
    )

    correct = sum(
        1
        for result in evaluation_results
        if result["is_correct"]
    )

    incorrect = sum(
        1
        for result in evaluation_results
        if result["is_answered"]
        and not result["is_correct"]
    )

    unanswered = total_questions - answered

    if total_questions > 0:
        performance_percentage = round(
            (correct / total_questions) * 100,
            2
        )
    else:
        performance_percentage = 0.0

    return {
        "total_questions": total_questions,
        "answered": answered,
        "correct": correct,
        "incorrect": incorrect,
        "unanswered": unanswered,
        "performance_percentage": performance_percentage
    }


def calculate_skill_performance(
    evaluation_results: List[Dict[str, Any]]
) -> Dict[str, Dict[str, Any]]:
    """
    Calculate performance separately for every skill.

    Example:

    {
        "Python": {
            "total_questions": 4,
            "answered": 4,
            "correct": 3,
            "incorrect": 1,
            "unanswered": 0,
            "performance_percentage": 75.0
        }
    }
    """

    skill_data: Dict[str, List[Dict[str, Any]]] = {}

    for result in evaluation_results:

        skill = result.get("skill", "Unknown")

        if skill not in skill_data:
            skill_data[skill] = []

        skill_data[skill].append(result)

    performance = {}

    for skill, results in skill_data.items():

        total = len(results)

        answered = sum(
            1
            for result in results
            if result["is_answered"]
        )

        correct = sum(
            1
            for result in results
            if result["is_correct"]
        )

        incorrect = sum(
            1
            for result in results
            if result["is_answered"]
            and not result["is_correct"]
        )

        unanswered = total - answered

        percentage = (
            round((correct / total) * 100, 2)
            if total > 0
            else 0.0
        )

        performance[skill] = {
            "total_questions": total,
            "answered": answered,
            "correct": correct,
            "incorrect": incorrect,
            "unanswered": unanswered,
            "performance_percentage": percentage
        }

    return performance


def calculate_difficulty_performance(
    evaluation_results: List[Dict[str, Any]]
) -> Dict[str, Dict[str, Any]]:
    """
    Calculate performance by difficulty.

    Example:

    {
        "easy": {...},
        "medium": {...},
        "hard": {...}
    }
    """

    difficulty_data: Dict[str, List[Dict[str, Any]]] = {}

    for result in evaluation_results:

        difficulty = str(
            result.get("difficulty", "unknown")
        ).lower()

        if difficulty not in difficulty_data:
            difficulty_data[difficulty] = []

        difficulty_data[difficulty].append(result)

    performance = {}

    for difficulty, results in difficulty_data.items():

        total = len(results)

        answered = sum(
            1
            for result in results
            if result["is_answered"]
        )

        correct = sum(
            1
            for result in results
            if result["is_correct"]
        )

        incorrect = sum(
            1
            for result in results
            if result["is_answered"]
            and not result["is_correct"]
        )

        unanswered = total - answered

        percentage = (
            round((correct / total) * 100, 2)
            if total > 0
            else 0.0
        )

        performance[difficulty] = {
            "total_questions": total,
            "answered": answered,
            "correct": correct,
            "incorrect": incorrect,
            "unanswered": unanswered,
            "performance_percentage": percentage
        }

    return performance


def generate_performance_level(
    performance_percentage: float
) -> str:
    """
    Generate a descriptive performance level.

    This is NOT used to determine employment.
    It only describes MCQ test performance.
    """

    if performance_percentage >= 90:
        return "Excellent"

    if performance_percentage >= 80:
        return "Very Good"

    if performance_percentage >= 70:
        return "Good"

    if performance_percentage >= 50:
        return "Needs Improvement"

    return "Needs Significant Improvement"


def evaluate_mcq_test(
    questions: List[Dict[str, Any]],
    student_answers: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Complete MCQ evaluation pipeline.

    This should be called only after the student
    submits the complete test.
    """

    evaluation_results = evaluate_questions(
        questions,
        student_answers
    )

    overall = calculate_overall_performance(
        evaluation_results
    )

    skill_performance = calculate_skill_performance(
        evaluation_results
    )

    difficulty_performance = calculate_difficulty_performance(
        evaluation_results
    )

    performance_level = generate_performance_level(
        overall["performance_percentage"]
    )

    return {
        "overall": overall,
        "performance_level": performance_level,
        "skill_performance": skill_performance,
        "difficulty_performance": difficulty_performance,
        "question_results": evaluation_results
    }


def create_student_result(
    evaluation: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create the result visible to the student.

    IMPORTANT:
    Correct answers and explanations are removed.
    """

    overall = evaluation["overall"]

    return {
        "total_questions": overall["total_questions"],
        "answered": overall["answered"],
        "correct": overall["correct"],
        "incorrect": overall["incorrect"],
        "unanswered": overall["unanswered"],
        "performance_percentage": overall[
            "performance_percentage"
        ],
        "performance_level": evaluation[
            "performance_level"
        ],
        "skill_performance": evaluation[
            "skill_performance"
        ],
        "difficulty_performance": evaluation[
            "difficulty_performance"
        ]
    }


def create_recruiter_result(
    evaluation: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create detailed evaluation for recruiter/admin.

    Recruiter/admin can see:
    - student answer
    - correct answer
    - correct/incorrect status
    - explanation
    - skill
    - difficulty
    """

    return {
        "overall": evaluation["overall"],
        "performance_level": evaluation[
            "performance_level"
        ],
        "skill_performance": evaluation[
            "skill_performance"
        ],
        "difficulty_performance": evaluation[
            "difficulty_performance"
        ],
        "question_results": evaluation[
            "question_results"
        ]
    }


def print_student_result(
    result: Dict[str, Any]
) -> None:
    """
    Print student-safe result.
    """

    print("\n" + "=" * 60)
    print("STUDENT MCQ RESULT")
    print("=" * 60)

    print(
        f"Total Questions : "
        f"{result['total_questions']}"
    )

    print(
        f"Answered        : "
        f"{result['answered']}"
    )

    print(
        f"Correct         : "
        f"{result['correct']}"
    )

    print(
        f"Incorrect       : "
        f"{result['incorrect']}"
    )

    print(
        f"Unanswered      : "
        f"{result['unanswered']}"
    )

    print(
        f"Performance     : "
        f"{result['performance_percentage']}%"
    )

    print(
        f"Level           : "
        f"{result['performance_level']}"
    )

    print("\nSkill Performance:")

    for skill, data in result[
        "skill_performance"
    ].items():

        print(
            f"  {skill}: "
            f"{data['performance_percentage']}%"
        )

    print("\nDifficulty Performance:")

    for difficulty, data in result[
        "difficulty_performance"
    ].items():

        print(
            f"  {difficulty}: "
            f"{data['performance_percentage']}%"
        )

    print("=" * 60)


def print_recruiter_result(
    result: Dict[str, Any]
) -> None:
    """
    Print detailed recruiter/admin evaluation.
    """

    print("\n" + "=" * 70)
    print("RECRUITER / ADMIN MCQ EVALUATION")
    print("=" * 70)

    overall = result["overall"]

    print(
        f"Total Questions : "
        f"{overall['total_questions']}"
    )

    print(
        f"Answered        : "
        f"{overall['answered']}"
    )

    print(
        f"Correct         : "
        f"{overall['correct']}"
    )

    print(
        f"Incorrect       : "
        f"{overall['incorrect']}"
    )

    print(
        f"Unanswered      : "
        f"{overall['unanswered']}"
    )

    print(
        f"Performance     : "
        f"{overall['performance_percentage']}%"
    )

    print(
        f"Level           : "
        f"{result['performance_level']}"
    )

    print("\nQuestion Details:")

    for item in result["question_results"]:

        print("\n" + "-" * 60)

        print(
            f"Question ID     : "
            f"{item['question_id']}"
        )

        print(
            f"Skill           : "
            f"{item['skill']}"
        )

        print(
            f"Difficulty      : "
            f"{item['difficulty']}"
        )

        print(
            f"Student Answer  : "
            f"{item['student_answer']}"
        )

        print(
            f"Correct Answer  : "
            f"{item['correct_answer']}"
        )

        print(
            f"Result          : "
            f"{'CORRECT' if item['is_correct'] else 'INCORRECT'}"
        )

        print(
            f"Explanation     : "
            f"{item['explanation']}"
        )

    print("=" * 70)


# ---------------------------------------------------------
# DEMO
# ---------------------------------------------------------

if __name__ == "__main__":

    questions = [
        {
            "question_id": "PY001",
            "skill": "Python",
            "difficulty": "easy",
            "question": "Which keyword defines a function?",
            "options": {
                "A": "func",
                "B": "define",
                "C": "def",
                "D": "function"
            },
            "correct_answer": "C",
            "explanation": (
                "The def keyword is used "
                "to define a function in Python."
            )
        },
        {
            "question_id": "PY002",
            "skill": "Python",
            "difficulty": "medium",
            "question": "Which data type is immutable?",
            "options": {
                "A": "List",
                "B": "Dictionary",
                "C": "Set",
                "D": "Tuple"
            },
            "correct_answer": "D",
            "explanation": (
                "A tuple is immutable."
            )
        },
        {
            "question_id": "SQL001",
            "skill": "SQL",
            "difficulty": "easy",
            "question": "Which command retrieves data?",
            "options": {
                "A": "SELECT",
                "B": "DELETE",
                "C": "DROP",
                "D": "UPDATE"
            },
            "correct_answer": "A",
            "explanation": (
                "SELECT is used to retrieve data."
            )
        },
        {
            "question_id": "DSA001",
            "skill": "DSA",
            "difficulty": "hard",
            "question": "Which structure follows LIFO?",
            "options": {
                "A": "Queue",
                "B": "Stack",
                "C": "Graph",
                "D": "Tree"
            },
            "correct_answer": "B",
            "explanation": (
                "A stack follows Last-In-First-Out."
            )
        }
    ]

    # Simulated student answers.
    #
    # PY001 -> correct
    # PY002 -> correct
    # SQL001 -> incorrect
    # DSA001 -> unanswered

    student_answers = {
        "PY001": "C",
        "PY002": "D",
        "SQL001": "B"
    }

    # Evaluate only after final submission.
    evaluation = evaluate_mcq_test(
        questions,
        student_answers
    )

    # Student-safe result.
    student_result = create_student_result(
        evaluation
    )

    print_student_result(
        student_result
    )

    # Recruiter/admin detailed result.
    recruiter_result = create_recruiter_result(
        evaluation
    )

    print_recruiter_result(
        recruiter_result
    )