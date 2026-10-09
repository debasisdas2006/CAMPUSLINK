from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


# ============================================================
# INTERVIEW MODULES
# ============================================================

from src.interview.question_generator import (
    load_question_bank,
    generate_interview_for_job,
)

from src.interview.question_selector import (
    select_balanced_questions,
    select_next_adaptive_question,
    identify_weak_skills,
)

from src.interview.interview_manager import (
    InterviewSession,
)

from src.interview.answer_evaluator import (
    load_rubrics,
    evaluate_interview_answers,
)

from src.interview.performance_score import (
    build_performance_profile,
)

from src.interview.feedback_generator import (
    generate_feedback,
)

from src.interview.final_evaluation import (
    generate_final_evaluation,
)

from src.matching.eligibility import (
    calculate_eligibility,
)

from src.matching.job_matching import (
    match_student_to_job,
)


# ============================================================
# DATA PATHS
# ============================================================

DATA_DIR = BASE_DIR / "data"

JOB_FILE = (
    DATA_DIR
    / "jobs"
    / "jobs.json"
)

STUDENT_FILE = (
    DATA_DIR
    / "students"
    / "students.json"
)

RUBRIC_FILE = (
    DATA_DIR
    / "interview_questions"
    / "interview_rubrics.json"
)


# ============================================================
# SESSION STATUS
# ============================================================

SESSION_CREATED = "CREATED"
SESSION_IN_PROGRESS = "IN_PROGRESS"
SESSION_ACTIVE = "ACTIVE"
SESSION_COMPLETED = "COMPLETED"
SESSION_CANCELLED = "CANCELLED"


# ============================================================
# JSON HELPERS
# ============================================================

