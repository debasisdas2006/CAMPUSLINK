"""
CAMPUSLINK - Interview Question Selector

This module selects interview questions from an already-generated
candidate question list.

It is designed to work directly with interview_service.py.

Supported operations:
    - Balanced interview question selection
    - Adaptive next-question selection
    - Weak-skill identification
    - Strong-skill identification
    - MCQ/test question selection
    - Test evaluation
"""

from typing import Any, Dict, List, Optional
import random

from src.interview.question_generator import (
    generate_questions,
    create_student_question,
    create_evaluation_question,
)


# ============================================================
# CONSTANTS
# ============================================================

DEFAULT_DIFFICULTY_DISTRIBUTION = {
    "easy": 0.30,
    "medium": 0.50,
    "hard": 0.20,
}


# ============================================================
# SAFE HELPERS
# ============================================================

def _safe_int(
    value: Any,
    default: int = 0
) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _safe_float(
    value: Any,
    default: float = 0.0
) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _normalize_difficulty(
    difficulty: Any
) -> str:

    value = str(
        difficulty or "medium"
    ).strip().lower()

    if value not in {
        "easy",
        "medium",
        "hard",
    }:
        return "medium"

    return value


def _normalize_skill(
    skill: Any
) -> str:

    if skill is None:
        return ""

    return str(
        skill
    ).strip().lower()


def _extract_skill(
    question: Dict[str, Any]
) -> str:

    if not isinstance(
        question,
        dict
    ):
        return ""

    return str(
        question.get(
            "skill",
            question.get(
                "topic",
                ""
            )
        )
        or ""
    ).strip()


def _extract_question_id(
    question: Dict[str, Any]
) -> Optional[str]:

    if not isinstance(
        question,
        dict
    ):
        return None

    value = question.get(
        "question_id"
    )

    if value is None:
        value = question.get(
            "id"
        )

    if value is None:
        return None

    return str(
        value
    )


def _extract_score(
    data: Any
) -> float:

    if isinstance(
        data,
        dict
    ):

        data = data.get(
            "score",
            data.get(
                "average_score",
                data.get(
                    "percentage",
                    0.0
                )
            )
        )

    return max(
        0.0,
        min(
            100.0,
            _safe_float(data)
        )
    )


# ============================================================
# BASIC QUESTION SELECTION
# ============================================================

def select_questions(
    skills: Optional[List[str]] = None,
    count: int = 5,
    difficulty: Optional[str] = None,
    seed: Optional[int] = None,
    **kwargs
) -> List[Dict[str, Any]]:

    if seed is not None:
        random.seed(
            seed
        )

    count = max(
        0,
        _safe_int(
            count,
            5
        )
    )

    if count == 0:
        return []

    try:

        questions = generate_questions(
            skills=skills,
            count=count,
            difficulty=difficulty,
            **kwargs
        )

    except TypeError:

        try:

            questions = generate_questions(
                skills=skills,
                count=count
            )

        except TypeError:

            questions = generate_questions(
                skills or [],
                count
            )

    if not questions:
        return []

    if not isinstance(
        questions,
        list
    ):
        questions = list(
            questions
        )

    random.shuffle(
        questions
    )

    return questions[:count]


# ============================================================
# BALANCED INTERVIEW QUESTION SELECTION
# ============================================================

