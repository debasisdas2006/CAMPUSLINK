"""
CAMPUSLINK - Test Performance Analyzer

Purpose:
    Convert MCQ evaluation results into reusable
    student performance information.

Used by:
    - Student dashboard
    - Recruiter dashboard
    - AI interview preparation
    - Skill analysis
    - Future recommendation system

Important:
    This module analyzes performance.
    It does NOT make hiring decisions.
"""

import sys
from pathlib import Path
from typing import Any, Dict, List


# =========================================================
# PROJECT ROOT
# =========================================================

ROOT_DIR = Path(__file__).resolve().parents[2]

if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))


# =========================================================
# PERFORMANCE LEVELS
# =========================================================

PERFORMANCE_LEVELS = {
    "excellent": 90,
    "very_good": 80,
    "good": 70,
    "needs_improvement": 50,
    "needs_significant_improvement": 0
}


# =========================================================
# PERFORMANCE ANALYZER
# =========================================================

class TestPerformanceAnalyzer:
    """
    Analyze completed MCQ test results.
    """

    def __init__(
        self,
        evaluation: Dict[str, Any]
    ):

        if not evaluation:
            raise ValueError(
                "Evaluation data cannot be empty."
            )

        self.evaluation = evaluation

        self.overall = evaluation.get(
            "overall",
            {}
        )

        self.skill_performance = (
            evaluation.get(
                "skill_performance",
                {}
            )
        )

        self.difficulty_performance = (
            evaluation.get(
                "difficulty_performance",
                {}
            )
        )

        self.question_results = (
            evaluation.get(
                "question_results",
                []
            )
        )

        self.performance_level = (
            evaluation.get(
                "performance_level",
                "Unknown"
            )
        )

    # =====================================================
    # OVERALL PERFORMANCE
    # =====================================================

    def get_overall_performance(
        self
    ) -> Dict[str, Any]:
        """
        Return overall performance.
        """

        return {
            "total_questions": self.overall.get(
                "total_questions",
                0
            ),

            "answered": self.overall.get(
                "answered",
                0
            ),

            "correct": self.overall.get(
                "correct",
                0
            ),

            "incorrect": self.overall.get(
                "incorrect",
                0
            ),

            "unanswered": self.overall.get(
                "unanswered",
                0
            ),

            "performance_percentage": self.overall.get(
                "performance_percentage",
                0.0
            ),

            "performance_level": self.performance_level
        }

    # =====================================================
    # SKILL PERFORMANCE
    # =====================================================

    def get_skill_performance(
        self
    ) -> Dict[str, Dict[str, Any]]:
        """
        Return performance for every skill.
        """

        return self.skill_performance

    # =====================================================
    # STRONG SKILLS
    # =====================================================

    def get_strong_skills(
        self,
        threshold: float = 70.0
    ) -> List[str]:
        """
        Return skills at or above the supplied threshold.
        """

        strong_skills = []

        for skill, data in (
            self.skill_performance.items()
        ):

            percentage = data.get(
                "performance_percentage",
                0.0
            )

            if percentage >= threshold:
                strong_skills.append(skill)

        return strong_skills

    # =====================================================
    # WEAK SKILLS
    # =====================================================

    def get_weak_skills(
        self,
        threshold: float = 50.0
    ) -> List[str]:
        """
        Return skills below the supplied threshold.
        """

        weak_skills = []

        for skill, data in (
            self.skill_performance.items()
        ):

            percentage = data.get(
                "performance_percentage",
                0.0
            )

            if percentage < threshold:
                weak_skills.append(skill)

        return weak_skills

    # =====================================================
    # SKILLS NEEDING IMPROVEMENT
    # =====================================================

    def get_skills_needing_improvement(
        self
    ) -> List[str]:
        """
        Return skills below 70%.

        This is an analytical category, not a hiring decision.
        """

        return self.get_weak_or_improvable_skills(
            threshold=70.0
        )

    # =====================================================
    # GENERIC SKILL FILTER
    # =====================================================

    def get_weak_or_improvable_skills(
        self,
        threshold: float = 70.0
    ) -> List[str]:

        skills = []

        for skill, data in (
            self.skill_performance.items()
        ):

            percentage = data.get(
                "performance_percentage",
                0.0
            )

            if percentage < threshold:
                skills.append(skill)

        return skills

    # =====================================================
    # DIFFICULTY PERFORMANCE
    # =====================================================

    def get_difficulty_performance(
        self
    ) -> Dict[str, Dict[str, Any]]:
        """
        Return performance by difficulty.
        """

        return self.difficulty_performance

    # =====================================================
    # HARD QUESTION PERFORMANCE
    # =====================================================

    def get_hard_question_performance(
        self
    ) -> Dict[str, Any]:
        """
        Return performance specifically on hard questions.
        """

        return self.difficulty_performance.get(
            "hard",
            {
                "total_questions": 0,
                "answered": 0,
                "correct": 0,
                "incorrect": 0,
                "unanswered": 0,
                "performance_percentage": 0.0
            }
        )

    # =====================================================
    # ANSWERED RATE
    # =====================================================

    def get_answered_rate(
        self
    ) -> float:
        """
        Percentage of questions attempted.
        """

        total = self.overall.get(
            "total_questions",
            0
        )

        answered = self.overall.get(
            "answered",
            0
        )

        if total == 0:
            return 0.0

        return round(
            (answered / total) * 100,
            2
        )

    # =====================================================
    # ACCURACY
    # =====================================================

    def get_answer_accuracy(
        self
    ) -> float:
        """
        Accuracy among answered questions.

        Formula:

            correct / answered * 100
        """

        answered = self.overall.get(
            "answered",
            0
        )

        correct = self.overall.get(
            "correct",
            0
        )

        if answered == 0:
            return 0.0

        return round(
            (correct / answered) * 100,
            2
        )

    # =====================================================
    # UNANSWERED RATE
    # =====================================================

    def get_unanswered_rate(
        self
    ) -> float:

        total = self.overall.get(
            "total_questions",
            0
        )

        unanswered = self.overall.get(
            "unanswered",
            0
        )

        if total == 0:
            return 0.0

        return round(
            (unanswered / total) * 100,
            2
        )

    # =====================================================
    # PERFORMANCE SUMMARY
    # =====================================================

    def get_summary(
        self
    ) -> Dict[str, Any]:
        """
        Create a compact performance summary.
        """

        return {
            "performance_percentage":
                self.overall.get(
                    "performance_percentage",
                    0.0
                ),

            "performance_level":
                self.performance_level,

            "answered_rate":
                self.get_answered_rate(),

            "accuracy":
                self.get_answer_accuracy(),

            "unanswered_rate":
                self.get_unanswered_rate(),

            "strong_skills":
                self.get_strong_skills(),

            "skills_needing_improvement":
                self.get_skills_needing_improvement(),

            "difficulty_performance":
                self.difficulty_performance
        }

    # =====================================================
    # STUDENT PERFORMANCE REPORT
    # =====================================================

    def create_student_report(
        self
    ) -> Dict[str, Any]:
        """
        Student-facing performance report.

        Does not expose individual correct answers.
        """

        return {
            "overall": self.get_overall_performance(),

            "summary": self.get_summary(),

            "skill_performance":
                self.get_skill_performance(),

            "difficulty_performance":
                self.get_difficulty_performance()
        }

    # =====================================================
    # RECRUITER PERFORMANCE REPORT
    # =====================================================

    def create_recruiter_report(
        self
    ) -> Dict[str, Any]:
        """
        Recruiter/interviewer report.

        Includes question-level evaluation.
        """

        return {
            "overall": self.get_overall_performance(),

            "summary": self.get_summary(),

            "skill_performance":
                self.get_skill_performance(),

            "difficulty_performance":
                self.get_difficulty_performance(),

            "question_results":
                self.question_results
        }

    # =====================================================
    # PERFORMANCE TREND
    # =====================================================

    @staticmethod
    def calculate_trend(
        previous_percentage: float,
        current_percentage: float
    ) -> Dict[str, Any]:
        """
        Compare two test performances.
        """

        change = round(
            current_percentage
            - previous_percentage,
            2
        )

        if change > 0:
            trend = "improving"

        elif change < 0:
            trend = "declining"

        else:
            trend = "stable"

        return {
            "previous_percentage":
                previous_percentage,

            "current_percentage":
                current_percentage,

            "change":
                change,

            "trend":
                trend
        }

    # =====================================================
    # PERFORMANCE SCORE FOR FUTURE AI MODULES
    # =====================================================

    def get_ai_performance_features(
        self
    ) -> Dict[str, Any]:
        """
        Return structured performance features.

        These can later be consumed by:
            - Recommendation engine
            - Interview difficulty adaptation
            - Skill-gap analysis
            - ML models

        This does not itself make a hiring decision.
        """

        return {
            "overall_score":
                self.overall.get(
                    "performance_percentage",
                    0.0
                ),

            "accuracy":
                self.get_answer_accuracy(),

            "answered_rate":
                self.get_answered_rate(),

            "unanswered_rate":
                self.get_unanswered_rate(),

            "skill_scores": {
                skill: data.get(
                    "performance_percentage",
                    0.0
                )
                for skill, data
                in self.skill_performance.items()
            },

            "difficulty_scores": {
                difficulty: data.get(
                    "performance_percentage",
                    0.0
                )
                for difficulty, data
                in self.difficulty_performance.items()
            }
        }