def load_json(
    path: Path,
) -> Any:
    """
    Load JSON data from a file.
    """

    if not path.exists():
        raise FileNotFoundError(
            f"Required file not found: {path}"
        )

    with path.open(
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def find_by_id(
    records: List[Dict[str, Any]],
    key: str,
    value: str,
) -> Optional[Dict[str, Any]]:
    """
    Find a record by ID.
    """

    for record in records:
        if record.get(key) == value:
            return record

    return None


# ============================================================
# EVALUATION DATA NORMALIZATION
# ============================================================

def extract_evaluation_list(
    answer_evaluation: Any,
) -> List[Dict[str, Any]]:
    """
    Convert answer_evaluation into the list expected by
    performance_score.py.

    The answer evaluator may return either:

        [
            {...},
            {...}
        ]

    OR:

        {
            "evaluations": [
                {...},
                {...}
            ]
        }

    OR another wrapper containing the evaluation list.

    performance_score.py expects the actual list of
    evaluation dictionaries.

    This function prevents a dictionary from being iterated
    as strings such as:

        "evaluations"
        "summary"
        "overall_score"

    which caused:

        AttributeError:
        'str' object has no attribute 'get'
    """

    # --------------------------------------------------------
    # Case 1:
    # Already a list
    # --------------------------------------------------------

    if isinstance(
        answer_evaluation,
        list,
    ):

        evaluations = answer_evaluation

    # --------------------------------------------------------
    # Case 2:
    # Dictionary wrapper
    # --------------------------------------------------------

    elif isinstance(
        answer_evaluation,
        dict,
    ):

        possible_keys = [
            "evaluations",
            "answer_evaluations",
            "results",
            "answers",
            "details",
        ]

        evaluations = None

        for key in possible_keys:

            value = answer_evaluation.get(
                key
            )

            if isinstance(
                value,
                list,
            ):

                evaluations = value
                break

        if evaluations is None:

            # ------------------------------------------------
            # Sometimes the dictionary itself may contain
            # evaluation records keyed by question ID.
            # ------------------------------------------------

            values = list(
                answer_evaluation.values()
            )

            if values and all(
                isinstance(
                    item,
                    dict,
                )
                for item in values
            ):

                evaluations = values

            else:

                evaluations = []

    else:

        evaluations = []

    # --------------------------------------------------------
    # Final validation
    # --------------------------------------------------------

    cleaned = []

    for index, evaluation in enumerate(
        evaluations
    ):

        if not isinstance(
            evaluation,
            dict,
        ):

            raise ValueError(
                "Invalid answer evaluation at "
                f"index {index}: expected dictionary, "
                f"got {type(evaluation).__name__}."
            )

        cleaned.append(
            evaluation
        )

    return cleaned


def normalize_answer_evaluation(
    answer_evaluation: Any,
) -> Dict[str, Any]:
    """
    Normalize the complete answer-evaluation result while
    preserving useful metadata.

    The performance engine receives the actual evaluation
    list separately.
    """

    evaluations = extract_evaluation_list(
        answer_evaluation
    )

    if isinstance(
        answer_evaluation,
        dict,
    ):

        normalized = dict(
            answer_evaluation
        )

    else:

        normalized = {}

    normalized[
        "evaluations"
    ] = evaluations

    return normalized


# ============================================================
# PERFORMANCE PROFILE COMPATIBILITY
# ============================================================

def build_safe_performance_profile(
    answer_evaluation: Any,
    responses: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Build the performance profile using the actual evaluation
    list expected by performance_score.py.

    Important:

        answer_evaluation
            ↓
        extract_evaluation_list()
            ↓
        evaluations
            ↓
        build_performance_profile(
            evaluations,
            responses
        )

    This avoids passing a dictionary whose iteration produces
    string keys.
    """

    evaluations = extract_evaluation_list(
        answer_evaluation
    )

    if not isinstance(
        evaluations,
        list,
    ):
        evaluations = []

    # --------------------------------------------------------
    # Validate evaluation objects
    # --------------------------------------------------------

    for index, evaluation in enumerate(
        evaluations
    ):

        if not isinstance(
            evaluation,
            dict,
        ):

            raise ValueError(
                "Performance evaluation at "
                f"index {index} is not a dictionary."
            )

    # --------------------------------------------------------
    # Call the project's performance engine
    #
    # Current performance_score.py API:
    #
    #     build_performance_profile(
    #         evaluations,
    #         responses
    #     )
    # --------------------------------------------------------

    try:

        performance_profile = (
            build_performance_profile(
                evaluations,
                responses,
            )
        )

    except AttributeError as error:

        raise RuntimeError(
            "Performance score received an invalid "
            "evaluation structure. "
            "Expected a list of evaluation dictionaries."
        ) from error

    if not isinstance(
        performance_profile,
        dict,
    ):

        raise ValueError(
            "build_performance_profile() must return "
            "a dictionary."
        )

    return performance_profile


# ============================================================
# INTERVIEW SERVICE
# ============================================================

class InterviewService:
    """
    Main CAMPUSLINK AI Interview Service.

    Pipeline:

        Job
          ↓
        Student
          ↓
        Question Generation
          ↓
        Question Selection
          ↓
        Interview Session
          ↓
        Answer Recording
          ↓
        Answer Evaluation
          ↓
        Evaluation Normalization
          ↓
        Performance Score
          ↓
        Feedback
          ↓
        Final Evaluation
    """

    def __init__(
        self,
        rubric_file: Optional[Path] = None,
    ):
        """
        Initialize the interview service.
        """

        # ----------------------------------------------------
        # Rubric path
        # ----------------------------------------------------

        self.rubric_file = (
            rubric_file
            if rubric_file is not None
            else RUBRIC_FILE
        )

        if not isinstance(
            self.rubric_file,
            Path,
        ):
            self.rubric_file = Path(
                self.rubric_file
            )

        # ----------------------------------------------------
        # Question bank
        # ----------------------------------------------------

        self.question_bank = (
            load_question_bank()
        )

        if not isinstance(
            self.question_bank,
            list,
        ):
            raise ValueError(
                "Interview question bank must be a list."
            )

        if not self.question_bank:
            raise ValueError(
                "Interview question bank is empty."
            )

        # ----------------------------------------------------
        # Rubrics
        # ----------------------------------------------------

        self.rubrics = load_rubrics(
            self.rubric_file
        )

        # ----------------------------------------------------
        # Active sessions
        # ----------------------------------------------------

        self.sessions: Dict[
            str,
            InterviewSession,
        ] = {}

        # ----------------------------------------------------
        # Completed results
        # ----------------------------------------------------

        self.completed_results: Dict[
            str,
            Dict[str, Any],
        ] = {}

        # ----------------------------------------------------
        # Adaptive state
        # ----------------------------------------------------

        self.adaptive_state: Dict[
            str,
            Dict[str, Any],
        ] = {}

    # ========================================================
    # CREATE INTERVIEW
    # ========================================================

    def create_interview(
        self,
        job: Dict[str, Any],
        student: Dict[str, Any],
        question_count: int = 10,
        self_assessment_scores: Optional[
            Dict[str, float]
        ] = None,
        seed: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Create a new interview session.
        """

        if not isinstance(
            job,
            dict,
        ):
            raise TypeError(
                "job must be a dictionary."
            )

        if not isinstance(
            student,
            dict,
        ):
            raise TypeError(
                "student must be a dictionary."
            )

        if not job.get("job_id"):
            raise ValueError(
                "job_id is required."
            )

        if not student.get("student_id"):
            raise ValueError(
                "student_id is required."
            )

        if question_count <= 0:
            raise ValueError(
                "question_count must be greater than 0."
            )

        # ----------------------------------------------------
        # Generate candidate questions
        # ----------------------------------------------------

        candidate_count = max(
            question_count * 2,
            question_count,
        )

        candidate_questions = (
            generate_interview_for_job(
                job=job,
                student=student,
                question_count=candidate_count,
                seed=seed,
                question_bank=self.question_bank,
            )
        )

        if not candidate_questions:
            raise ValueError(
                "No interview questions could be generated "
                "for this job and student."
            )

        # ----------------------------------------------------
        # Self-assessment profile
        # ----------------------------------------------------

        performance_profile = {
            "student_id":
                student.get("student_id"),

            "skill_performance": {},
        }

        if self_assessment_scores:

            for skill, score in (
                self_assessment_scores.items()
            ):

                try:
                    numeric_score = float(
                        score
                    )

                except (
                    TypeError,
                    ValueError,
                ):
                    numeric_score = 0.0

                numeric_score = max(
                    0.0,
                    min(
                        numeric_score,
                        100.0,
                    ),
                )

                performance_profile[
                    "skill_performance"
                ][skill] = {
                    "score_percentage":
                        numeric_score,
                }

        # ----------------------------------------------------
        # Weak skills
        # ----------------------------------------------------

        weak_skills = identify_weak_skills(
            performance_profile,
            threshold=60.0,
        )

        # ----------------------------------------------------
        # Job skills
        # ----------------------------------------------------

        job_skills = []

        job_skills.extend(
            job.get(
                "required_skills",
                [],
            )
        )

        job_skills.extend(
            job.get(
                "required_languages",
                [],
            )
        )

        job_skills = list(
            dict.fromkeys(
                job_skills
            )
        )

        # ----------------------------------------------------
        # Balanced question selection
        # ----------------------------------------------------

        selected_questions = (
            select_balanced_questions(
                questions=candidate_questions,
                question_count=question_count,
                job_skills=job_skills,
                weak_skills=weak_skills,
                seed=seed,
            )
        )

        if not selected_questions:
            raise ValueError(
                "No interview questions were selected."
            )

        if len(selected_questions) < question_count:

            raise ValueError(
                "The question bank does not contain enough "
                "unique questions for the requested interview."
            )

        # ----------------------------------------------------
        # Interview session
        # ----------------------------------------------------

        session = InterviewSession(
            student_id=student.get(
                "student_id"
            ),
            job_id=job.get(
                "job_id"
            ),
            questions=selected_questions,
        )

        # ----------------------------------------------------
        # Actual ID
        # ----------------------------------------------------

        interview_id = (
            session.interview_id
        )

        if not interview_id:

            raise ValueError(
                "Interview ID was not generated."
            )

        # ----------------------------------------------------
        # Store
        # ----------------------------------------------------

        self.sessions[
            interview_id
        ] = session

        # ----------------------------------------------------
        # Adaptive state
        # ----------------------------------------------------

        self.adaptive_state[
            interview_id
        ] = {

            "asked_question_ids": [],

            "current_difficulty":
                selected_questions[0].get(
                    "difficulty",
                    "medium",
                ),

            "last_score":
                None,

            "job_skills":
                job_skills,

            "weak_skills":
                weak_skills,

            "candidate_questions":
                candidate_questions,
        }

        # ----------------------------------------------------
        # Student-safe questions
        # ----------------------------------------------------

        student_questions = [
            self._student_safe_question(
                question
            )
            for question in selected_questions
        ]

        return {

            "interview_id":
                interview_id,

            "session_id":
                interview_id,

            "student_id":
                student.get(
                    "student_id"
                ),

            "job_id":
                job.get(
                    "job_id"
                ),

            "job_title":
                job.get(
                    "job_title"
                ),

            "status":
                SESSION_CREATED,

            "question_count":
                len(student_questions),

            "weak_skills":
                weak_skills,

            "questions":
                student_questions,
        }

    # ========================================================
    # START INTERVIEW
    # ========================================================

    def start_interview(
        self,
        interview_id: str,
    ) -> Dict[str, Any]:

        session = self._require_session(
            interview_id
        )

        question = session.start()

        self._record_question_as_asked(
            interview_id,
            question,
        )

        return {

            "interview_id":
                interview_id,

            "session_id":
                interview_id,

            "status":
                session.status,

            "current_question":
                self._student_safe_question(
                    question
                ),
        }

    # ========================================================
    # CURRENT QUESTION
    # ========================================================

    def get_current_question(
        self,
        interview_id: str,
    ) -> Optional[Dict[str, Any]]:

        session = self._require_session(
            interview_id
        )

        question = (
            session.get_current_question()
        )

        if question is None:
            return None

        self._record_question_as_asked(
            interview_id,
            question,
        )

        return self._student_safe_question(
            question
        )

    # ========================================================
    # SUBMIT ANSWER
    # ========================================================

    def submit_answer(
        self,
        interview_id: str,
        answer: str,
        metadata: Optional[
            Dict[str, Any]
        ] = None,
    ) -> Dict[str, Any]:

        session = self._require_session(
            interview_id
        )

        current_question = (
            session.get_current_question()
        )

        if current_question is None:

            raise RuntimeError(
                "There is no current question to answer."
            )

        current_question_id = (
            current_question.get(
                "question_id"
            )
        )

        response = session.submit_answer(
            answer=answer,
            metadata=metadata,
        )

        self._record_question_id(
            interview_id,
            current_question_id,
        )

        next_question = (
            session.get_current_question()
        )

        if next_question is not None:

            self._record_question_as_asked(
                interview_id,
                next_question,
            )

        completed = (
            session.status
            == SESSION_COMPLETED
        )

        return {

            "interview_id":
                interview_id,

            "session_id":
                interview_id,

            "status":
                session.status,

            "response_recorded":
                True,

            "response":
                response,

            "next_question":
                self._student_safe_question(
                    next_question
                ),

            "interview_completed":
                completed,
        }

    # ========================================================
    # SKIP QUESTION
    # ========================================================

    def skip_question(
        self,
        interview_id: str,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:

        session = self._require_session(
            interview_id
        )

        current_question = (
            session.get_current_question()
        )

        if current_question is None:

            raise RuntimeError(
                "There is no current question to skip."
            )

        question_id = (
            current_question.get(
                "question_id"
            )
        )

        response = session.skip_question(
            reason=reason
        )

        self._record_question_id(
            interview_id,
            question_id,
        )

        next_question = (
            session.get_current_question()
        )

        if next_question is not None:

            self._record_question_as_asked(
                interview_id,
                next_question,
            )

        completed = (
            session.status
            == SESSION_COMPLETED
        )

        return {

            "interview_id":
                interview_id,

            "session_id":
                interview_id,

            "status":
                session.status,

            "response":
                response,

            "question_skipped":
                True,

            "next_question":
                self._student_safe_question(
                    next_question
                ),

            "interview_completed":
                completed,
        }

    # ========================================================
    # COMPLETE INTERVIEW
    # ========================================================

    def complete_interview(
        self,
        interview_id: str,
        job: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Complete and evaluate interview.

        Data pipeline:

            session_result
                    ↓
            responses
                    ↓
            answer evaluator
                    ↓
            evaluation list
                    ↓
            performance score
                    ↓
            feedback
                    ↓
            final evaluation
        """

        session = self._require_session(
            interview_id
        )

        if not isinstance(
            job,
            dict,
        ):
            raise TypeError(
                "job must be a dictionary."
            )

        if not job.get("job_id"):
            raise ValueError(
                "job_id is required."
            )

        # ====================================================
        # SESSION RESULT
        # ====================================================

        if session.status in {
            SESSION_IN_PROGRESS,
            SESSION_ACTIVE,
        }:

            session_result = (
                session.complete()
            )

        elif session.status in {
            SESSION_COMPLETED,
            SESSION_CANCELLED,
        }:

            session_result = (
                session.get_session_result()
            )

        else:

            raise RuntimeError(
                "Interview must be IN_PROGRESS, ACTIVE, COMPLETED, "
                "or CANCELLED before evaluation."
            )

        if not isinstance(
            session_result,
            dict,
        ):

            raise ValueError(
                "Interview session returned an invalid result."
            )

        # ====================================================
        # RESPONSES
        # ====================================================

        responses = (
            session_result.get(
                "responses",
                [],
            )
        )

        if not isinstance(
            responses,
            list,
        ):

            raise ValueError(
                "session_result['responses'] must be a list."
            )

        for index, response in enumerate(
            responses
        ):

            if not isinstance(
                response,
                dict,
            ):

                raise ValueError(
                    "Invalid interview response at "
                    f"index {index}: expected dictionary, "
                    f"got {type(response).__name__}."
                )

        # ====================================================
        # ANSWER EVALUATION
        # ====================================================

        print()
        print(
            ">>> STEP 1: EVALUATING ANSWERS <<<"
        )

        raw_answer_evaluation = (
            evaluate_interview_answers(
                responses,
                self.rubrics,
            )
        )

        # ----------------------------------------------------
        # Normalize evaluator output
        # ----------------------------------------------------

        answer_evaluation = (
            normalize_answer_evaluation(
                raw_answer_evaluation
            )
        )

        evaluation_list = (
            answer_evaluation.get(
                "evaluations",
                [],
            )
        )

        print(
            "Evaluated answers:",
            len(evaluation_list),
        )

        # ====================================================
        # PERFORMANCE PROFILE
        # ====================================================

        print()
        print(
            ">>> STEP 2: BUILDING PERFORMANCE PROFILE <<<"
        )

        performance_profile = (
            build_safe_performance_profile(
                answer_evaluation,
                responses,
            )
        )

        # ====================================================
        # FEEDBACK
        # ====================================================

        print()
        print(
            ">>> STEP 3: GENERATING FEEDBACK <<<"
        )

        feedback = generate_feedback(
            performance_profile
        )

        # ====================================================
        # INTERVIEW CUTOFF
        # ====================================================

        try:

            interview_cutoff = float(
                job.get(
                    "interview_cutoff",
                    60.0,
                )
            )

        except (
            TypeError,
            ValueError,
        ):

            interview_cutoff = 60.0

        interview_cutoff = max(
            0.0,
            min(
                interview_cutoff,
                100.0,
            ),
        )

        # ====================================================
        # FINAL EVALUATION
        # ====================================================

        print()
        print(
            ">>> STEP 4: FINAL EVALUATION <<<"
        )

        # ====================================================
        # ELIGIBILITY + JOB MATCH
        # ====================================================

        student_id = session_result.get(
            "student_id"
        )

        students = load_json(
            STUDENT_FILE
        )

        if not isinstance(
            students,
            list,
        ):
            raise ValueError(
                "students.json must contain a list."
            )

        student = find_by_id(
            students,
            "student_id",
            student_id,
        )

        if student is None:
            raise ValueError(
                f"Student not found for interview: {student_id}"
            )

        eligibility_result = calculate_eligibility(
            student=student,
            job=job,
        )

        job_match_result = match_student_to_job(
            student=student,
            job=job,
        )

        # ====================================================
        # FINAL EVALUATION
        # ====================================================

        print()
        print(
            ">>> STEP 4: FINAL EVALUATION <<<"
        )

        final_evaluation = (
            generate_final_evaluation(
                eligibility_result=eligibility_result,
                job_match_result=job_match_result,
                interview_result=performance_profile,
                weights={
                    "eligibility": 40,
                    "job_match": 30,
                    "interview": 30,
                },
                eligibility_cutoff=float(
                    job.get(
                        "eligibility_cutoff",
                        70.0,
                    )
                    or 70.0
                ),
                interview_cutoff=interview_cutoff,
                final_cutoff=float(
                    job.get(
                        "final_evaluation_cutoff",
                        70.0,
                    )
                    or 70.0
                ),
            )
        )

        # Keep generated interview feedback available to the
        # backend/recruiter alongside the structured final result.
        final_evaluation[
            "interview_feedback"
        ] = feedback

        final_evaluation[
            "eligibility_result"
        ] = eligibility_result

        final_evaluation[
            "job_match_result"
        ] = job_match_result

        # ====================================================
        # COMPLETE RESULT
        # ====================================================

        complete_result = {

            "interview_id":
                interview_id,

            "session_id":
                interview_id,

            "student_id":
                session_result.get(
                    "student_id"
                ),

            "job_id":
                session_result.get(
                    "job_id"
                ),

            "session":
                session_result,

            "answer_evaluation":
                answer_evaluation,

            "performance":
                performance_profile,

            "feedback":
                feedback,

            "final_evaluation":
                final_evaluation,
        }

        # ====================================================
        # STORE
        # ====================================================

        self.completed_results[
            interview_id
        ] = complete_result

        return complete_result

    # ========================================================
    # GET SESSION RESULT
    # ========================================================

    def get_session_result(
        self,
        interview_id: str,
    ) -> Dict[str, Any]:

        session = self._require_session(
            interview_id
        )

        return session.get_session_result()

    # ========================================================
    # GET FINAL RESULT
    # ========================================================

    def get_final_result(
        self,
        interview_id: str,
    ) -> Dict[str, Any]:

        if (
            interview_id
            not in self.completed_results
        ):

            raise ValueError(
                "Interview has not been evaluated yet."
            )

        return self.completed_results[
            interview_id
        ]

    # ========================================================
    # STUDENT RESULT
    # ========================================================

    def get_student_result(
        self,
        interview_id: str,
    ) -> Dict[str, Any]:

        result = self.get_final_result(
            interview_id
        )

        performance = result.get(
            "performance",
            {},
        )

        feedback = result.get(
            "feedback",
            {},
        )

        final_evaluation = result.get(
            "final_evaluation",
            {},
        )

        return {

            "interview_id":
                interview_id,

            "session_id":
                interview_id,

            "student_id":
                result.get(
                    "student_id"
                ),

            "job_id":
                result.get(
                    "job_id"
                ),

            "overall_score":
                performance.get(
                    "overall_score",
                    0.0,
                ),

            "performance_level":
                performance.get(
                    "performance_level",
                    "NO_DATA",
                ),

            "strengths":
                performance.get(
                    "strengths",
                    [],
                ),

            "improvement_areas":
                performance.get(
                    "improvement_areas",
                    [],
                ),

            "feedback":
                feedback,

            "interview_result":
                final_evaluation.get(
                    "interview_result"
                ),

            "interview_score":
                final_evaluation.get(
                    "interview_score",
                    0.0,
                ),

            "interview_cutoff":
                final_evaluation.get(
                    "interview_cutoff",
                    60.0,
                ),

            "reason":
                final_evaluation.get(
                    "reason",
                    "",
                ),
        }

    # ========================================================
    # RECRUITER RESULT
    # ========================================================

    def get_recruiter_result(
        self,
        interview_id: str,
    ) -> Dict[str, Any]:

        result = self.get_final_result(
            interview_id
        )

        return {

            "interview_id":
                interview_id,

            "session_id":
                interview_id,

            "student_id":
                result.get(
                    "student_id"
                ),

            "job_id":
                result.get(
                    "job_id"
                ),

            "answer_evaluation":
                result.get(
                    "answer_evaluation",
                    {},
                ),

            "performance":
                result.get(
                    "performance",
                    {},
                ),

            "feedback":
                result.get(
                    "feedback",
                    {},
                ),

            "final_evaluation":
                result.get(
                    "final_evaluation",
                    {},
                ),
        }

    # ========================================================
    # ADAPTIVE QUESTION
    # ========================================================

    def get_adaptive_question(
        self,
        interview_id: str,
        previous_score: float,
    ) -> Optional[Dict[str, Any]]:

        if interview_id not in self.sessions:

            raise ValueError(
                f"Interview session not found: "
                f"{interview_id}"
            )

        state = self.adaptive_state.get(
            interview_id
        )

        if state is None:

            raise ValueError(
                f"Adaptive state not found: "
                f"{interview_id}"
            )

        try:

            score = float(
                previous_score
            )

        except (
            TypeError,
            ValueError,
        ):

            score = 0.0

        question = (
            select_next_adaptive_question(
                questions=state[
                    "candidate_questions"
                ],

                current_difficulty=state.get(
                    "current_difficulty",
                    "medium",
                ),

                previous_score=score,

                asked_question_ids=state.get(
                    "asked_question_ids",
                    [],
                ),

                preferred_skills=(
                    state.get(
                        "weak_skills",
                        [],
                    )
                    or state.get(
                        "job_skills",
                        [],
                    )
                ),

                seed=None,
            )
        )

        if question is None:
            return None

        question_id = question.get(
            "question_id"
        )

        if question_id:

            self._record_question_id(
                interview_id,
                question_id,
            )

        state[
            "current_difficulty"
        ] = question.get(
            "difficulty",
            state.get(
                "current_difficulty",
                "medium",
            ),
        )

        state[
            "last_score"
        ] = score

        return self._student_safe_question(
            question
        )

    # ========================================================
    # CANCEL INTERVIEW
    # ========================================================

    def cancel_interview(
        self,
        interview_id: str,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:

        session = self._require_session(
            interview_id
        )

        return session.cancel(
            reason=reason
        )

    # ========================================================
    # INTERNAL: REQUIRE SESSION
    # ========================================================

    def _require_session(
        self,
        interview_id: str,
    ) -> InterviewSession:

        if not interview_id:

            raise ValueError(
                "interview_id is required."
            )

        session = self.sessions.get(
            interview_id
        )

        if session is None:

            raise ValueError(
                f"Interview session not found: "
                f"{interview_id}"
            )

        return session

    # ========================================================
    # INTERNAL: RECORD QUESTION
    # ========================================================

    def _record_question_as_asked(
        self,
        interview_id: str,
        question: Optional[
            Dict[str, Any]
        ],
    ) -> None:

        if question is None:
            return

        question_id = question.get(
            "question_id"
        )

        self._record_question_id(
            interview_id,
            question_id,
        )

        state = self.adaptive_state.get(
            interview_id
        )

        if state is not None:

            state[
                "current_difficulty"
            ] = question.get(
                "difficulty",
                state.get(
                    "current_difficulty",
                    "medium",
                ),
            )

    # ========================================================
    # INTERNAL: RECORD QUESTION ID
    # ========================================================

    def _record_question_id(
        self,
        interview_id: str,
        question_id: Optional[str],
    ) -> None:

        if not question_id:
            return

        state = self.adaptive_state.get(
            interview_id
        )

        if state is None:
            return

        asked_ids = state[
            "asked_question_ids"
        ]

        if question_id not in asked_ids:

            asked_ids.append(
                question_id
            )

    # ========================================================
    # INTERNAL: STUDENT SAFE QUESTION
    # ========================================================

    @staticmethod
    def _student_safe_question(
        question: Optional[
            Dict[str, Any]
        ],
    ) -> Optional[Dict[str, Any]]:

        if question is None:
            return None

        return {

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
        }


# ============================================================
# DEMO
# ============================================================

def run_demo() -> None:
    """
    Run complete CAMPUSLINK interview pipeline.
    """

    print()
    print("=" * 70)
    print(
        "CAMPUSLINK INTERVIEW SERVICE"
    )
    print("=" * 70)

    # --------------------------------------------------------
    # Load data
    # --------------------------------------------------------

    jobs = load_json(
        JOB_FILE
    )

    students = load_json(
        STUDENT_FILE
    )

    if not isinstance(
        jobs,
        list,
    ):

        raise ValueError(
            "jobs.json must contain a list."
        )

    if not isinstance(
        students,
        list,
    ):

        raise ValueError(
            "students.json must contain a list."
        )

    # --------------------------------------------------------
    # Job
    # --------------------------------------------------------

    job = find_by_id(
        jobs,
        "job_id",
        "JOB001",
    )

    if job is None:

        raise ValueError(
            "JOB001 was not found in jobs.json."
        )

    # --------------------------------------------------------
    # Student
    # --------------------------------------------------------

    student = find_by_id(
        students,
        "student_id",
        "STU001",
    )

    if student is None:

        raise ValueError(
            "STU001 was not found in students.json."
        )

    print()
    print(
        f"Student : "
        f"{student.get('name')}"
    )

    print(
        f"Job     : "
        f"{job.get('job_title')}"
    )

    # --------------------------------------------------------
    # Service
    # --------------------------------------------------------

    service = InterviewService()

    # --------------------------------------------------------
    # Self-assessment
    # --------------------------------------------------------

    self_assessment_scores = {

        "Python":
            85,

        "SQL":
            55,

        "OOP":
            45,

        "Data Structures":
            70,
    }

    # --------------------------------------------------------
    # Create interview
    # --------------------------------------------------------

    created = service.create_interview(
        job=job,
        student=student,
        question_count=5,
        self_assessment_scores=(
            self_assessment_scores
        ),
        seed=42,
    )

    interview_id = created[
        "interview_id"
    ]

    print()
    print(
        f"Interview ID : "
        f"{interview_id}"
    )

    print(
        f"Questions    : "
        f"{created['question_count']}"
    )

    print(
        f"Weak Skills  : "
        f"{created['weak_skills']}"
    )

    # --------------------------------------------------------
    # Start
    # --------------------------------------------------------

    started = service.start_interview(
        interview_id
    )

    print()
    print(
        f"Interview Status: "
        f"{started['status']}"
    )

    # --------------------------------------------------------
    # Demo answers
    # --------------------------------------------------------

    sample_answers = [

        (
            "A primary key uniquely identifies each "
            "record in a table, while a foreign key "
            "references a key in another table."
        ),

        (
            "An INNER JOIN returns matching rows from "
            "both tables. A LEFT JOIN returns all rows "
            "from the left table and matching rows from "
            "the right table."
        ),

        (
            "Inheritance allows a class to reuse "
            "properties and methods from another class. "
            "Polymorphism allows the same interface to "
            "have different implementations."
        ),

        (
            "A suitable data structure depends on the "
            "operations required. A hash table provides "
            "fast average lookup and insertion."
        ),

        (
            "Duplicate SQL records can be identified "
            "using GROUP BY on the relevant columns "
            "with HAVING COUNT(*) greater than one."
        ),
    ]

    # --------------------------------------------------------
    # Submit answers
    # --------------------------------------------------------

    for index, answer in enumerate(
        sample_answers,
        start=1,
    ):

        question = (
            service.get_current_question(
                interview_id
            )
        )

        if question is None:
            break

        print()
        print("-" * 70)

        print(
            f"Question {index}"
        )

        print(
            f"ID         : "
            f"{question.get('question_id')}"
        )

        print(
            f"Skill      : "
            f"{question.get('skill')}"
        )

        print(
            f"Difficulty : "
            f"{question.get('difficulty')}"
        )

        print(
            f"Question   : "
            f"{question.get('question')}"
        )

        service.submit_answer(
            interview_id=interview_id,
            answer=answer,
            metadata={
                "response_type":
                    "text",

                "source":
                    "SERVICE_DEMO",
            },
        )

    # --------------------------------------------------------
    # Session
    # --------------------------------------------------------

    session_result = (
        service.get_session_result(
            interview_id
        )
    )

    print()
    print("-" * 70)

    print(
        "SESSION STATUS:"
    )

    print(
        session_result[
            "status"
        ]
    )

    print(
        "Recorded responses:",
        len(
            session_result[
                "responses"
            ]
        ),
    )

    # --------------------------------------------------------
    # Complete
    # --------------------------------------------------------

    final_result = (
        service.complete_interview(
            interview_id=interview_id,
            job=job,
        )
    )

    # --------------------------------------------------------
    # Performance
    # --------------------------------------------------------

    performance = (
        final_result.get(
            "performance",
            {},
        )
    )

    # --------------------------------------------------------
    # Evaluation
    # --------------------------------------------------------

    evaluation = (
        final_result.get(
            "final_evaluation",
            {},
        )
    )

    print()
    print("=" * 70)
    print(
        "INTERVIEW EVALUATION"
    )
    print("=" * 70)

    print()
    print(
        f"Overall Score     : "
        f"{performance.get('overall_score', 0)}%"
    )

    print(
        f"Performance Level : "
        f"{performance.get('performance_level', 'NO_DATA')}"
    )

    print(
        f"Interview Cutoff  : "
        f"{evaluation.get('interview_cutoff', 0)}%"
    )

    print(
        f"Interview Result  : "
        f"{evaluation.get('interview_result')}"
    )

    print(
        f"Reason            : "
        f"{evaluation.get('reason')}"
    )

    print()
    print(
        "Strengths:"
    )

    for strength in performance.get(
        "strengths",
        [],
    ):

        print(
            f"  - {strength}"
        )

    print()
    print(
        "Improvement Areas:"
    )

    for area in performance.get(
        "improvement_areas",
        [],
    ):

        print(
            f"  - {area}"
        )

    # --------------------------------------------------------
    # Student result
    # --------------------------------------------------------

    student_result = (
        service.get_student_result(
            interview_id
        )
    )

    print()
    print("=" * 70)
    print(
        "STUDENT RESULT"
    )
    print("=" * 70)

    print(
        json.dumps(
            student_result,
            indent=2,
        )
    )

    # --------------------------------------------------------
    # Recruiter result
    # --------------------------------------------------------

    recruiter_result = (
        service.get_recruiter_result(
            interview_id
        )
    )

    print()
    print("=" * 70)
    print(
        "RECRUITER RESULT"
    )
    print("=" * 70)

    print(
        json.dumps(
            recruiter_result,
            indent=2,
        )
    )

    # --------------------------------------------------------
    # Success
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print(
        "CAMPUSLINK INTERVIEW SERVICE SUCCESSFUL"
    )
    print("=" * 70)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    run_demo()