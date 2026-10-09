from typing import Any, Dict, List
from statistics import mean, pstdev


# ============================================================
# PERFORMANCE THRESHOLDS
# ============================================================

EXCELLENT_SCORE = 85.0
GOOD_SCORE = 70.0
AVERAGE_SCORE = 50.0
WEAK_SCORE = 30.0

STRONG_SKILL_SCORE = 70.0
WEAK_SKILL_SCORE = 50.0


# ============================================================
# PERFORMANCE LEVEL
# ============================================================

def generate_performance_level(score: float) -> str:
    """
    Convert numerical interview score into a performance level.
    """

    try:
        score = float(score)
    except (TypeError, ValueError):
        score = 0.0

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
# BASIC SCORE CALCULATION
# ============================================================

def calculate_overall_score(
    evaluations: List[Dict[str, Any]]
) -> float:
    """
    Calculate average score from evaluated interview answers.
    """

    scores = []

    for evaluation in evaluations or []:

        if not isinstance(evaluation, dict):
            continue

        score = evaluation.get("score")

        if score is None:
            continue

        try:
            score = float(score)
        except (TypeError, ValueError):
            continue

        score = max(
            0.0,
            min(100.0, score)
        )

        scores.append(score)

    if not scores:
        return 0.0

    return round(
        mean(scores),
        2
    )


# ============================================================
# ANSWERED RATE
# ============================================================

def calculate_answered_rate(
    total_questions: int,
    answered_questions: int
) -> float:
    """
    Calculate percentage of questions answered.
    """

    try:
        total_questions = int(total_questions)
        answered_questions = int(answered_questions)
    except (TypeError, ValueError):
        return 0.0

    if total_questions <= 0:
        return 0.0

    answered_questions = max(
        0,
        min(
            total_questions,
            answered_questions
        )
    )

    return round(
        (answered_questions / total_questions) * 100,
        2
    )


# ============================================================
# SCORE CONSISTENCY
# ============================================================

