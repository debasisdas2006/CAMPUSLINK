from typing import Any, Dict, List


# ============================================================
# PERFORMANCE THRESHOLDS
# ============================================================

EXCELLENT_SCORE = 85.0
GOOD_SCORE = 70.0
AVERAGE_SCORE = 50.0
WEAK_SCORE = 30.0


# ============================================================
# SAFE SCORE
# ============================================================

def safe_score(value: Any) -> float:
    """
    Safely convert a value into a score between 0 and 100.
    """

    try:
        score = float(value)
    except (TypeError, ValueError):
        return 0.0

    return round(
        max(0.0, min(100.0, score)),
        2
    )


# ============================================================
# PERFORMANCE LEVEL
# ============================================================

def get_performance_level(score: Any) -> str:
    """
    Convert score into a readable performance level.
    """

    score = safe_score(score)

    if score >= EXCELLENT_SCORE:
        return "EXCELLENT"

    if score >= GOOD_SCORE:
        return "GOOD"

    if score >= AVERAGE_SCORE:
        return "AVERAGE"

    if score >= WEAK_SCORE:
        return "WEAK"

    return "POOR"


# ============================================================
# OVERALL FEEDBACK MESSAGE
# ============================================================

def generate_overall_feedback(
    score: Any,
    performance_level: str = None
) -> str:
    """
    Generate general interview feedback based on score.
    """

    score = safe_score(score)

    if performance_level is None:
        performance_level = get_performance_level(
            score
        )

    messages = {
        "EXCELLENT": (
            "Your interview performance was excellent. "
            "You demonstrated strong technical understanding "
            "and handled the interview questions effectively."
        ),

        "GOOD": (
            "Your interview performance was good. "
            "You demonstrated a good level of technical "
            "understanding and handled most questions effectively."
        ),

        "AVERAGE": (
            "Your interview performance was average. "
            "You demonstrated some good technical knowledge, "
            "but several areas require further improvement."
        ),

        "WEAK": (
            "Your interview performance needs improvement. "
            "You should strengthen your technical fundamentals "
            "and practice explaining your solutions more clearly."
        ),

        "POOR": (
            "Your interview performance was below the expected "
            "level. Focus on strengthening fundamental concepts "
            "and practice solving technical interview questions."
        )
    }

    return messages.get(
        performance_level,
        messages["POOR"]
    )


# ============================================================
# SKILL SCORE EXTRACTION
# ============================================================

def extract_skill_score(
    skill_data: Dict[str, Any]
) -> float:
    """
    Extract a skill score from different possible structures.
    """

    if not isinstance(
        skill_data,
        dict
    ):
        return safe_score(
            skill_data
        )

    possible_keys = [
        "score",
        "score_percentage",
        "percentage",
        "average_score"
    ]

    for key in possible_keys:

        if key in skill_data:

            return safe_score(
                skill_data.get(key)
            )

    return 0.0


# ============================================================
# SKILL PERFORMANCE LEVEL
# ============================================================

def get_skill_performance(
    score: Any
) -> str:
    """
    Convert skill score into a performance category.
    """

    score = safe_score(score)

    if score >= 80:
        return "STRONG"

    if score >= 60:
        return "GOOD"

    if score >= 40:
        return "AVERAGE"

    return "WEAK"


# ============================================================
# GENERATE STRENGTHS
# ============================================================

def generate_strengths(
    skill_performance: Dict[str, Any]
) -> List[str]:
    """
    Identify strong technical skills.
    """

    strengths = []

    if not isinstance(
        skill_performance,
        dict
    ):
        return strengths

    for skill, data in skill_performance.items():

        score = extract_skill_score(
            data
        )

        if score >= 70:

            strengths.append(
                f"{skill}: demonstrated strong "
                f"performance with a score of "
                f"{score}%."
            )

    return strengths


# ============================================================
# GENERATE IMPROVEMENT AREAS
# ============================================================

def generate_improvement_areas(
    skill_performance: Dict[str, Any]
) -> List[str]:
    """
    Identify technical skills that need improvement.
    """

    improvement_areas = []

    if not isinstance(
        skill_performance,
        dict
    ):
        return improvement_areas

    for skill, data in skill_performance.items():

        score = extract_skill_score(
            data
        )

        if score < 60:

            improvement_areas.append(
                f"{skill}: improve technical "
                f"understanding and practice "
                f"more interview questions."
            )

    return improvement_areas


# ============================================================
# GENERATE NEXT STEPS
# ============================================================

def generate_next_steps(
    score: Any,
    skill_performance: Dict[str, Any],
    improvement_areas: List[str]
) -> List[str]:
    """
    Generate practical recommendations for the student.
    """

    score = safe_score(
        score
    )

    next_steps = []

    if score >= 85:

        next_steps.append(
            "Continue practicing advanced "
            "technical interview questions."
        )

        next_steps.append(
            "Focus on explaining solutions "
            "clearly and efficiently."
        )

    elif score >= 70:

        next_steps.append(
            "Strengthen intermediate concepts "
            "and practice explaining solutions clearly."
        )

        next_steps.append(
            "Practice medium and hard difficulty "
            "interview questions."
        )

    elif score >= 50:

        next_steps.append(
            "Review fundamental technical concepts."
        )

        next_steps.append(
            "Practice more technical interview questions."
        )

        next_steps.append(
            "Work on explaining answers step by step."
        )

    else:

        next_steps.append(
            "Strengthen fundamental programming concepts."
        )

        next_steps.append(
            "Practice skill-wise questions regularly."
        )

        next_steps.append(
            "Repeat mock interviews before attempting "
            "another technical interview."
        )

    if improvement_areas:

        next_steps.append(
            "Focus especially on the skills "
            "identified in the improvement areas."
        )

    return next_steps