def select_balanced_questions(
    questions: Optional[List[Dict[str, Any]]] = None,
    question_count: int = 5,
    job_skills: Optional[List[str]] = None,
    weak_skills: Optional[List[str]] = None,
    difficulty_distribution: Optional[
        Dict[str, float]
    ] = None,
    seed: Optional[int] = None,
    **kwargs
) -> List[Dict[str, Any]]:
    """
    Select interview questions from an already-generated
    candidate question list.

    IMPORTANT:
    This function intentionally supports the interface used by
    interview_service.py:

        questions=
        question_count=
        job_skills=
        weak_skills=
        seed=

    Selection priority:

        1. Weak skills
        2. Job-required skills
        3. Difficulty balance
        4. Remaining questions
    """

    if seed is not None:
        random.seed(
            seed
        )

    # --------------------------------------------------------
    # Normalize inputs
    # --------------------------------------------------------

    questions = (
        questions
        if isinstance(
            questions,
            list
        )
        else []
    )

    question_count = max(
        0,
        _safe_int(
            question_count,
            5
        )
    )

    if question_count == 0:
        return []

    job_skills = (
        job_skills
        if isinstance(
            job_skills,
            list
        )
        else []
    )

    weak_skills = (
        weak_skills
        if isinstance(
            weak_skills,
            list
        )
        else []
    )

    normalized_job_skills = {
        _normalize_skill(skill)
        for skill in job_skills
        if _normalize_skill(skill)
    }

    normalized_weak_skills = {
        _normalize_skill(skill)
        for skill in weak_skills
        if _normalize_skill(skill)
    }

    # --------------------------------------------------------
    # Remove invalid questions
    # --------------------------------------------------------

    valid_questions = []

    for question in questions:

        if not isinstance(
            question,
            dict
        ):
            continue

        if not question.get(
            "question"
        ):
            continue

        valid_questions.append(
            dict(question)
        )

    if not valid_questions:
        return []

    # --------------------------------------------------------
    # Remove duplicates
    # --------------------------------------------------------

    unique_questions = []
    seen_ids = set()
    seen_text = set()

    for question in valid_questions:

        question_id = (
            _extract_question_id(
                question
            )
        )

        question_text = str(
            question.get(
                "question",
                ""
            )
        ).strip().lower()

        if (
            question_id
            and question_id in seen_ids
        ):
            continue

        if (
            question_text
            and question_text in seen_text
        ):
            continue

        if question_id:
            seen_ids.add(
                question_id
            )

        if question_text:
            seen_text.add(
                question_text
            )

        unique_questions.append(
            question
        )

    valid_questions = (
        unique_questions
    )

    # --------------------------------------------------------
    # Difficulty distribution
    # --------------------------------------------------------

    distribution = (
        difficulty_distribution
        or DEFAULT_DIFFICULTY_DISTRIBUTION.copy()
    )

    clean_distribution = {}

    for difficulty in (
        "easy",
        "medium",
        "hard"
    ):

        value = _safe_float(
            distribution.get(
                difficulty,
                0.0
            )
        )

        clean_distribution[
            difficulty
        ] = max(
            0.0,
            value
        )

    total_distribution = sum(
        clean_distribution.values()
    )

    if total_distribution <= 0:

        clean_distribution = (
            DEFAULT_DIFFICULTY_DISTRIBUTION.copy()
        )

        total_distribution = 1.0

    for difficulty in clean_distribution:

        clean_distribution[
            difficulty
        ] /= total_distribution

    # --------------------------------------------------------
    # Calculate desired difficulty counts
    # --------------------------------------------------------

    raw_counts = {
        difficulty:
        clean_distribution[
            difficulty
        ] * question_count

        for difficulty in (
            "easy",
            "medium",
            "hard"
        )
    }

    target_counts = {
        difficulty:
        int(
            raw_counts[
                difficulty
            ]
        )

        for difficulty in (
            "easy",
            "medium",
            "hard"
        )
    }

    remaining_count = (
        question_count
        - sum(
            target_counts.values()
        )
    )

    fractional_parts = sorted(
        (
            (
                raw_counts[difficulty]
                - target_counts[difficulty],
                difficulty
            )

            for difficulty in (
                "easy",
                "medium",
                "hard"
            )
        ),
        reverse=True
    )

    for _, difficulty in fractional_parts:

        if remaining_count <= 0:
            break

        target_counts[
            difficulty
        ] += 1

        remaining_count -= 1

    # --------------------------------------------------------
    # Internal selection helper
    # --------------------------------------------------------

    selected = []
    selected_ids = set()
    selected_texts = set()

    def add_question(
        question: Dict[str, Any]
    ) -> bool:

        question_id = (
            _extract_question_id(
                question
            )
        )

        question_text = str(
            question.get(
                "question",
                ""
            )
        ).strip().lower()

        if (
            question_id
            and question_id in selected_ids
        ):
            return False

        if (
            question_text
            and question_text in selected_texts
        ):
            return False

        selected.append(
            question
        )

        if question_id:
            selected_ids.add(
                question_id
            )

        if question_text:
            selected_texts.add(
                question_text
            )

        return True

    # --------------------------------------------------------
    # 1. Select weak-skill questions first
    # --------------------------------------------------------

    weak_candidates = []

    for question in valid_questions:

        skill = _normalize_skill(
            _extract_skill(
                question
            )
        )

        if skill in normalized_weak_skills:

            weak_candidates.append(
                question
            )

    random.shuffle(
        weak_candidates
    )

    # Give weak skills priority while respecting
    # the requested difficulty distribution.
    for difficulty in (
        "easy",
        "medium",
        "hard"
    ):

        needed = target_counts[
            difficulty
        ]

        if needed <= 0:
            continue

        candidates = [
            question

            for question in weak_candidates

            if _normalize_difficulty(
                question.get(
                    "difficulty",
                    "medium"
                )
            ) == difficulty
        ]

        random.shuffle(
            candidates
        )

        for question in candidates:

            if needed <= 0:
                break

            if add_question(
                question
            ):
                needed -= 1

    # --------------------------------------------------------
    # 2. Select job-skill questions
    # --------------------------------------------------------

    for difficulty in (
        "easy",
        "medium",
        "hard"
    ):

        target = target_counts[
            difficulty
        ]

        current = sum(
            1
            for question in selected

            if _normalize_difficulty(
                question.get(
                    "difficulty",
                    "medium"
                )
            ) == difficulty
        )

        needed = max(
            0,
            target - current
        )

        if needed == 0:
            continue

        candidates = [
            question

            for question in valid_questions

            if (
                _normalize_skill(
                    _extract_skill(
                        question
                    )
                )
                in normalized_job_skills
            )
            and
            _normalize_difficulty(
                question.get(
                    "difficulty",
                    "medium"
                )
            ) == difficulty
        ]

        random.shuffle(
            candidates
        )

        for question in candidates:

            if needed <= 0:
                break

            if add_question(
                question
            ):
                needed -= 1

    # --------------------------------------------------------
    # 3. Fill remaining questions by difficulty
    # --------------------------------------------------------

    for difficulty in (
        "easy",
        "medium",
        "hard"
    ):

        if len(selected) >= question_count:
            break

        target = target_counts[
            difficulty
        ]

        current = sum(
            1
            for question in selected

            if _normalize_difficulty(
                question.get(
                    "difficulty",
                    "medium"
                )
            ) == difficulty
        )

        needed = max(
            0,
            target - current
        )

        if needed <= 0:
            continue

        candidates = [
            question

            for question in valid_questions

            if _normalize_difficulty(
                question.get(
                    "difficulty",
                    "medium"
                )
            ) == difficulty
        ]

        random.shuffle(
            candidates
        )

        for question in candidates:

            if (
                len(selected)
                >= question_count
            ):
                break

            if needed <= 0:
                break

            if add_question(
                question
            ):
                needed -= 1

    # --------------------------------------------------------
    # 4. Final fallback
    # --------------------------------------------------------

    if len(selected) < question_count:

        remaining_questions = [
            question

            for question in valid_questions

            if (
                _extract_question_id(
                    question
                )
                not in selected_ids
            )
        ]

        random.shuffle(
            remaining_questions
        )

        for question in remaining_questions:

            if len(selected) >= question_count:
                break

            add_question(
                question
            )

    # --------------------------------------------------------
    # Final shuffle
    # --------------------------------------------------------

    random.shuffle(
        selected
    )

    return selected[
        :question_count
    ]