def calculate_score_consistency(
    evaluations: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Calculate score variation across interview answers.

    Lower standard deviation means the scores are more consistent.
    """

    scores = []

    for evaluation in evaluations or []:

        if not isinstance(evaluation, dict):
            continue

        score = evaluation.get("score")

        if score is None:
            continue

        try:
            scores.append(
                float(score)
            )
        except (TypeError, ValueError):
            continue

    if not scores:
        return {
            "mean_score": 0.0,
            "standard_deviation": 0.0,
            "minimum_score": 0.0,
            "maximum_score": 0.0
        }

    return {
        "mean_score": round(
            mean(scores),
            2
        ),
        "standard_deviation": round(
            pstdev(scores),
            2
        ),
        "minimum_score": round(
            min(scores),
            2
        ),
        "maximum_score": round(
            max(scores),
            2
        )
    }


# ============================================================
# SKILL PERFORMANCE
# ============================================================

def calculate_skill_performance(
    evaluations: List[Dict[str, Any]]
) -> Dict[str, Dict[str, Any]]:
    """
    Calculate performance separately for each skill.
    """

    skill_scores = {}

    for evaluation in evaluations or []:

        if not isinstance(evaluation, dict):
            continue

        skill = evaluation.get(
            "skill",
            "Unknown"
        )

        if not skill:
            skill = "Unknown"

        score = evaluation.get(
            "score"
        )

        if score is None:
            continue

        try:
            score = float(score)
        except (TypeError, ValueError):
            continue

        if skill not in skill_scores:
            skill_scores[skill] = []

        skill_scores[skill].append(
            score
        )

    result = {}

    for skill, scores in skill_scores.items():

        if not scores:
            continue

        average_score = mean(scores)

        result[skill] = {
            "score": round(
                average_score,
                2
            ),
            "questions": len(scores),
            "performance_level": generate_performance_level(
                average_score
            )
        }

    return result


# ============================================================
# DIFFICULTY PERFORMANCE
# ============================================================

def calculate_difficulty_performance(
    evaluations: List[Dict[str, Any]]
) -> Dict[str, Dict[str, Any]]:
    """
    Calculate performance by question difficulty.
    """

    difficulty_scores = {}

    for evaluation in evaluations or []:

        if not isinstance(evaluation, dict):
            continue

        difficulty = evaluation.get(
            "difficulty",
            "unknown"
        )

        if not difficulty:
            difficulty = "unknown"

        score = evaluation.get(
            "score"
        )

        if score is None:
            continue

        try:
            score = float(score)
        except (TypeError, ValueError):
            continue

        if difficulty not in difficulty_scores:
            difficulty_scores[difficulty] = []

        difficulty_scores[difficulty].append(
            score
        )

    result = {}

    for difficulty, scores in difficulty_scores.items():

        if not scores:
            continue

        average_score = mean(scores)

        result[difficulty] = {
            "score": round(
                average_score,
                2
            ),
            "questions": len(scores),
            "performance_level": generate_performance_level(
                average_score
            )
        }

    return result


# ============================================================
# STRONG / WEAK SKILLS
# ============================================================

def identify_skill_areas(
    skill_performance: Dict[str, Dict[str, Any]]
) -> Dict[str, List[str]]:
    """
    Identify strong and weak skill areas.

    Strong:
        score >= 70

    Weak:
        score < 50

    Improvement:
        score < 70
    """

    strong_skills = []
    weak_skills = []
    improvement_skills = []

    for skill, data in (
        skill_performance or {}
    ).items():

        try:
            score = float(
                data.get(
                    "score",
                    0.0
                )
            )
        except (TypeError, ValueError):
            score = 0.0

        if score >= STRONG_SKILL_SCORE:
            strong_skills.append(
                skill
            )

        if score < WEAK_SKILL_SCORE:
            weak_skills.append(
                skill
            )

        if score < STRONG_SKILL_SCORE:
            improvement_skills.append(
                skill
            )

    return {
        "strong_skills": strong_skills,
        "weak_skills": weak_skills,
        "skills_needing_improvement": improvement_skills
    }


# ============================================================
# QUESTION PERFORMANCE
# ============================================================

def calculate_question_performance(
    evaluations: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Return performance information for each evaluated question.
    """

    result = []

    for evaluation in evaluations or []:

        if not isinstance(evaluation, dict):
            continue

        raw_score = evaluation.get(
            "score",
            0.0
        )

        try:
            score = float(raw_score)
        except (TypeError, ValueError):
            score = 0.0

        result.append({
            "question_id": evaluation.get(
                "question_id"
            ),
            "skill": evaluation.get(
                "skill"
            ),
            "difficulty": evaluation.get(
                "difficulty"
            ),
            "score": round(
                score,
                2
            ),
            "performance_level": evaluation.get(
                "performance_level",
                generate_performance_level(
                    score
                )
            )
        })

    return result


# ============================================================
# SCORE DISTRIBUTION
# ============================================================

def calculate_score_distribution(
    evaluations: List[Dict[str, Any]]
) -> Dict[str, int]:
    """
    Count answers in different performance bands.
    """

    distribution = {
        "excellent": 0,
        "good": 0,
        "average": 0,
        "weak": 0,
        "poor": 0
    }

    for evaluation in evaluations or []:

        if not isinstance(evaluation, dict):
            continue

        score = evaluation.get(
            "score"
        )

        if score is None:
            continue

        try:
            score = float(score)
        except (TypeError, ValueError):
            continue

        if score >= EXCELLENT_SCORE:
            distribution["excellent"] += 1

        elif score >= GOOD_SCORE:
            distribution["good"] += 1

        elif score >= AVERAGE_SCORE:
            distribution["average"] += 1

        elif score >= WEAK_SCORE:
            distribution["weak"] += 1

        else:
            distribution["poor"] += 1

    return distribution


# ============================================================
# COMPLETE PERFORMANCE ANALYSIS
# ============================================================

def analyze_interview_performance(
    evaluations: List[Dict[str, Any]],
    total_questions: int = None,
    answered_questions: int = None
) -> Dict[str, Any]:
    """
    Generate complete interview performance analysis.
    """

    evaluations = evaluations or []

    if total_questions is None:
        total_questions = len(
            evaluations
        )

    if answered_questions is None:
        answered_questions = len(
            evaluations
        )

    try:
        total_questions = max(
            0,
            int(total_questions)
        )
    except (TypeError, ValueError):
        total_questions = len(
            evaluations
        )

    try:
        answered_questions = max(
            0,
            int(answered_questions)
        )
    except (TypeError, ValueError):
        answered_questions = len(
            evaluations
        )

    if total_questions > 0:
        answered_questions = min(
            answered_questions,
            total_questions
        )

    unanswered_questions = max(
        0,
        total_questions - answered_questions
    )

    evaluated_questions = len(
        evaluations
    )

    overall_score = calculate_overall_score(
        evaluations
    )

    performance_level = generate_performance_level(
        overall_score
    )

    answered_rate = calculate_answered_rate(
        total_questions,
        answered_questions
    )

    skill_performance = calculate_skill_performance(
        evaluations
    )

    difficulty_performance = calculate_difficulty_performance(
        evaluations
    )

    skill_areas = identify_skill_areas(
        skill_performance
    )

    consistency = calculate_score_consistency(
        evaluations
    )

    score_distribution = calculate_score_distribution(
        evaluations
    )

    question_performance = calculate_question_performance(
        evaluations
    )

    return {
        "overall_score": overall_score,
        "performance_level": performance_level,

        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "unanswered_questions": unanswered_questions,
        "evaluated_questions": evaluated_questions,

        "answered_rate": answered_rate,

        "skill_performance": skill_performance,
        "difficulty_performance": difficulty_performance,

        "strong_skills": skill_areas[
            "strong_skills"
        ],

        "weak_skills": skill_areas[
            "weak_skills"
        ],

        "skills_needing_improvement": skill_areas[
            "skills_needing_improvement"
        ],

        "score_consistency": consistency,

        "score_distribution": score_distribution,

        "question_performance": question_performance
    }


# ============================================================
# PERFORMANCE PROFILE
# ============================================================

def build_performance_profile(
    evaluations: List[Dict[str, Any]],
    total_questions: int = None,
    answered_questions: int = None
) -> Dict[str, Any]:
    """
    Build a complete performance profile for interview_service.py.

    This combines the complete interview analysis with
    AI/ML-ready performance features.
    """

    evaluations = evaluations or []

    # --------------------------------------------------------
    # Complete analysis
    # --------------------------------------------------------

    analysis = analyze_interview_performance(
        evaluations=evaluations,
        total_questions=total_questions,
        answered_questions=answered_questions
    )

    # --------------------------------------------------------
    # AI / ML features
    # --------------------------------------------------------

    ai_features = generate_ai_performance_features(
        analysis
    )

    # --------------------------------------------------------
    # Final profile
    # --------------------------------------------------------

    return {
        "overall_score": analysis.get(
            "overall_score",
            0.0
        ),

        "performance_level": analysis.get(
            "performance_level",
            "POOR"
        ),

        "total_questions": analysis.get(
            "total_questions",
            0
        ),

        "answered_questions": analysis.get(
            "answered_questions",
            0
        ),

        "unanswered_questions": analysis.get(
            "unanswered_questions",
            0
        ),

        "evaluated_questions": analysis.get(
            "evaluated_questions",
            0
        ),

        "answered_rate": analysis.get(
            "answered_rate",
            0.0
        ),

        "skill_performance": analysis.get(
            "skill_performance",
            {}
        ),

        "difficulty_performance": analysis.get(
            "difficulty_performance",
            {}
        ),

        "strong_skills": analysis.get(
            "strong_skills",
            []
        ),

        "weak_skills": analysis.get(
            "weak_skills",
            []
        ),

        "skills_needing_improvement": analysis.get(
            "skills_needing_improvement",
            []
        ),

        "score_consistency": analysis.get(
            "score_consistency",
            {}
        ),

        "score_distribution": analysis.get(
            "score_distribution",
            {}
        ),

        "question_performance": analysis.get(
            "question_performance",
            []
        ),

        "ai_features": ai_features
    }


# ============================================================
# STUDENT REPORT
# ============================================================

def create_student_performance_report(
    analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a student-safe performance report.

    Internal answer evaluation details are not exposed.
    """

    analysis = analysis or {}

    return {
        "overall_score": analysis.get(
            "overall_score",
            0.0
        ),

        "performance_level": analysis.get(
            "performance_level",
            "POOR"
        ),

        "total_questions": analysis.get(
            "total_questions",
            0
        ),

        "answered_questions": analysis.get(
            "answered_questions",
            0
        ),

        "unanswered_questions": analysis.get(
            "unanswered_questions",
            0
        ),

        "answered_rate": analysis.get(
            "answered_rate",
            0.0
        ),

        "skill_performance": analysis.get(
            "skill_performance",
            {}
        ),

        "strong_skills": analysis.get(
            "strong_skills",
            []
        ),

        "weak_skills": analysis.get(
            "weak_skills",
            []
        ),

        "skills_needing_improvement": analysis.get(
            "skills_needing_improvement",
            []
        ),

        "difficulty_performance": analysis.get(
            "difficulty_performance",
            {}
        )
    }


# ============================================================
# RECRUITER REPORT
# ============================================================

def create_recruiter_performance_report(
    analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create detailed recruiter/interviewer performance report.
    """

    analysis = analysis or {}

    return {
        "overall_score": analysis.get(
            "overall_score",
            0.0
        ),

        "performance_level": analysis.get(
            "performance_level",
            "POOR"
        ),

        "total_questions": analysis.get(
            "total_questions",
            0
        ),

        "answered_questions": analysis.get(
            "answered_questions",
            0
        ),

        "unanswered_questions": analysis.get(
            "unanswered_questions",
            0
        ),

        "evaluated_questions": analysis.get(
            "evaluated_questions",
            0
        ),

        "answered_rate": analysis.get(
            "answered_rate",
            0.0
        ),

        "skill_performance": analysis.get(
            "skill_performance",
            {}
        ),

        "difficulty_performance": analysis.get(
            "difficulty_performance",
            {}
        ),

        "strong_skills": analysis.get(
            "strong_skills",
            []
        ),

        "weak_skills": analysis.get(
            "weak_skills",
            []
        ),

        "skills_needing_improvement": analysis.get(
            "skills_needing_improvement",
            []
        ),

        "score_consistency": analysis.get(
            "score_consistency",
            {}
        ),

        "score_distribution": analysis.get(
            "score_distribution",
            {}
        ),

        "question_performance": analysis.get(
            "question_performance",
            []
        )
    }


# ============================================================
# AI / ML FEATURES
# ============================================================

def generate_ai_performance_features(
    analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Convert interview performance into structured features
    that can later be consumed by ML models.
    """

    analysis = analysis or {}

    skill_performance = analysis.get(
        "skill_performance",
        {}
    )

    difficulty_performance = analysis.get(
        "difficulty_performance",
        {}
    )

    skill_scores = {}

    for skill, data in skill_performance.items():

        safe_skill = str(skill).lower().replace(
            " ",
            "_"
        )

        skill_scores[
            safe_skill
        ] = data.get(
            "score",
            0.0
        )

    difficulty_scores = {}

    for difficulty, data in difficulty_performance.items():

        safe_difficulty = str(
            difficulty
        ).lower()

        difficulty_scores[
            safe_difficulty
        ] = data.get(
            "score",
            0.0
        )

    consistency = analysis.get(
        "score_consistency",
        {}
    )

    return {
        "overall_score": analysis.get(
            "overall_score",
            0.0
        ),

        "answered_rate": analysis.get(
            "answered_rate",
            0.0
        ),

        "score_standard_deviation": consistency.get(
            "standard_deviation",
            0.0
        ),

        "minimum_score": consistency.get(
            "minimum_score",
            0.0
        ),

        "maximum_score": consistency.get(
            "maximum_score",
            0.0
        ),

        "skill_scores": skill_scores,

        "difficulty_scores": difficulty_scores
    }


# ============================================================
# INTERVIEW PERFORMANCE ANALYZER
# ============================================================

class InterviewPerformanceAnalyzer:

    def __init__(
        self,
        evaluations: List[Dict[str, Any]],
        total_questions: int = None,
        answered_questions: int = None
    ):

        self.evaluations = evaluations or []

        self.total_questions = (
            total_questions
            if total_questions is not None
            else len(self.evaluations)
        )

        self.answered_questions = (
            answered_questions
            if answered_questions is not None
            else len(self.evaluations)
        )

        self.analysis = None

    # ========================================================
    # ANALYZE
    # ========================================================

    def analyze(self) -> Dict[str, Any]:

        self.analysis = analyze_interview_performance(
            evaluations=self.evaluations,
            total_questions=self.total_questions,
            answered_questions=self.answered_questions
        )

        return self.analysis

    # ========================================================
    # PERFORMANCE PROFILE
    # ========================================================

    def get_performance_profile(self) -> Dict[str, Any]:

        return build_performance_profile(
            evaluations=self.evaluations,
            total_questions=self.total_questions,
            answered_questions=self.answered_questions
        )

    # ========================================================
    # STUDENT REPORT
    # ========================================================

    def get_student_report(self) -> Dict[str, Any]:

        if self.analysis is None:
            self.analyze()

        return create_student_performance_report(
            self.analysis
        )

    # ========================================================
    # RECRUITER REPORT
    # ========================================================

    def get_recruiter_report(self) -> Dict[str, Any]:

        if self.analysis is None:
            self.analyze()

        return create_recruiter_performance_report(
            self.analysis
        )

    # ========================================================
    # AI FEATURES
    # ========================================================

    def get_ai_features(self) -> Dict[str, Any]:

        if self.analysis is None:
            self.analyze()

        return generate_ai_performance_features(
            self.analysis
        )


# ============================================================
# DEMO
# ============================================================

def demo():

    print("=" * 70)
    print("INTERVIEW PERFORMANCE SCORE ANALYZER")
    print("=" * 70)

    evaluations = [

        {
            "question_id": "PY_E_001",
            "skill": "Python",
            "difficulty": "easy",
            "score": 90,
            "performance_level": "EXCELLENT"
        },

        {
            "question_id": "PY_M_001",
            "skill": "Python",
            "difficulty": "medium",
            "score": 82,
            "performance_level": "GOOD"
        },

        {
            "question_id": "SQL_M_001",
            "skill": "SQL",
            "difficulty": "medium",
            "score": 72,
            "performance_level": "GOOD"
        },

        {
            "question_id": "OOP_E_001",
            "skill": "OOP",
            "difficulty": "easy",
            "score": 65,
            "performance_level": "AVERAGE"
        },

        {
            "question_id": "DSA_H_001",
            "skill": "DSA",
            "difficulty": "hard",
            "score": 45,
            "performance_level": "WEAK"
        }
    ]

    analyzer = InterviewPerformanceAnalyzer(
        evaluations=evaluations,
        total_questions=6,
        answered_questions=5
    )

    # --------------------------------------------------------
    # Complete analysis
    # --------------------------------------------------------

    analysis = analyzer.analyze()

    print("\nOVERALL PERFORMANCE")
    print("-" * 70)

    print(
        "Overall score:",
        analysis["overall_score"]
    )

    print(
        "Performance level:",
        analysis["performance_level"]
    )

    print(
        "Total questions:",
        analysis["total_questions"]
    )

    print(
        "Answered questions:",
        analysis["answered_questions"]
    )

    print(
        "Unanswered questions:",
        analysis["unanswered_questions"]
    )

    print(
        "Answered rate:",
        analysis["answered_rate"],
        "%"
    )

    # --------------------------------------------------------
    # Performance profile
    # --------------------------------------------------------

    print("\nPERFORMANCE PROFILE")
    print("-" * 70)

    profile = build_performance_profile(
        evaluations=evaluations,
        total_questions=6,
        answered_questions=5
    )

    print(
        "Overall score:",
        profile["overall_score"]
    )

    print(
        "Performance level:",
        profile["performance_level"]
    )

    print(
        "Strong skills:",
        profile["strong_skills"]
    )

    print(
        "Weak skills:",
        profile["weak_skills"]
    )

    # --------------------------------------------------------
    # Skill performance
    # --------------------------------------------------------

    print("\nSKILL PERFORMANCE")
    print("-" * 70)

    for skill, data in analysis[
        "skill_performance"
    ].items():

        print(
            skill,
            "->",
            data
        )

    # --------------------------------------------------------
    # Difficulty performance
    # --------------------------------------------------------

    print("\nDIFFICULTY PERFORMANCE")
    print("-" * 70)

    for difficulty, data in analysis[
        "difficulty_performance"
    ].items():

        print(
            difficulty,
            "->",
            data
        )

    # --------------------------------------------------------
    # Strong / weak skills
    # --------------------------------------------------------

    print("\nSKILL AREAS")
    print("-" * 70)

    print(
        "Strong skills:",
        analysis["strong_skills"]
    )

    print(
        "Weak skills:",
        analysis["weak_skills"]
    )

    print(
        "Skills needing improvement:",
        analysis[
            "skills_needing_improvement"
        ]
    )

    # --------------------------------------------------------
    # Consistency
    # --------------------------------------------------------

    print("\nSCORE CONSISTENCY")
    print("-" * 70)

    print(
        analysis["score_consistency"]
    )

    # --------------------------------------------------------
    # Student report
    # --------------------------------------------------------

    print("\nSTUDENT REPORT")
    print("-" * 70)

    print(
        analyzer.get_student_report()
    )

    # --------------------------------------------------------
    # Recruiter report
    # --------------------------------------------------------

    print("\nRECRUITER REPORT")
    print("-" * 70)

    print(
        analyzer.get_recruiter_report()
    )

    # --------------------------------------------------------
    # AI features
    # --------------------------------------------------------

    print("\nAI / ML FEATURES")
    print("-" * 70)

    print(
        analyzer.get_ai_features()
    )

    print("\n" + "=" * 70)
    print("PERFORMANCE ANALYSIS COMPLETED")
    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()