# ============================================================
# GENERATE FEEDBACK
# ============================================================

def generate_feedback(
    performance_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate complete interview feedback.

    Expected input:

    {
        "overall_score": 76.25,
        "performance_level": "GOOD",

        "skill_performance": {
            "Python": {
                "score": 82.5
            },
            "SQL": {
                "score": 70
            }
        }
    }

    Returns:

    {
        "overall": {...},
        "strengths": [...],
        "improvement_areas": [...],
        "next_steps": [...]
    }
    """

    if not isinstance(
        performance_profile,
        dict
    ):
        performance_profile = {}

    # --------------------------------------------------------
    # Overall score
    # --------------------------------------------------------

    overall_score = safe_score(
        performance_profile.get(
            "overall_score",
            0.0
        )
    )

    # --------------------------------------------------------
    # Performance level
    # --------------------------------------------------------

    performance_level = performance_profile.get(
        "performance_level"
    )

    if not performance_level:
        performance_level = get_performance_level(
            overall_score
        )

    performance_level = str(
        performance_level
    ).upper()

    # --------------------------------------------------------
    # Skill performance
    # --------------------------------------------------------

    skill_performance = performance_profile.get(
        "skill_performance",
        {}
    )

    if not isinstance(
        skill_performance,
        dict
    ):
        skill_performance = {}

    # --------------------------------------------------------
    # Strengths
    # --------------------------------------------------------

    strengths = generate_strengths(
        skill_performance
    )

    # --------------------------------------------------------
    # Improvement areas
    # --------------------------------------------------------

    improvement_areas = generate_improvement_areas(
        skill_performance
    )

    # --------------------------------------------------------
    # Next steps
    # --------------------------------------------------------

    next_steps = generate_next_steps(
        score=overall_score,
        skill_performance=skill_performance,
        improvement_areas=improvement_areas
    )

    # --------------------------------------------------------
    # Overall feedback
    # --------------------------------------------------------

    overall_feedback = generate_overall_feedback(
        score=overall_score,
        performance_level=performance_level
    )

    # --------------------------------------------------------
    # Final feedback object
    # --------------------------------------------------------

    return {
        "overall": {
            "score": overall_score,
            "performance_level": performance_level,
            "feedback": overall_feedback
        },

        "strengths": strengths,

        "improvement_areas": improvement_areas,

        "next_steps": next_steps
    }


# ============================================================
# ALTERNATIVE COMPATIBILITY FUNCTION
# ============================================================

def generate_interview_feedback(
    performance_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compatibility wrapper.

    Some parts of CAMPUSLINK may use the name
    generate_interview_feedback instead of
    generate_feedback.
    """

    return generate_feedback(
        performance_profile
    )


# ============================================================
# STUDENT FEEDBACK
# ============================================================

def create_student_feedback(
    performance_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create student-safe feedback.

    Internal evaluator information is not exposed.
    """

    feedback = generate_feedback(
        performance_profile
    )

    return {
        "overall": feedback.get(
            "overall",
            {}
        ),

        "strengths": feedback.get(
            "strengths",
            []
        ),

        "improvement_areas": feedback.get(
            "improvement_areas",
            []
        ),

        "next_steps": feedback.get(
            "next_steps",
            []
        )
    }


# ============================================================
# RECRUITER FEEDBACK
# ============================================================

def create_recruiter_feedback(
    performance_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create detailed feedback for recruiter/interviewer.
    """

    feedback = generate_feedback(
        performance_profile
    )

    return {
        "overall": feedback.get(
            "overall",
            {}
        ),

        "strengths": feedback.get(
            "strengths",
            []
        ),

        "improvement_areas": feedback.get(
            "improvement_areas",
            []
        ),

        "next_steps": feedback.get(
            "next_steps",
            []
        ),

        "skill_performance": performance_profile.get(
            "skill_performance",
            {}
        ),

        "difficulty_performance": performance_profile.get(
            "difficulty_performance",
            {}
        )
    }


# ============================================================
# DEMO
# ============================================================

def demo():

    print("=" * 70)
    print("CAMPUSLINK INTERVIEW FEEDBACK GENERATOR")
    print("=" * 70)

    performance_profile = {
        "overall_score": 76.25,

        "performance_level": "GOOD",

        "skill_performance": {

            "Python": {
                "score": 82.5,
                "question_count": 2,
                "performance": "STRONG"
            },

            "SQL": {
                "score": 70.0,
                "question_count": 2,
                "performance": "GOOD"
            },

            "DSA": {
                "score": 45.0,
                "question_count": 1,
                "performance": "WEAK"
            }
        },

        "difficulty_performance": {

            "easy": {
                "score": 87.5,
                "question_count": 2
            },

            "medium": {
                "score": 65.0,
                "question_count": 2
            }
        }
    }

    feedback = generate_feedback(
        performance_profile
    )

    print("\nOVERALL")
    print("-" * 70)

    print(
        "Score:",
        feedback["overall"]["score"]
    )

    print(
        "Performance:",
        feedback["overall"]["performance_level"]
    )

    print(
        "Feedback:",
        feedback["overall"]["feedback"]
    )

    print("\nSTRENGTHS")
    print("-" * 70)

    for strength in feedback["strengths"]:
        print(
            "-",
            strength
        )

    print("\nIMPROVEMENT AREAS")
    print("-" * 70)

    for area in feedback["improvement_areas"]:
        print(
            "-",
            area
        )

    print("\nNEXT STEPS")
    print("-" * 70)

    for step in feedback["next_steps"]:
        print(
            "-",
            step
        )

    print("\n" + "=" * 70)
    print("FEEDBACK GENERATION SUCCESSFUL")
    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()