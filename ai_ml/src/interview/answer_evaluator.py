import re
from typing import Any, Dict, List, Optional


# ============================================================
# DEFAULT INTERVIEW RUBRICS
# ============================================================

DEFAULT_RUBRICS = {
    "technical_accuracy": 0.40,
    "relevance": 0.25,
    "concept_coverage": 0.20,
    "answer_quality": 0.15
}


# ============================================================
# RUBRIC LOADER
# ============================================================

def load_rubrics(
    rubric_config: Optional[Dict[str, float]] = None
) -> Dict[str, float]:
    """
    Load interview evaluation rubrics.

    A custom rubric can be supplied by the caller.
    Missing values fall back to the default configuration.
    """

    rubrics = DEFAULT_RUBRICS.copy()

    if isinstance(rubric_config, dict):
        for key, value in rubric_config.items():
            try:
                numeric_value = float(value)

                if numeric_value >= 0:
                    rubrics[key] = numeric_value

            except (TypeError, ValueError):
                continue

    # Normalize weights so that the total is 1.0
    total = sum(rubrics.values())

    if total <= 0:
        return DEFAULT_RUBRICS.copy()

    normalized = {
        key: round(value / total, 4)
        for key, value in rubrics.items()
    }

    return normalized


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalize text for evaluation.
    """

    if text is None:
        return ""

    text = str(text).lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


def tokenize(text: str) -> List[str]:
    """
    Convert text into normalized tokens.
    """

    normalized = normalize_text(text)

    if not normalized:
        return []

    return normalized.split()


# ============================================================
# KEYWORD MATCHING
# ============================================================

def calculate_keyword_coverage(
    student_answer: str,
    keywords: List[str]
) -> Dict[str, Any]:
    """
    Calculates how many required keywords/concepts
    are present in the student's answer.
    """

    if not keywords:
        return {
            "matched_keywords": [],
            "missing_keywords": [],
            "coverage_percentage": 0.0
        }

    normalized_answer = normalize_text(
        student_answer
    )

    matched = []
    missing = []

    for keyword in keywords:

        normalized_keyword = normalize_text(
            keyword
        )

        if not normalized_keyword:
            continue

        if normalized_keyword in normalized_answer:
            matched.append(keyword)
        else:
            missing.append(keyword)

    total = len(matched) + len(missing)

    coverage = (
        (len(matched) / total) * 100
        if total > 0
        else 0.0
    )

    return {
        "matched_keywords": matched,
        "missing_keywords": missing,
        "coverage_percentage": round(
            coverage,
            2
        )
    }


# ============================================================
# EXPECTED ANSWER SIMILARITY
# ============================================================

def calculate_text_similarity(
    student_answer: str,
    expected_answer: str
) -> float:
    """
    Calculates token-based similarity.

    This is a lightweight similarity calculation and
    does not require an external model.
    """

    student_tokens = set(
        tokenize(student_answer)
    )

    expected_tokens = set(
        tokenize(expected_answer)
    )

    if not student_tokens or not expected_tokens:
        return 0.0

    intersection = (
        student_tokens.intersection(
            expected_tokens
        )
    )

    union = (
        student_tokens.union(
            expected_tokens
        )
    )

    similarity = (
        len(intersection) /
        len(union)
    ) * 100

    return round(
        similarity,
        2
    )


# ============================================================
# ANSWER LENGTH / QUALITY
# ============================================================

def calculate_answer_quality(
    student_answer: str
) -> Dict[str, Any]:
    """
    Basic answer quality checks.

    This is not a correctness score.
    """

    words = tokenize(
        student_answer
    )

    word_count = len(words)

    if word_count == 0:
        quality = "EMPTY"

    elif word_count < 5:
        quality = "VERY_SHORT"

    elif word_count < 15:
        quality = "SHORT"

    elif word_count < 40:
        quality = "GOOD"

    else:
        quality = "DETAILED"

    return {
        "word_count": word_count,
        "quality": quality
    }


# ============================================================
# SCORE CALCULATION
# ============================================================

def calculate_score(
    keyword_coverage: float,
    text_similarity: float,
    answer_quality: str
) -> float:
    """
    Calculates final answer score.

    Existing scoring model:

        Keyword / concept coverage = 60%
        Expected-answer similarity = 30%
        Answer quality              = 10%
    """

    concept_score = keyword_coverage

    similarity_score = text_similarity

    quality_scores = {
        "EMPTY": 0,
        "VERY_SHORT": 30,
        "SHORT": 60,
        "GOOD": 90,
        "DETAILED": 100
    }

    quality_score = quality_scores.get(
        answer_quality,
        50
    )

    final_score = (
        concept_score * 0.60
        + similarity_score * 0.30
        + quality_score * 0.10
    )

    return round(
        max(
            0.0,
            min(
                100.0,
                final_score
            )
        ),
        2
    )


# ============================================================
# PERFORMANCE LEVEL
# ============================================================

def generate_performance_level(
    score: float
) -> str:

    if score >= 85:
        return "EXCELLENT"

    if score >= 70:
        return "GOOD"

    if score >= 50:
        return "AVERAGE"

    if score >= 30:
        return "WEAK"

    return "POOR"


# ============================================================
# FEEDBACK GENERATOR
# ============================================================

def generate_feedback(
    score: float,
    matched_keywords: List[str],
    missing_keywords: List[str],
    answer_quality: str
) -> str:

    feedback_parts = []

    if score >= 85:

        feedback_parts.append(
            "The answer demonstrates strong "
            "understanding of the expected concepts."
        )

    elif score >= 70:

        feedback_parts.append(
            "The answer demonstrates a good "
            "understanding of the main concepts."
        )

    elif score >= 50:

        feedback_parts.append(
            "The answer demonstrates partial "
            "understanding but some important "
            "concepts are missing."
        )

    else:

        feedback_parts.append(
            "The answer does not sufficiently "
            "demonstrate the expected concepts."
        )

    if matched_keywords:

        feedback_parts.append(
            "Covered concepts: "
            + ", ".join(matched_keywords)
            + "."
        )

    if missing_keywords:

        feedback_parts.append(
            "Concepts needing improvement: "
            + ", ".join(missing_keywords)
            + "."
        )

    if answer_quality in [
        "EMPTY",
        "VERY_SHORT"
    ]:

        feedback_parts.append(
            "The answer is too short and should "
            "provide more explanation."
        )

    return " ".join(
        feedback_parts
    )


# ============================================================
# MAIN ANSWER EVALUATOR
# ============================================================

def evaluate_answer(
    question: Dict[str, Any],
    student_answer: str
) -> Dict[str, Any]:
    """
    Evaluate one interview answer.
    """

    question_id = question.get(
        "question_id"
    )

    skill = question.get(
        "skill"
    )

    difficulty = question.get(
        "difficulty"
    )

    question_text = question.get(
        "question",
        ""
    )

    expected_answer = question.get(
        "expected_answer"
    )

    keywords = question.get(
        "keywords",
        []
    )

    if not expected_answer and not keywords:

        return {
            "success": False,
            "evaluation_ready": False,
            "message": (
                "No evaluation rubric is available "
                "for this question. Add expected_answer "
                "or keywords to the question."
            ),
            "question_id": question_id,
            "skill": skill,
            "difficulty": difficulty
        }

    # --------------------------------------------------------
    # EMPTY ANSWER
    # --------------------------------------------------------

    if (
        not student_answer
        or not str(student_answer).strip()
    ):

        return {
            "success": True,
            "evaluation_ready": True,
            "question_id": question_id,
            "skill": skill,
            "difficulty": difficulty,
            "question": question_text,
            "student_answer": "",
            "score": 0.0,
            "performance_level": "POOR",
            "matched_keywords": [],
            "missing_keywords": keywords,
            "keyword_coverage": 0.0,
            "text_similarity": 0.0,
            "answer_quality": "EMPTY",
            "word_count": 0,
            "feedback": "No answer was provided."
        }

    # --------------------------------------------------------
    # KEYWORD EVALUATION
    # --------------------------------------------------------

    keyword_result = calculate_keyword_coverage(
        student_answer,
        keywords
    )

    keyword_coverage = keyword_result[
        "coverage_percentage"
    ]

    # --------------------------------------------------------
    # TEXT SIMILARITY
    # --------------------------------------------------------

    if expected_answer:

        text_similarity = calculate_text_similarity(
            student_answer,
            expected_answer
        )

    else:

        text_similarity = 0.0

    # --------------------------------------------------------
    # ANSWER QUALITY
    # --------------------------------------------------------

    quality_result = calculate_answer_quality(
        student_answer
    )

    answer_quality = quality_result[
        "quality"
    ]

    # --------------------------------------------------------
    # SCORE
    # --------------------------------------------------------

    score = calculate_score(
        keyword_coverage=keyword_coverage,
        text_similarity=text_similarity,
        answer_quality=answer_quality
    )

    performance_level = (
        generate_performance_level(score)
    )

    feedback = generate_feedback(
        score=score,
        matched_keywords=keyword_result[
            "matched_keywords"
        ],
        missing_keywords=keyword_result[
            "missing_keywords"
        ],
        answer_quality=answer_quality
    )

    return {
        "success": True,
        "evaluation_ready": True,
        "question_id": question_id,
        "skill": skill,
        "difficulty": difficulty,
        "question": question_text,
        "student_answer": student_answer,
        "score": score,
        "performance_level": performance_level,
        "matched_keywords": keyword_result[
            "matched_keywords"
        ],
        "missing_keywords": keyword_result[
            "missing_keywords"
        ],
        "keyword_coverage": keyword_coverage,
        "text_similarity": text_similarity,
        "answer_quality": answer_quality,
        "word_count": quality_result[
            "word_count"
        ],
        "feedback": feedback
    }


# ============================================================
# BATCH EVALUATION
# ============================================================

def evaluate_answers(
    questions: List[Dict[str, Any]],
    student_answers: Dict[str, str]
) -> List[Dict[str, Any]]:

    results = []

    for question in questions:

        question_id = question.get(
            "question_id"
        )

        student_answer = student_answers.get(
            question_id,
            ""
        )

        result = evaluate_answer(
            question,
            student_answer
        )

        results.append(result)

    return results


# ============================================================
# INTERVIEW SERVICE COMPATIBILITY
# ============================================================

def evaluate_interview_answers(
    questions: List[Dict[str, Any]],
    student_answers: Any
) -> Dict[str, Any]:
    """
    Compatibility function used by interview_service.py.

    Supports either:

        {
            "PY001": "answer",
            "PY002": "answer"
        }

    or:

        [
            {
                "question_id": "PY001",
                "answer": "..."
            }
        ]

    Returns detailed answer evaluations together
    with overall and skill-wise performance.
    """

    # --------------------------------------------------------
    # Normalize student answers
    # --------------------------------------------------------

    normalized_answers = {}

    if isinstance(student_answers, dict):

        normalized_answers = {
            str(key): value
            for key, value in student_answers.items()
        }

    elif isinstance(student_answers, list):

        for item in student_answers:

            if not isinstance(item, dict):
                continue

            question_id = item.get(
                "question_id"
            )

            if question_id is None:
                continue

            answer = item.get(
                "answer",
                item.get(
                    "student_answer",
                    ""
                )
            )

            normalized_answers[
                str(question_id)
            ] = answer

    # --------------------------------------------------------
    # Evaluate
    # --------------------------------------------------------

    evaluation_results = evaluate_answers(
        questions=questions,
        student_answers=normalized_answers
    )

    overall = calculate_overall_interview_score(
        evaluation_results
    )

    skill_performance = calculate_skill_performance(
        evaluation_results
    )

    # --------------------------------------------------------
    # Strengths / improvements
    # --------------------------------------------------------

    strengths = []
    improvements = []

    for skill, data in skill_performance.items():

        score = data.get(
            "score",
            0.0
        )

        if score >= 70:

            strengths.append(skill)

        else:

            improvements.append(skill)

    return {
        "success": True,
        "evaluation_ready": True,
        "evaluations": evaluation_results,
        "question_evaluations": evaluation_results,
        "overall": overall,
        "overall_score": overall[
            "overall_score"
        ],
        "skill_performance": skill_performance,
        "strengths": strengths,
        "improvements": improvements
    }


# ============================================================
# OVERALL INTERVIEW PERFORMANCE
# ============================================================

def calculate_overall_interview_score(
    evaluation_results: List[Dict[str, Any]]
) -> Dict[str, Any]:

    valid_results = [
        result
        for result in evaluation_results
        if result.get(
            "evaluation_ready"
        ) is True
    ]

    if not valid_results:

        return {
            "overall_score": 0.0,
            "total_questions": 0,
            "evaluated_questions": 0
        }

    scores = [
        result.get(
            "score",
            0.0
        )
        for result in valid_results
    ]

    overall_score = (
        sum(scores) / len(scores)
    )

    return {
        "overall_score": round(
            overall_score,
            2
        ),
        "total_questions": len(
            evaluation_results
        ),
        "evaluated_questions": len(
            valid_results
        )
    }


# ============================================================
# SKILL PERFORMANCE
# ============================================================

def calculate_skill_performance(
    evaluation_results: List[Dict[str, Any]]
) -> Dict[str, Dict[str, Any]]:

    skill_data = {}

    for result in evaluation_results:

        if not result.get(
            "evaluation_ready"
        ):
            continue

        skill = result.get(
            "skill",
            "Unknown"
        )

        if skill not in skill_data:
            skill_data[skill] = []

        skill_data[skill].append(
            result.get(
                "score",
                0.0
            )
        )

    output = {}

    for skill, scores in skill_data.items():

        average = (
            sum(scores) / len(scores)
        )

        output[skill] = {
            "score": round(
                average,
                2
            ),
            "questions": len(scores),
            "performance_level": (
                generate_performance_level(
                    average
                )
            )
        }

    return output


# ============================================================
# STUDENT-SAFE RESULT
# ============================================================

def create_student_result(
    evaluation_results: List[Dict[str, Any]]
) -> Dict[str, Any]:

    overall = (
        calculate_overall_interview_score(
            evaluation_results
        )
    )

    skill_performance = (
        calculate_skill_performance(
            evaluation_results
        )
    )

    return {
        "overall_score": overall[
            "overall_score"
        ],
        "performance_level": (
            generate_performance_level(
                overall["overall_score"]
            )
        ),
        "total_questions": overall[
            "total_questions"
        ],
        "evaluated_questions": overall[
            "evaluated_questions"
        ],
        "skill_performance": skill_performance
    }


# ============================================================
# RECRUITER RESULT
# ============================================================

def create_recruiter_result(
    evaluation_results: List[Dict[str, Any]]
) -> Dict[str, Any]:

    overall = (
        calculate_overall_interview_score(
            evaluation_results
        )
    )

    skill_performance = (
        calculate_skill_performance(
            evaluation_results
        )
    )

    return {
        "overall_score": overall[
            "overall_score"
        ],
        "performance_level": (
            generate_performance_level(
                overall["overall_score"]
            )
        ),
        "total_questions": overall[
            "total_questions"
        ],
        "evaluated_questions": overall[
            "evaluated_questions"
        ],
        "skill_performance": skill_performance,
        "question_evaluations": evaluation_results
    }


# ============================================================
# DEMO
# ============================================================

def demo():

    print("=" * 70)
    print("AI INTERVIEW ANSWER EVALUATOR")
    print("=" * 70)

    # --------------------------------------------------------
    # RUBRIC TEST
    # --------------------------------------------------------

    rubrics = load_rubrics()

    print("\nLoaded Rubrics:")
    print(rubrics)

    # --------------------------------------------------------
    # QUESTION
    # --------------------------------------------------------

    question = {
        "question_id": "PY001",
        "skill": "Python",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between a list and "
            "a tuple in Python?"
        ),
        "expected_answer": (
            "A list is mutable while a tuple is immutable. "
            "Lists can be modified after creation, whereas "
            "tuples cannot be changed."
        ),
        "keywords": [
            "list",
            "tuple",
            "mutable",
            "immutable"
        ]
    }

    student_answer = (
        "A list is mutable and we can change its values. "
        "A tuple is immutable and cannot be modified "
        "after it is created."
    )

    # --------------------------------------------------------
    # SINGLE EVALUATION
    # --------------------------------------------------------

    result = evaluate_answer(
        question=question,
        student_answer=student_answer
    )

    print("\nEvaluation Result:")
    print("-" * 70)

    for key, value in result.items():
        print(
            f"{key}: {value}"
        )

    # --------------------------------------------------------
    # BATCH
    # --------------------------------------------------------

    questions = [
        question,
        {
            "question_id": "PY002",
            "skill": "Python",
            "difficulty": "easy",
            "question": (
                "What is a Python function?"
            ),
            "expected_answer": (
                "A function is a reusable block of code "
                "that performs a specific task."
            ),
            "keywords": [
                "function",
                "reusable",
                "code",
                "task"
            ]
        }
    ]

    student_answers = {
        "PY001": student_answer,
        "PY002": (
            "A function is reusable code that performs "
            "a particular task."
        )
    }

    batch_results = evaluate_answers(
        questions,
        student_answers
    )

    # --------------------------------------------------------
    # INTERVIEW SERVICE FUNCTION
    # --------------------------------------------------------

    interview_result = (
        evaluate_interview_answers(
            questions,
            student_answers
        )
    )

    print("\n" + "=" * 70)
    print("INTERVIEW SERVICE RESULT")
    print("=" * 70)

    print(
        "Overall Score:",
        interview_result["overall_score"]
    )

    print(
        "Strengths:",
        interview_result["strengths"]
    )

    print(
        "Improvements:",
        interview_result["improvements"]
    )

    # --------------------------------------------------------
    # STUDENT RESULT
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("STUDENT RESULT")
    print("=" * 70)

    print(
        create_student_result(
            batch_results
        )
    )

    # --------------------------------------------------------
    # RECRUITER RESULT
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("RECRUITER RESULT")
    print("=" * 70)

    print(
        create_recruiter_result(
            batch_results
        )
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()