# ============================================================
# ADAPTIVE NEXT QUESTION
# ============================================================

def select_next_adaptive_question(
    questions: Optional[
        List[Dict[str, Any]]
    ] = None,
    current_difficulty: str = "medium",
    performance_profile: Optional[
        Dict[str, Any]
    ] = None,
    used_question_ids: Optional[
        List[str]
    ] = None,
    weak_skills: Optional[
        List[str]
    ] = None,
    seed: Optional[int] = None,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """
    Select the next interview question adaptively.

    Compatible with interview_service.py.

    Priority:

        1. Unused weak-skill question
        2. Target difficulty
        3. Unused question
    """

    if seed is not None:
        random.seed(
            seed
        )

    questions = (
        questions
        if isinstance(
            questions,
            list
        )
        else []
    )

    used_question_ids = (
        used_question_ids
        if isinstance(
            used_question_ids,
            list
        )
        else []
    )

    used_ids = {
        str(question_id)
        for question_id in used_question_ids
        if question_id is not None
    }

    performance_profile = (
        performance_profile
        if isinstance(
            performance_profile,
            dict
        )
        else {}
    )

    # --------------------------------------------------------
    # Get weak skills if not explicitly supplied
    # --------------------------------------------------------

    if weak_skills is None:

        weak_skills = identify_weak_skills(
            performance_profile,
            threshold=60.0
        )

    weak_skills = (
        weak_skills
        if isinstance(
            weak_skills,
            list
        )
        else []
    )

    normalized_weak_skills = {
        _normalize_skill(
            skill
        )
        for skill in weak_skills
        if _normalize_skill(skill)
    }

    # --------------------------------------------------------
    # Remove used questions
    # --------------------------------------------------------

    available = []

    for question in questions:

        if not isinstance(
            question,
            dict
        ):
            continue

        question_id = (
            _extract_question_id(
                question
            )
        )

        if (
            question_id
            and question_id in used_ids
        ):
            continue

        if not question.get(
            "question"
        ):
            continue

        available.append(
            question
        )

    if not available:
        return None

    # --------------------------------------------------------
    # Determine target difficulty
    # --------------------------------------------------------

    current_difficulty = (
        _normalize_difficulty(
            current_difficulty
        )
    )

    overall_score = _safe_float(
        performance_profile.get(
            "overall_score",
            performance_profile.get(
                "score",
                performance_profile.get(
                    "percentage",
                    0.0
                )
            )
        )
    )

    target_difficulty = (
        current_difficulty
    )

    if overall_score >= 80:

        if current_difficulty == "easy":
            target_difficulty = "medium"

        elif current_difficulty == "medium":
            target_difficulty = "hard"

        else:
            target_difficulty = "hard"

    elif (
        overall_score > 0
        and overall_score < 50
    ):

        if current_difficulty == "hard":
            target_difficulty = "medium"

        elif current_difficulty == "medium":
            target_difficulty = "easy"

        else:
            target_difficulty = "easy"

    # --------------------------------------------------------
    # 1. Weak skill + target difficulty
    # --------------------------------------------------------

    candidates = [
        question

        for question in available

        if (
            _normalize_skill(
                _extract_skill(
                    question
                )
            )
            in normalized_weak_skills
        )
        and
        _normalize_difficulty(
            question.get(
                "difficulty",
                "medium"
            )
        )
        == target_difficulty
    ]

    if candidates:
        return random.choice(
            candidates
        )

    # --------------------------------------------------------
    # 2. Weak skill any difficulty
    # --------------------------------------------------------

    candidates = [
        question

        for question in available

        if (
            _normalize_skill(
                _extract_skill(
                    question
                )
            )
            in normalized_weak_skills
        )
    ]

    if candidates:
        return random.choice(
            candidates
        )

    # --------------------------------------------------------
    # 3. Target difficulty
    # --------------------------------------------------------

    candidates = [
        question

        for question in available

        if _normalize_difficulty(
            question.get(
                "difficulty",
                "medium"
            )
        )
        == target_difficulty
    ]

    if candidates:
        return random.choice(
            candidates
        )

    # --------------------------------------------------------
    # 4. Final fallback
    # --------------------------------------------------------

    return random.choice(
        available
    )


# ============================================================
# WEAK SKILL IDENTIFICATION
# ============================================================

def identify_weak_skills(
    performance_profile: Dict[str, Any],
    threshold: float = 60.0
) -> List[str]:
    """
    Identify skills whose performance score is below threshold.
    """

    if not isinstance(
        performance_profile,
        dict
    ):
        return []

    try:
        threshold = float(
            threshold
        )
    except (
        TypeError,
        ValueError
    ):
        threshold = 60.0

    skill_performance = (
        performance_profile.get(
            "skill_performance",
            {}
        )
    )

    if not isinstance(
        skill_performance,
        dict
    ):
        return []

    weak_skills = []

    for skill, data in skill_performance.items():

        score = _extract_score(
            data
        )

        if score < threshold:

            weak_skills.append(
                skill
            )

    return weak_skills


# ============================================================
# STRONG SKILL IDENTIFICATION
# ============================================================

def identify_strong_skills(
    performance_profile: Dict[str, Any],
    threshold: float = 70.0
) -> List[str]:
    """
    Identify skills whose performance score is at or above
    threshold.
    """

    if not isinstance(
        performance_profile,
        dict
    ):
        return []

    try:
        threshold = float(
            threshold
        )
    except (
        TypeError,
        ValueError
    ):
        threshold = 70.0

    skill_performance = (
        performance_profile.get(
            "skill_performance",
            {}
        )
    )

    if not isinstance(
        skill_performance,
        dict
    ):
        return []

    strong_skills = []

    for skill, data in skill_performance.items():

        score = _extract_score(
            data
        )

        if score >= threshold:

            strong_skills.append(
                skill
            )

    return strong_skills


# ============================================================
# MCQ TEST CREATION
# ============================================================

def create_student_test(
    skills: Optional[List[str]] = None,
    count: int = 5,
    difficulty_distribution: Optional[
        Dict[str, float]
    ] = None,
    seed: Optional[int] = None,
    **kwargs
) -> Dict[str, Any]:

    questions = []

    # --------------------------------------------------------
    # Generate questions by difficulty
    # --------------------------------------------------------

    distribution = (
        difficulty_distribution
        or DEFAULT_DIFFICULTY_DISTRIBUTION
    )

    for difficulty in (
        "easy",
        "medium",
        "hard"
    ):

        percentage = _safe_float(
            distribution.get(
                difficulty,
                0
            )
        )

        difficulty_count = int(
            percentage * count
        )

        if difficulty_count <= 0:
            continue

        generated = select_questions(
            skills=skills,
            count=difficulty_count,
            difficulty=difficulty,
            seed=seed,
            **kwargs
        )

        questions.extend(
            generated
        )

    # --------------------------------------------------------
    # Fill remaining questions
    # --------------------------------------------------------

    if len(questions) < count:

        additional = select_questions(
            skills=skills,
            count=count - len(questions),
            seed=seed,
            **kwargs
        )

        questions.extend(
            additional
        )

    # --------------------------------------------------------
    # Remove duplicates
    # --------------------------------------------------------

    unique_questions = []

    seen = set()

    for question in questions:

        if not isinstance(
            question,
            dict
        ):
            continue

        question_id = (
            _extract_question_id(
                question
            )
        )

        key = (
            question_id
            or str(
                question.get(
                    "question",
                    ""
                )
            ).strip().lower()
        )

        if key in seen:
            continue

        seen.add(
            key
        )

        try:

            student_question = (
                create_student_question(
                    question
                )
            )

        except TypeError:

            student_question = dict(
                question
            )

            student_question.pop(
                "correct_answer",
                None
            )

            student_question.pop(
                "answer",
                None
            )

            student_question.pop(
                "explanation",
                None
            )

        unique_questions.append(
            student_question
        )

    return {
        "total_questions": len(
            unique_questions
        ),

        "questions": unique_questions
    }


# ============================================================
# ANSWER EVALUATION
# ============================================================

def evaluate_answers(
    questions: List[Dict[str, Any]],
    answers: Dict[str, Any]
) -> Dict[str, Any]:

    questions = (
        questions
        if isinstance(
            questions,
            list
        )
        else []
    )

    answers = (
        answers
        if isinstance(
            answers,
            dict
        )
        else {}
    )

    results = []

    correct_count = 0
    wrong_count = 0
    skipped_count = 0

    for question in questions:

        if not isinstance(
            question,
            dict
        ):
            continue

        question_id = (
            _extract_question_id(
                question
            )
        )

        submitted = answers.get(
            question_id
        )

        if isinstance(
            submitted,
            dict
        ):

            submitted = submitted.get(
                "selected_answer",
                submitted.get(
                    "answer"
                )
            )

        correct_answer = question.get(
            "correct_answer",
            question.get(
                "answer"
            )
        )

        # ----------------------------------------------------
        # Skipped
        # ----------------------------------------------------

        if (
            submitted is None
            or str(
                submitted
            ).strip() == ""
        ):

            status = "SKIPPED"

            is_correct = False

            skipped_count += 1

        else:

            submitted_normalized = (
                str(
                    submitted
                ).strip().lower()
            )

            correct_normalized = (
                str(
                    correct_answer
                ).strip().lower()
            )

            is_correct = (
                submitted_normalized
                == correct_normalized
            )

            if is_correct:

                status = "CORRECT"

                correct_count += 1

            else:

                status = "WRONG"

                wrong_count += 1

        results.append({
            "question_id": question_id,

            "skill": _extract_skill(
                question
            ),

            "difficulty": _normalize_difficulty(
                question.get(
                    "difficulty",
                    "medium"
                )
            ),

            "selected_answer": submitted,

            "correct_answer": correct_answer,

            "status": status,

            "is_correct": is_correct,
        })

    total = len(
        results
    )

    percentage = (
        round(
            (
                correct_count
                / total
            ) * 100,
            2
        )
        if total
        else 0.0
    )

    return {
        "total_questions": total,

        "correct": correct_count,

        "wrong": wrong_count,

        "skipped": skipped_count,

        "percentage": percentage,

        "results": results,
    }


# ============================================================
# PERFORMANCE
# ============================================================

def calculate_performance(
    evaluation_result: Dict[str, Any]
) -> Dict[str, Any]:

    if not isinstance(
        evaluation_result,
        dict
    ):
        evaluation_result = {}

    percentage = _safe_float(
        evaluation_result.get(
            "percentage",
            0.0
        )
    )

    if percentage >= 85:

        level = "EXCELLENT"

    elif percentage >= 70:

        level = "GOOD"

    elif percentage >= 50:

        level = "AVERAGE"

    else:

        level = "NEEDS_IMPROVEMENT"

    return {
        "total_questions": _safe_int(
            evaluation_result.get(
                "total_questions",
                0
            )
        ),

        "correct": _safe_int(
            evaluation_result.get(
                "correct",
                0
            )
        ),

        "wrong": _safe_int(
            evaluation_result.get(
                "wrong",
                0
            )
        ),

        "skipped": _safe_int(
            evaluation_result.get(
                "skipped",
                0
            )
        ),

        "percentage": round(
            percentage,
            2
        ),

        "performance_level": level,
    }


# ============================================================
# COMPLETE TEST EVALUATION
# ============================================================

def evaluate_test(
    questions: List[Dict[str, Any]],
    answers: Dict[str, Any]
) -> Dict[str, Any]:

    evaluation = evaluate_answers(
        questions,
        answers
    )

    performance = calculate_performance(
        evaluation
    )

    return {
        **evaluation,
        "performance": performance,
    }


# ============================================================
# PRINT QUESTIONS
# ============================================================

def print_questions(
    questions: List[Dict[str, Any]]
) -> None:

    print(
        "\n" + "=" * 70
    )

    print(
        "SELECTED QUESTIONS"
    )

    print(
        "=" * 70
    )

    for index, question in enumerate(
        questions or [],
        start=1
    ):

        if not isinstance(
            question,
            dict
        ):
            continue

        print(
            f"\n{index}. "
            f"{question.get('question', '')}"
        )

        print(
            "   Skill:",
            question.get(
                "skill",
                "Unknown"
            )
        )

        print(
            "   Difficulty:",
            question.get(
                "difficulty",
                "medium"
            )
        )


# ============================================================
# DEMO
# ============================================================

def demo():

    print(
        "=" * 70
    )

    print(
        "CAMPUSLINK QUESTION SELECTOR"
    )

    print(
        "=" * 70
    )

    # --------------------------------------------------------
    # Test balanced interview selection
    # --------------------------------------------------------

    candidate_questions = [
        {
            "question_id": "INT-PY-001",
            "skill": "Python",
            "difficulty": "easy",
            "question_type": "INTERVIEW",
            "question": (
                "What are the main differences "
                "between a list and a tuple in Python?"
            ),
        },

        {
            "question_id": "INT-PY-002",
            "skill": "Python",
            "difficulty": "medium",
            "question_type": "INTERVIEW",
            "question": (
                "Explain Python decorators."
            ),
        },

        {
            "question_id": "INT-PY-003",
            "skill": "Python",
            "difficulty": "hard",
            "question_type": "INTERVIEW",
            "question": (
                "Explain Python memory management."
            ),
        },

        {
            "question_id": "INT-SQL-001",
            "skill": "SQL",
            "difficulty": "easy",
            "question_type": "INTERVIEW",
            "question": (
                "What is a primary key?"
            ),
        },

        {
            "question_id": "INT-SQL-002",
            "skill": "SQL",
            "difficulty": "medium",
            "question_type": "INTERVIEW",
            "question": (
                "Explain SQL JOIN operations."
            ),
        },

        {
            "question_id": "INT-OOP-001",
            "skill": "OOP",
            "difficulty": "hard",
            "question_type": "INTERVIEW",
            "question": (
                "Explain polymorphism with an example."
            ),
        },
    ]

    selected = select_balanced_questions(
        questions=candidate_questions,
        question_count=5,
        job_skills=[
            "Python",
            "SQL",
            "OOP",
        ],
        weak_skills=[
            "SQL",
        ],
        seed=42,
    )

    print_questions(
        selected
    )

    # --------------------------------------------------------
    # Weak skill test
    # --------------------------------------------------------

    performance_profile = {
        "overall_score": 58,

        "skill_performance": {

            "Python": {
                "score": 82
            },

            "SQL": {
                "score": 45
            },

            "OOP": {
                "score": 55
            },
        },
    }

    weak_skills = identify_weak_skills(
        performance_profile,
        threshold=60
    )

    print(
        "\nWeak skills:",
        weak_skills
    )

    strong_skills = identify_strong_skills(
        performance_profile,
        threshold=70
    )

    print(
        "Strong skills:",
        strong_skills
    )

    # --------------------------------------------------------
    # Adaptive selection
    # --------------------------------------------------------

    next_question = (
        select_next_adaptive_question(
            questions=candidate_questions,
            current_difficulty="medium",
            performance_profile=performance_profile,
            used_question_ids=[],
            weak_skills=weak_skills,
            seed=42,
        )
    )

    print(
        "\nAdaptive next question:"
    )

    print(
        next_question
    )

    print(
        "\n" + "=" * 70
    )

    print(
        "QUESTION SELECTOR TEST COMPLETED"
    )

    print(
        "=" * 70
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()