# =========================================================
# DEMO
# =========================================================

if __name__ == "__main__":

    print("\n")
    print("=" * 70)
    print("CAMPUSLINK - TEST PERFORMANCE ANALYZER")
    print("=" * 70)

    # -----------------------------------------------------
    # SAMPLE EVALUATION
    # -----------------------------------------------------

    sample_evaluation = {

        "overall": {
            "total_questions": 10,
            "answered": 9,
            "correct": 7,
            "incorrect": 2,
            "unanswered": 1,
            "performance_percentage": 70.0
        },

        "performance_level": "Good",

        "skill_performance": {

            "Python": {
                "total_questions": 3,
                "answered": 3,
                "correct": 3,
                "incorrect": 0,
                "unanswered": 0,
                "performance_percentage": 100.0
            },

            "SQL": {
                "total_questions": 3,
                "answered": 3,
                "correct": 2,
                "incorrect": 1,
                "unanswered": 0,
                "performance_percentage": 66.67
            },

            "DSA": {
                "total_questions": 2,
                "answered": 1,
                "correct": 0,
                "incorrect": 1,
                "unanswered": 1,
                "performance_percentage": 0.0
            },

            "OOP": {
                "total_questions": 2,
                "answered": 2,
                "correct": 2,
                "incorrect": 0,
                "unanswered": 0,
                "performance_percentage": 100.0
            }
        },

        "difficulty_performance": {

            "easy": {
                "total_questions": 4,
                "answered": 4,
                "correct": 4,
                "incorrect": 0,
                "unanswered": 0,
                "performance_percentage": 100.0
            },

            "medium": {
                "total_questions": 4,
                "answered": 4,
                "correct": 2,
                "incorrect": 2,
                "unanswered": 0,
                "performance_percentage": 50.0
            },

            "hard": {
                "total_questions": 2,
                "answered": 1,
                "correct": 1,
                "incorrect": 0,
                "unanswered": 1,
                "performance_percentage": 50.0
            }
        },

        "question_results": [
            {
                "question_id": "PY001",
                "skill": "Python",
                "difficulty": "easy",
                "student_answer": "A",
                "correct_answer": "A",
                "is_answered": True,
                "is_correct": True,
                "explanation": "Demo explanation"
            }
        ]
    }

    # -----------------------------------------------------
    # CREATE ANALYZER
    # -----------------------------------------------------

    analyzer = TestPerformanceAnalyzer(
        sample_evaluation
    )

    # -----------------------------------------------------
    # OVERALL
    # -----------------------------------------------------

    print("\nOVERALL PERFORMANCE")

    print(
        analyzer.get_overall_performance()
    )

    # -----------------------------------------------------
    # SKILLS
    # -----------------------------------------------------

    print("\nSKILL PERFORMANCE")

    print(
        analyzer.get_skill_performance()
    )

    # -----------------------------------------------------
    # STRONG SKILLS
    # -----------------------------------------------------

    print("\nSTRONG SKILLS")

    print(
        analyzer.get_strong_skills()
    )

    # -----------------------------------------------------
    # SKILLS NEEDING IMPROVEMENT
    # -----------------------------------------------------

    print("\nSKILLS NEEDING IMPROVEMENT")

    print(
        analyzer.get_skills_needing_improvement()
    )

    # -----------------------------------------------------
    # DIFFICULTY
    # -----------------------------------------------------

    print("\nDIFFICULTY PERFORMANCE")

    print(
        analyzer.get_difficulty_performance()
    )

    # -----------------------------------------------------
    # ACCURACY
    # -----------------------------------------------------

    print("\nANSWER ACCURACY")

    print(
        analyzer.get_answer_accuracy()
    )

    # -----------------------------------------------------
    # ANSWERED RATE
    # -----------------------------------------------------

    print("\nANSWERED RATE")

    print(
        analyzer.get_answered_rate()
    )

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    print("\nSUMMARY")

    print(
        analyzer.get_summary()
    )

    # -----------------------------------------------------
    # AI FEATURES
    # -----------------------------------------------------

    print("\nAI PERFORMANCE FEATURES")

    print(
        analyzer.get_ai_performance_features()
    )

    # -----------------------------------------------------
    # TREND
    # -----------------------------------------------------

    print("\nPERFORMANCE TREND")

    print(
        analyzer.calculate_trend(
            previous_percentage=62.5,
            current_percentage=70.0
        )
    )

    # -----------------------------------------------------
    # STUDENT REPORT
    # -----------------------------------------------------

    print("\nSTUDENT REPORT")

    print(
        analyzer.create_student_report()
    )

    # -----------------------------------------------------
    # RECRUITER REPORT
    # -----------------------------------------------------

    print("\nRECRUITER REPORT")

    print(
        analyzer.create_recruiter_report()
    )

    print("\n")
    print("=" * 70)
    print("PERFORMANCE ANALYZER COMPLETE")
    print("=" * 70)