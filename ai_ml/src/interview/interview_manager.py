"""
CAMPUSLINK - Interview Session Manager

Responsible for:
- Creating and managing interview sessions
- Starting interviews
- Returning current/next questions
- Submitting answers
- Skipping questions
- Tracking progress
- Tracking monitoring events
- Calculating interview performance
- Producing student/recruiter/session results

Important:
AI/ML evaluates and scores interview data.
Backend remains responsible for authentication, database CRUD,
application workflow, scheduling, and final hiring decisions.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4


# ============================================================
# ANSWER EVALUATOR
# ============================================================

try:
    from .answer_evaluator import evaluate_answer
except ImportError:
    evaluate_answer = None


# ============================================================
# INTERVIEW STATUS CONSTANTS
# ============================================================

INTERVIEW_CREATED = "CREATED"
INTERVIEW_IN_PROGRESS = "IN_PROGRESS"
INTERVIEW_ACTIVE = "ACTIVE"
INTERVIEW_COMPLETED = "COMPLETED"
INTERVIEW_CANCELLED = "CANCELLED"


# ============================================================
# ANSWER STATUS CONSTANTS
# ============================================================

ANSWER_PENDING = "PENDING"
ANSWER_ANSWERED = "ANSWERED"
ANSWER_SKIPPED = "SKIPPED"


# ============================================================
# MONITORING EVENT CONSTANTS
# ============================================================

FACE_DETECTED = "FACE_DETECTED"
FACE_NOT_DETECTED = "FACE_NOT_DETECTED"
MULTIPLE_FACES = "MULTIPLE_FACES"
LOOKING_AWAY = "LOOKING_AWAY"
EXCESSIVE_MOVEMENT = "EXCESSIVE_MOVEMENT"
CAMERA_DISCONNECTED = "CAMERA_DISCONNECTED"
MICROPHONE_DISCONNECTED = "MICROPHONE_DISCONNECTED"


# ============================================================
# SAFE HELPER FUNCTIONS
# ============================================================

def _safe_float(
    value: Any,
    default: float = 0.0
) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(
    value: Any,
    default: int = 0
) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _question_id(
    question: Any
) -> str:

    if isinstance(question, dict):
        return str(
            question.get("question_id")
            or question.get("id")
            or ""
        )

    return str(
        getattr(question, "question_id", None)
        or getattr(question, "id", None)
        or ""
    )


def _question_text(
    question: Any
) -> str:

    if isinstance(question, dict):
        return str(
            question.get("question")
            or question.get("question_text")
            or ""
        )

    return str(
        getattr(question, "question", None)
        or getattr(question, "question_text", None)
        or ""
    )


def _question_skill(
    question: Any
) -> str:

    if isinstance(question, dict):
        return str(
            question.get("skill")
            or ""
        )

    return str(
        getattr(question, "skill", "")
        or ""
    )


def _question_difficulty(
    question: Any
) -> str:

    if isinstance(question, dict):
        return str(
            question.get("difficulty")
            or "medium"
        )

    return str(
        getattr(question, "difficulty", None)
        or "medium"
    )


# ============================================================
# INTERVIEW SESSION MANAGER
# ============================================================

class InterviewSessionManager:

    def __init__(
        self,
        session_id: Optional[str] = None,
        student_id: Any = None,
        job_id: Any = None,
        questions: Optional[List[Dict[str, Any]]] = None,
        student: Optional[Dict[str, Any]] = None,
        job: Optional[Dict[str, Any]] = None,
        weak_skills: Optional[List[str]] = None,
        interview_id: Optional[str] = None,
        **kwargs: Any,
    ) -> None:

        # ----------------------------------------------------
        # SESSION IDENTIFICATION
        # ----------------------------------------------------

        self.session_id = (
            session_id
            or interview_id
            or str(uuid4())
        )

        self.interview_id = self.session_id

        # ----------------------------------------------------
        # STUDENT / JOB
        # ----------------------------------------------------

        self.student_id = student_id
        self.job_id = job_id

        self.student = student or {}
        self.job = job or {}

        # ----------------------------------------------------
        # QUESTIONS
        # ----------------------------------------------------

        self.questions: List[Dict[str, Any]] = list(
            questions or []
        )

        self.weak_skills = list(
            weak_skills or []
        )

        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        self.status = INTERVIEW_CREATED

        self.created_at = _utc_now()
        self.started_at: Optional[str] = None
        self.completed_at: Optional[str] = None
        self.cancelled_at: Optional[str] = None

        # ----------------------------------------------------
        # QUESTION TRACKING
        # ----------------------------------------------------

        self.current_question_index = 0

        # ----------------------------------------------------
        # ANSWERS
        # ----------------------------------------------------

        self.answers: List[Dict[str, Any]] = []

        for question in self.questions:

            self.answers.append(
                {
                    "question_id": _question_id(question),
                    "question": _question_text(question),
                    "skill": _question_skill(question),
                    "difficulty": _question_difficulty(question),
                    "answer": None,
                    "status": ANSWER_PENDING,
                    "score": 0.0,
                    "evaluation": {},
                    "submitted_at": None,
                }
            )

        # ----------------------------------------------------
        # MONITORING
        # ----------------------------------------------------

        self.monitoring_events: List[Dict[str, Any]] = []

        # ----------------------------------------------------
        # PERFORMANCE
        # ----------------------------------------------------

        self.performance_profile: Dict[str, Any] = {}

        # ----------------------------------------------------
        # OTHER METADATA
        # ----------------------------------------------------

        self.metadata: Dict[str, Any] = dict(kwargs)

        # ----------------------------------------------------
        # USED QUESTIONS
        # ----------------------------------------------------

        self.used_question_ids = set()

    # ========================================================
    # PROPERTIES
    # ========================================================

    @property
    def current_question(
        self
    ) -> Optional[Dict[str, Any]]:

        if not self.questions:
            return None

        if (
            self.current_question_index < 0
            or self.current_question_index >= len(self.questions)
        ):
            return None

        return self.questions[
            self.current_question_index
        ]

    @property
    def total_questions(
        self
    ) -> int:

        return len(self.questions)

    @property
    def answered_questions(
        self
    ) -> int:

        return sum(
            1
            for answer in self.answers
            if answer.get("status")
            == ANSWER_ANSWERED
        )

    @property
    def skipped_questions(
        self
    ) -> int:

        return sum(
            1
            for answer in self.answers
            if answer.get("status")
            == ANSWER_SKIPPED
        )

    @property
    def remaining_questions(
        self
    ) -> int:

        return max(
            0,
            self.total_questions
            - self.answered_questions
            - self.skipped_questions,
        )

    # Compatibility property
    #
    # Some older service code may refer to responses instead
    # of answers. This returns the same underlying records.

    @property
    def responses(
        self
    ) -> List[Dict[str, Any]]:

        return self.answers

    # ========================================================
    # GET CURRENT QUESTION
    # ========================================================

    def get_current_question(
        self,
    ) -> Optional[Dict[str, Any]]:

        question = self.current_question

        if question is None:
            return None

        if isinstance(question, dict):

            result = dict(question)

        else:

            result = {
                "question_id": _question_id(question),
                "skill": _question_skill(question),
                "difficulty": _question_difficulty(question),
                "question": _question_text(question),
            }

        # ----------------------------------------------------
        # NEVER EXPOSE CORRECT ANSWER TO STUDENT
        # ----------------------------------------------------

        result.pop(
            "correct_answer",
            None,
        )

        result.pop(
            "answer",
            None,
        )

        result.pop(
            "expected_answer",
            None,
        )

        result.pop(
            "keywords",
            None,
        )

        # ----------------------------------------------------
        # QUESTION POSITION
        # ----------------------------------------------------

        result["question_number"] = (
            self.current_question_index + 1
        )

        result["total_questions"] = (
            self.total_questions
        )

        return result

    # ========================================================
    # START INTERVIEW
    # ========================================================

    def start_interview(
        self,
    ) -> Dict[str, Any]:

        if self.status == INTERVIEW_COMPLETED:

            raise ValueError(
                "Interview has already been completed."
            )

        if self.status == INTERVIEW_CANCELLED:

            raise ValueError(
                "Interview has been cancelled."
            )

        if not self.questions:

            raise ValueError(
                "Cannot start interview without questions."
            )

        self.status = INTERVIEW_IN_PROGRESS

        self.started_at = _utc_now()

        self.current_question_index = 0

        return (
            self.get_current_question()
            or {}
        )

    # Compatibility alias

    def start(
        self
    ) -> Dict[str, Any]:

        return self.start_interview()

    # ========================================================
    # GET NEXT QUESTION
    # ========================================================

    def get_next_question(
        self,
    ) -> Optional[Dict[str, Any]]:

        # ----------------------------------------------------
        # START IF NOT STARTED
        # ----------------------------------------------------

        if self.status == INTERVIEW_CREATED:

            self.start_interview()

            return self.get_current_question()

        # ----------------------------------------------------
        # FINISHED INTERVIEW
        # ----------------------------------------------------

        if self.status in (
            INTERVIEW_COMPLETED,
            INTERVIEW_CANCELLED,
        ):

            return None

        # ----------------------------------------------------
        # IF CURRENT QUESTION IS STILL PENDING,
        # RETURN IT
        # ----------------------------------------------------

        if (
            0 <= self.current_question_index
            < len(self.answers)
        ):

            current_answer = (
                self.answers[
                    self.current_question_index
                ]
            )

            if (
                current_answer.get("status")
                == ANSWER_PENDING
            ):

                return self.get_current_question()

        # ----------------------------------------------------
        # FIND NEXT PENDING QUESTION
        # ----------------------------------------------------

        for index in range(
            self.current_question_index + 1,
            len(self.questions),
        ):

            answer_record = self.answers[index]

            if (
                answer_record.get("status")
                == ANSWER_PENDING
            ):

                self.current_question_index = index

                return self.get_current_question()

        # ----------------------------------------------------
        # NO QUESTIONS LEFT
        # ----------------------------------------------------

        self.current_question_index = (
            len(self.questions)
        )

        return None

    # Compatibility alias

    def next_question(
        self,
    ) -> Optional[Dict[str, Any]]:

        return self.get_next_question()

    # ========================================================
    # SUBMIT ANSWER
    # ========================================================

    def submit_answer(
        self,
        answer: Optional[str],
        question_id: Optional[str] = None,
        skipped: bool = False,
        **kwargs: Any,
    ) -> Dict[str, Any]:

        # ----------------------------------------------------
        # AUTO START
        # ----------------------------------------------------

        if self.status == INTERVIEW_CREATED:

            self.start_interview()

        # ----------------------------------------------------
        # CHECK STATUS
        # ----------------------------------------------------

        if self.status in (
            INTERVIEW_COMPLETED,
            INTERVIEW_CANCELLED,
        ):

            raise ValueError(
                "Cannot submit answer because the interview is finished."
            )

        # ----------------------------------------------------
        # CURRENT QUESTION
        # ----------------------------------------------------

        if self.current_question is None:

            raise ValueError(
                "There is no current question."
            )

        current_question = (
            self.current_question
        )

        current_question_id = _question_id(
            current_question
        )

        # ----------------------------------------------------
        # QUESTION ID VALIDATION
        # ----------------------------------------------------

        if (
            question_id is not None
            and str(question_id)
            != current_question_id
        ):

            raise ValueError(
                f"Question ID mismatch. "
                f"Expected {current_question_id}, "
                f"received {question_id}."
            )

        index = self.current_question_index

        record = self.answers[index]

        # ----------------------------------------------------
        # PREVENT DOUBLE SUBMISSION
        # ----------------------------------------------------

        if record.get("status") in (
            ANSWER_ANSWERED,
            ANSWER_SKIPPED,
        ):

            raise ValueError(
                "This question has already been submitted."
            )

        # ----------------------------------------------------
        # ANSWER
        # ----------------------------------------------------

        submitted_answer = (
            ""
            if answer is None
            else str(answer).strip()
        )

        timestamp = _utc_now()

        # ====================================================
        # SKIPPED
        # ====================================================

        if skipped or not submitted_answer:

            record["answer"] = submitted_answer

            record["status"] = ANSWER_SKIPPED

            record["score"] = 0.0

            record["evaluation"] = {
                "score": 0.0,
                "status": ANSWER_SKIPPED,
                "feedback": "Question skipped.",
            }

            record["submitted_at"] = timestamp

            self.used_question_ids.add(
                current_question_id
            )

            return {
                "question_id": current_question_id,
                "status": ANSWER_SKIPPED,
                "score": 0.0,
                "feedback": "Question skipped.",
                "next_question": (
                    self._prepare_next_question()
                ),
            }

        # ====================================================
        # EVALUATE ANSWER
        # ====================================================

        evaluation: Dict[str, Any] = {}

        if evaluate_answer is not None:

            try:

                evaluation = evaluate_answer(
                    question=current_question,
                    answer=submitted_answer,
                )

            except TypeError:

                try:

                    evaluation = evaluate_answer(
                        current_question,
                        submitted_answer,
                    )

                except Exception as exc:

                    evaluation = {
                        "score": 0.0,
                        "feedback": (
                            "Answer received. "
                            "Evaluation fallback used: "
                            f"{exc}"
                        ),
                    }

            except Exception as exc:

                evaluation = {
                    "score": 0.0,
                    "feedback": (
                        "Answer received. "
                        "Evaluation fallback used: "
                        f"{exc}"
                    ),
                }

        # ----------------------------------------------------
        # NORMALIZE EVALUATION
        # ----------------------------------------------------

        if not isinstance(
            evaluation,
            dict,
        ):

            evaluation = {
                "score": _safe_float(
                    evaluation,
                    0.0,
                )
            }

        # ----------------------------------------------------
        # GET SCORE
        # ----------------------------------------------------

        score = _safe_float(
            evaluation.get("score")
            or evaluation.get("total_score")
            or evaluation.get("final_score"),
            0.0,
        )

        score = max(
            0.0,
            min(
                100.0,
                score,
            ),
        )

        # ----------------------------------------------------
        # STORE ANSWER
        # ----------------------------------------------------

        record["answer"] = submitted_answer

        record["status"] = ANSWER_ANSWERED

        record["score"] = score

        record["evaluation"] = evaluation

        record["submitted_at"] = timestamp

        self.used_question_ids.add(
            current_question_id
        )

        # ----------------------------------------------------
        # RETURN RESULT
        # ----------------------------------------------------

        return {
            "question_id": current_question_id,
            "status": ANSWER_ANSWERED,
            "score": score,
            "evaluation": evaluation,
            "next_question": (
                self._prepare_next_question()
            ),
        }

    # ========================================================
    # SKIP QUESTION
    # ========================================================

    def skip_question(
        self,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:

        # ----------------------------------------------------
        # AUTO START
        # ----------------------------------------------------

        if self.status == INTERVIEW_CREATED:

            self.start_interview()

        # ----------------------------------------------------
        # CHECK STATUS
        # ----------------------------------------------------

        if self.status in (
            INTERVIEW_COMPLETED,
            INTERVIEW_CANCELLED,
        ):

            raise ValueError(
                "Cannot skip question because the interview is finished."
            )

        # ----------------------------------------------------
        # CURRENT QUESTION
        # ----------------------------------------------------

        current_question = (
            self.current_question
        )

        if current_question is None:

            raise ValueError(
                "There is no current question to skip."
            )

        current_question_id = _question_id(
            current_question
        )

        index = self.current_question_index

        record = self.answers[index]

        # ----------------------------------------------------
        # PREVENT DOUBLE SUBMISSION
        # ----------------------------------------------------

        if record.get("status") in (
            ANSWER_ANSWERED,
            ANSWER_SKIPPED,
        ):

            raise ValueError(
                "This question has already been submitted."
            )

        timestamp = _utc_now()

        # ----------------------------------------------------
        # STORE SKIPPED ANSWER
        # ----------------------------------------------------

        record["answer"] = ""

        record["status"] = ANSWER_SKIPPED

        record["score"] = 0.0

        record["evaluation"] = {
            "score": 0.0,
            "status": ANSWER_SKIPPED,
            "feedback": "Question skipped.",
            "reason": (
                reason
                if reason
                else ""
            ),
        }

        record["submitted_at"] = timestamp

        self.used_question_ids.add(
            current_question_id
        )

        # ----------------------------------------------------
        # MOVE TO NEXT QUESTION
        # ----------------------------------------------------

        next_question = (
            self._prepare_next_question()
        )

        # ----------------------------------------------------
        # RETURN RESULT
        # ----------------------------------------------------

        return {
            "question_id":
                current_question_id,

            "status":
                ANSWER_SKIPPED,

            "score":
                0.0,

            "feedback":
                "Question skipped.",

            "reason":
                (
                    reason
                    if reason
                    else ""
                ),

            "next_question":
                next_question,

            "interview_completed":
                (
                    self.status
                    == INTERVIEW_COMPLETED
                ),
        }

    # Compatibility alias

    def skip(
        self,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:

        return self.skip_question(
            reason=reason
        )

    # ========================================================
    # PREPARE NEXT QUESTION
    # ========================================================

    def _prepare_next_question(
        self,
    ) -> Optional[Dict[str, Any]]:

        next_index = (
            self.current_question_index + 1
        )

        while (
            next_index
            < len(self.questions)
        ):

            if (
                self.answers[next_index].get(
                    "status"
                )
                == ANSWER_PENDING
            ):

                self.current_question_index = (
                    next_index
                )

                return self.get_current_question()

            next_index += 1

        # ----------------------------------------------------
        # NO PENDING QUESTIONS REMAIN
        # ----------------------------------------------------

        self.current_question_index = (
            len(self.questions)
        )

        self.status = INTERVIEW_COMPLETED

        if self.completed_at is None:

            self.completed_at = _utc_now()

        self._calculate_current_performance()

        return None

    # ========================================================
    # INTERNAL CURRENT QUESTION
    # ========================================================

    def current_question_internal(
        self,
    ) -> Optional[Dict[str, Any]]:

        return self.current_question

    # ========================================================
    # CALCULATE PERFORMANCE
    # ========================================================

    def _calculate_current_performance(
        self,
    ) -> Dict[str, Any]:

        answered = [
            answer
            for answer in self.answers
            if answer.get("status")
            == ANSWER_ANSWERED
        ]

        skipped = [
            answer
            for answer in self.answers
            if answer.get("status")
            == ANSWER_SKIPPED
        ]

        total = len(self.questions)

        answered_count = len(answered)

        skipped_count = len(skipped)

        pending_count = max(
            0,
            total
            - answered_count
            - skipped_count,
        )

        # ----------------------------------------------------
        # OVERALL SCORE
        # ----------------------------------------------------

        if answered_count:

            average_score = (
                sum(
                    _safe_float(
                        answer.get("score"),
                        0.0,
                    )
                    for answer in answered
                )
                / answered_count
            )

        else:

            average_score = 0.0

        # ----------------------------------------------------
        # COMPLETION
        # ----------------------------------------------------

        completion_percentage = (
            (
                answered_count
                + skipped_count
            )
            / total
            * 100
            if total
            else 0.0
        )

        # ----------------------------------------------------
        # SKILL PERFORMANCE
        # ----------------------------------------------------

        skill_scores: Dict[
            str,
            List[float]
        ] = {}

        for answer in answered:

            skill = (
                str(
                    answer.get("skill")
                    or "General"
                ).strip()
                or "General"
            )

            skill_scores.setdefault(
                skill,
                [],
            ).append(
                _safe_float(
                    answer.get("score"),
                    0.0,
                )
            )

        skill_performance = {}

        for skill, scores in skill_scores.items():

            skill_performance[skill] = round(
                sum(scores)
                / len(scores),
                2,
            )

        # ----------------------------------------------------
        # PERFORMANCE LEVEL
        # ----------------------------------------------------

        if average_score >= 85:

            performance_level = "EXCELLENT"

        elif average_score >= 70:

            performance_level = "GOOD"

        elif average_score >= 50:

            performance_level = "AVERAGE"

        elif answered_count:

            performance_level = "WEAK"

        else:

            performance_level = "NOT_EVALUATED"

        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        performance = {

            "total_questions": total,

            "answered": answered_count,

            "skipped": skipped_count,

            "pending": pending_count,

            "completion_percentage": round(
                completion_percentage,
                2,
            ),

            "overall_score": round(
                average_score,
                2,
            ),

            "performance_level":
                performance_level,

            "skill_performance":
                skill_performance,
        }

        self.performance_profile = (
            performance
        )

        return performance

    # ========================================================
    # GET PROGRESS
    # ========================================================

    def get_progress(
        self,
    ) -> Dict[str, Any]:

        total = self.total_questions

        completed = (
            self.answered_questions
            + self.skipped_questions
        )

        percentage = (
            completed
            / total
            * 100
            if total
            else 0.0
        )

        return {

            "session_id":
                self.session_id,

            "status":
                self.status,

            "total_questions":
                total,

            "current_question":
                (
                    self.current_question_index + 1
                    if self.current_question
                    else total
                ),

            "answered":
                self.answered_questions,

            "skipped":
                self.skipped_questions,

            "pending":
                self.remaining_questions,

            "completed":
                completed,

            "percentage":
                round(
                    percentage,
                    2,
                ),
        }

    # ========================================================
    # ADAPTIVE STATUS
    # ========================================================

    def get_adaptive_status(
        self,
    ) -> Dict[str, Any]:

        performance = (
            self._calculate_current_performance()
        )

        weak_skills = []

        for (
            skill,
            score
        ) in performance.get(
            "skill_performance",
            {},
        ).items():

            if _safe_float(score) < 60:

                weak_skills.append(
                    skill
                )

        return {

            "session_id":
                self.session_id,

            "current_difficulty":
                (
                    _question_difficulty(
                        self.current_question
                    )
                    if self.current_question
                    else None
                ),

            "weak_skills":
                weak_skills,

            "configured_weak_skills":
                self.weak_skills,

            "performance":
                performance,
        }

    # ========================================================
    # MONITORING EVENT
    # ========================================================

    def add_monitoring_event(
        self,
        event_type: str,
        confidence: Optional[float] = None,
        details: Optional[Dict[str, Any]] = None,
        timestamp: Optional[str] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:

        event = {

            "event_id":
                str(uuid4()),

            "session_id":
                self.session_id,

            "event_type":
                str(event_type),

            "confidence":
                (
                    _safe_float(
                        confidence,
                        0.0,
                    )
                    if confidence is not None
                    else None
                ),

            "details":
                details or {},

            "timestamp":
                timestamp or _utc_now(),
        }

        self.monitoring_events.append(
            event
        )

        return event

    # Compatibility alias

    def record_monitoring_event(
        self,
        event_type: str,
        **kwargs: Any,
    ) -> Dict[str, Any]:

        return self.add_monitoring_event(
            event_type=event_type,
            **kwargs,
        )

    # ========================================================
    # GET MONITORING EVENTS
    # ========================================================

    def get_monitoring_events(
        self,
    ) -> List[Dict[str, Any]]:

        return list(
            self.monitoring_events
        )

    # ========================================================
    # COMPLETE INTERVIEW
    # ========================================================

    def complete_interview(
        self,
    ) -> Dict[str, Any]:

        if self.status == INTERVIEW_CANCELLED:

            raise ValueError(
                "Cannot complete a cancelled interview."
            )

        if self.status == INTERVIEW_COMPLETED:

            return self.get_session_result()

        self.status = (
            INTERVIEW_COMPLETED
        )

        self.completed_at = _utc_now()

        # Move index to end only when all questions
        # have actually been completed/skipped.
        if self.remaining_questions == 0:

            self.current_question_index = (
                len(self.questions)
            )

        self._calculate_current_performance()

        return self.get_session_result()

    # Compatibility alias

    def complete(
        self,
    ) -> Dict[str, Any]:

        return self.complete_interview()

    # ========================================================
    # CANCEL INTERVIEW
    # ========================================================

    def cancel_interview(
        self,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:

        if self.status == INTERVIEW_COMPLETED:

            raise ValueError(
                "Cannot cancel a completed interview."
            )

        self.status = (
            INTERVIEW_CANCELLED
        )

        self.cancelled_at = _utc_now()

        if reason:

            self.metadata[
                "cancel_reason"
            ] = reason

        return self.get_session_result()

    # Compatibility alias

    def cancel(
        self,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:

        return self.cancel_interview(
            reason=reason
        )

    # ========================================================
    # STUDENT RESULT
    # ========================================================

    def get_student_result(
        self,
    ) -> Dict[str, Any]:

        performance = (
            self._calculate_current_performance()
        )

        return {

            "session_id":
                self.session_id,

            "student_id":
                self.student_id,

            "job_id":
                self.job_id,

            "status":
                self.status,

            "total_questions":
                performance[
                    "total_questions"
                ],

            "answered":
                performance[
                    "answered"
                ],

            "skipped":
                performance[
                    "skipped"
                ],

            "pending":
                performance[
                    "pending"
                ],

            "overall_score":
                performance[
                    "overall_score"
                ],

            "performance_level":
                performance[
                    "performance_level"
                ],

            "skill_performance":
                performance[
                    "skill_performance"
                ],

            "feedback_available":
                (
                    self.status
                    == INTERVIEW_COMPLETED
                ),
        }

    # ========================================================
    # RECRUITER RESULT
    # ========================================================

    def get_recruiter_result(
        self,
    ) -> Dict[str, Any]:

        performance = (
            self._calculate_current_performance()
        )

        responses = []

        for record in self.answers:

            responses.append(
                {

                    "question_id":
                        record.get(
                            "question_id"
                        ),

                    "question":
                        record.get(
                            "question"
                        ),

                    "skill":
                        record.get(
                            "skill"
                        ),

                    "difficulty":
                        record.get(
                            "difficulty"
                        ),

                    "answer":
                        record.get(
                            "answer"
                        ),

                    "status":
                        record.get(
                            "status"
                        ),

                    "score":
                        record.get(
                            "score"
                        ),

                    "evaluation":
                        record.get(
                            "evaluation"
                        ),

                    "submitted_at":
                        record.get(
                            "submitted_at"
                        ),
                }
            )

        return {

            "session_id":
                self.session_id,

            "student_id":
                self.student_id,

            "job_id":
                self.job_id,

            "status":
                self.status,

            "started_at":
                self.started_at,

            "completed_at":
                self.completed_at,

            "questions":
                responses,

            "responses":
                responses,

            "performance":
                performance,

            "monitoring_events":
                list(
                    self.monitoring_events
                ),
        }

    # ========================================================
    # COMPLETE SESSION RESULT
    # ========================================================

    def get_session_result(
        self,
    ) -> Dict[str, Any]:

        performance = (
            self._calculate_current_performance()
        )

        progress = (
            self.get_progress()
        )

        # ----------------------------------------------------
        # RESPONSES
        # ----------------------------------------------------

        responses = list(
            self.answers
        )

        return {

            "session_id":
                self.session_id,

            "interview_id":
                self.interview_id,

            "student_id":
                self.student_id,

            "job_id":
                self.job_id,

            "status":
                self.status,

            "created_at":
                self.created_at,

            "started_at":
                self.started_at,

            "completed_at":
                self.completed_at,

            "cancelled_at":
                self.cancelled_at,

            "total_questions":
                self.total_questions,

            "current_question_index":
                self.current_question_index,

            "progress":
                progress,

            "performance":
                performance,

            "weak_skills":
                list(
                    self.weak_skills
                ),

            "answers":
                responses,

            "responses":
                responses,

            "monitoring_events":
                list(
                    self.monitoring_events
                ),

            "student_result":
                self.get_student_result(),

            "recruiter_result":
                self.get_recruiter_result(),

            "metadata":
                dict(
                    self.metadata
                ),
        }

    # ========================================================
    # TO DICT
    # ========================================================

    def to_dict(
        self,
    ) -> Dict[str, Any]:

        return self.get_session_result()


# ============================================================
# COMPATIBILITY CLASS
# ============================================================

class InterviewSession(
    InterviewSessionManager
):
    """
    Compatibility class used by
    interview_service.py.

    It inherits all functionality from
    InterviewSessionManager.
    """

    pass


# ============================================================
# DEMO
# ============================================================

def run_demo() -> None:

    print("=" * 70)
    print(
        "CAMPUSLINK INTERVIEW SESSION MANAGER"
    )
    print("=" * 70)

    questions = [

        {
            "question_id":
                "INT-PY-001",

            "skill":
                "Python",

            "difficulty":
                "easy",

            "question":
                "What is a Python list?",
        },

        {
            "question_id":
                "INT-SQL-001",

            "skill":
                "SQL",

            "difficulty":
                "medium",

            "question":
                "What is an INNER JOIN?",
        },

        {
            "question_id":
                "INT-OOP-001",

            "skill":
                "OOP",

            "difficulty":
                "medium",

            "question":
                "What is inheritance?",
        },
    ]

    # --------------------------------------------------------
    # CREATE SESSION
    # --------------------------------------------------------

    session = InterviewSession(

        session_id=str(
            uuid4()
        ),

        student_id=1,

        job_id=1,

        questions=questions,

        weak_skills=[
            "Python",
            "SQL",
        ],
    )

    print()

    print(
        "Session ID :",
        session.session_id,
    )

    print(
        "Status     :",
        session.status,
    )

    print(
        "Questions  :",
        session.total_questions,
    )

    # --------------------------------------------------------
    # START
    # --------------------------------------------------------

    print()

    print(
        "Starting interview..."
    )

    current = (
        session.start_interview()
    )

    print(
        "Current question:",
        current,
    )

    # --------------------------------------------------------
    # ANSWER
    # --------------------------------------------------------

    print()

    print(
        "Submitting first answer..."
    )

    result = session.submit_answer(

        answer=(
            "A Python list is an ordered "
            "mutable collection."
        )
    )

    print(
        "Answer result:",
        result,
    )

    # --------------------------------------------------------
    # SKIP SECOND QUESTION
    # --------------------------------------------------------

    print()

    print(
        "Skipping second question..."
    )

    skip_result = session.skip_question(
        reason="Student skipped the question."
    )

    print(
        "Skip result:",
        skip_result,
    )

    # --------------------------------------------------------
    # NEXT QUESTION
    # --------------------------------------------------------

    print()

    print(
        "Next question:"
    )

    next_question = (
        session.get_next_question()
    )

    print(
        next_question
    )

    # --------------------------------------------------------
    # MONITORING
    # --------------------------------------------------------

    print()

    print(
        "Adding monitoring event..."
    )

    event = (
        session.add_monitoring_event(

            event_type=
                FACE_DETECTED,

            confidence=
                0.98,
        )
    )

    print(
        event
    )

    # --------------------------------------------------------
    # PROGRESS
    # --------------------------------------------------------

    print()

    print(
        "Progress:"
    )

    print(
        session.get_progress()
    )

    # --------------------------------------------------------
    # SESSION RESULT
    # --------------------------------------------------------

    print()

    print(
        "Session result:"
    )

    result = (
        session.get_session_result()
    )

    print(
        "Session ID:",
        result[
            "session_id"
        ],
    )

    print(
        "Status:",
        result[
            "status"
        ],
    )

    print(
        "Progress:",
        result[
            "progress"
        ],
    )

    print(
        "Performance:",
        result[
            "performance"
        ],
    )

    print(
        "Responses:",
        len(
            result[
                "responses"
            ]
        ),
    )

    print()

    print("=" * 70)

    print(
        "INTERVIEW SESSION MANAGER SUCCESSFUL"
    )

    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    run_demo()