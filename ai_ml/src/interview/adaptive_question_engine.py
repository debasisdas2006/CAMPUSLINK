import random
from typing import Any, Dict, List, Optional


# ============================================================
# INTERVIEW QUESTION BANK
# ============================================================
#
# Every question follows this schema:
#
# - question_id
# - skill
# - difficulty
# - question_type
# - question
# - expected_answer
# - keywords
#
# expected_answer + keywords are INTERNAL ONLY.
# They are used by answer_evaluator.py.
#
# Student-facing questions must NEVER expose:
# - expected_answer
# - keywords
# ============================================================


INTERVIEW_QUESTION_BANK = [

    # ========================================================
    # PYTHON - EASY
    # ========================================================

    {
        "question_id": "PY_E_001",
        "skill": "Python",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is a variable in Python?",
        "expected_answer": (
            "A variable is a name used to store or reference "
            "a value or object in Python."
        ),
        "keywords": [
            "variable",
            "value",
            "object",
            "reference"
        ]
    },

    {
        "question_id": "PY_E_002",
        "skill": "Python",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is a Python function?",
        "expected_answer": (
            "A function is a reusable block of code that performs "
            "a specific task and can accept parameters and return a value."
        ),
        "keywords": [
            "function",
            "reusable",
            "code",
            "task",
            "parameter",
            "return"
        ]
    },

    # ========================================================
    # PYTHON - MEDIUM
    # ========================================================

    {
        "question_id": "PY_M_001",
        "skill": "Python",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between a list and a tuple "
            "in Python?"
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
    },

    {
        "question_id": "PY_M_002",
        "skill": "Python",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between shallow copy "
            "and deep copy in Python?"
        ),
        "expected_answer": (
            "A shallow copy creates a new outer object but keeps "
            "references to nested objects. A deep copy recursively "
            "copies nested objects as well."
        ),
        "keywords": [
            "shallow",
            "deep",
            "copy",
            "reference",
            "nested"
        ]
    },

    # ========================================================
    # PYTHON - HARD
    # ========================================================

    {
        "question_id": "PY_H_001",
        "skill": "Python",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": "What is a Python decorator?",
        "expected_answer": (
            "A decorator is a callable that modifies or extends "
            "the behavior of another function or class without "
            "directly changing its source code."
        ),
        "keywords": [
            "decorator",
            "function",
            "behavior",
            "modify",
            "extend",
            "wrapper"
        ]
    },

    {
        "question_id": "PY_H_002",
        "skill": "Python",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "Explain how Python generators work and why "
            "they are useful."
        ),
        "expected_answer": (
            "A generator produces values lazily using yield. "
            "It does not store all values in memory at once, "
            "which makes it useful for processing large data."
        ),
        "keywords": [
            "generator",
            "yield",
            "lazy",
            "memory",
            "values"
        ]
    },

    # ========================================================
    # JAVA - EASY
    # ========================================================

    {
        "question_id": "JAVA_E_001",
        "skill": "Java",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is a class in Java?",
        "expected_answer": (
            "A class is a blueprint or template used to create "
            "objects. It can contain fields and methods."
        ),
        "keywords": [
            "class",
            "blueprint",
            "object",
            "fields",
            "methods"
        ]
    },

    {
        "question_id": "JAVA_E_002",
        "skill": "Java",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is an object in Java?",
        "expected_answer": (
            "An object is an instance of a class that contains "
            "state and behavior."
        ),
        "keywords": [
            "object",
            "instance",
            "class",
            "state",
            "behavior"
        ]
    },

    # ========================================================
    # JAVA - MEDIUM
    # ========================================================

    {
        "question_id": "JAVA_M_001",
        "skill": "Java",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between method overloading "
            "and method overriding in Java?"
        ),
        "expected_answer": (
            "Overloading means defining multiple methods with "
            "the same name but different parameters. Overriding "
            "means a subclass provides a different implementation "
            "of a superclass method."
        ),
        "keywords": [
            "overloading",
            "overriding",
            "method",
            "parameters",
            "subclass",
            "superclass"
        ]
    },

    {
        "question_id": "JAVA_M_002",
        "skill": "Java",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": "What is an interface in Java?",
        "expected_answer": (
            "An interface defines a contract that implementing "
            "classes must follow. It is used to achieve abstraction "
            "and support multiple inheritance of type."
        ),
        "keywords": [
            "interface",
            "contract",
            "implement",
            "abstraction"
        ]
    },

    # ========================================================
    # JAVA - HARD
    # ========================================================

    {
        "question_id": "JAVA_H_001",
        "skill": "Java",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "Explain the difference between stack memory "
            "and heap memory in Java."
        ),
        "expected_answer": (
            "Stack memory is used for method calls and local variables "
            "and is associated with individual threads. Heap memory "
            "stores objects and is managed by the garbage collector."
        ),
        "keywords": [
            "stack",
            "heap",
            "memory",
            "local",
            "objects",
            "garbage collector",
            "thread"
        ]
    },

    {
        "question_id": "JAVA_H_002",
        "skill": "Java",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": "What is garbage collection in Java?",
        "expected_answer": (
            "Garbage collection automatically identifies and removes "
            "objects that are no longer reachable so that memory "
            "can be reused."
        ),
        "keywords": [
            "garbage",
            "collection",
            "objects",
            "memory",
            "reachable",
            "automatic"
        ]
    },

    # ========================================================
    # SQL - EASY
    # ========================================================

    {
        "question_id": "SQL_E_001",
        "skill": "SQL",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is a primary key?",
        "expected_answer": (
            "A primary key uniquely identifies each row in a table "
            "and cannot contain duplicate or null values."
        ),
        "keywords": [
            "primary key",
            "unique",
            "row",
            "table",
            "duplicate",
            "null"
        ]
    },

    {
        "question_id": "SQL_E_002",
        "skill": "SQL",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is a SQL SELECT statement used for?",
        "expected_answer": (
            "SELECT is used to retrieve data from one or more "
            "database tables."
        ),
        "keywords": [
            "select",
            "retrieve",
            "data",
            "table"
        ]
    },

    # ========================================================
    # SQL - MEDIUM
    # ========================================================

    {
        "question_id": "SQL_M_001",
        "skill": "SQL",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between WHERE and HAVING "
            "in SQL?"
        ),
        "expected_answer": (
            "WHERE filters rows before grouping, while HAVING "
            "filters groups after GROUP BY and can be used "
            "with aggregate functions."
        ),
        "keywords": [
            "where",
            "having",
            "filter",
            "rows",
            "group",
            "group by",
            "aggregate"
        ]
    },

    {
        "question_id": "SQL_M_002",
        "skill": "SQL",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": "What is an SQL JOIN?",
        "expected_answer": (
            "A JOIN combines rows from two or more tables "
            "using a related column or condition."
        ),
        "keywords": [
            "join",
            "tables",
            "rows",
            "related",
            "column"
        ]
    },

    # ========================================================
    # SQL - HARD
    # ========================================================

    {
        "question_id": "SQL_H_001",
        "skill": "SQL",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "What is database normalization and why is it used?"
        ),
        "expected_answer": (
            "Normalization organizes data into related tables "
            "to reduce redundancy and improve data integrity."
        ),
        "keywords": [
            "normalization",
            "redundancy",
            "tables",
            "data integrity",
            "organize"
        ]
    },

    {
        "question_id": "SQL_H_002",
        "skill": "SQL",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "What is an SQL index and how does it improve query performance?"
        ),
        "expected_answer": (
            "An index is a data structure that helps the database "
            "find rows faster without scanning the entire table. "
            "Indexes can improve reads but require storage and "
            "can add overhead to writes."
        ),
        "keywords": [
            "index",
            "query",
            "performance",
            "rows",
            "table",
            "read",
            "write"
        ]
    },

    # ========================================================
    # OOP - EASY
    # ========================================================

    {
        "question_id": "OOP_E_001",
        "skill": "OOP",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is encapsulation?",
        "expected_answer": (
            "Encapsulation combines data and methods inside a class "
            "and controls access to the internal state."
        ),
        "keywords": [
            "encapsulation",
            "data",
            "methods",
            "class",
            "access"
        ]
    },

    {
        "question_id": "OOP_E_002",
        "skill": "OOP",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is inheritance?",
        "expected_answer": (
            "Inheritance allows a class to acquire properties "
            "and behavior from another class."
        ),
        "keywords": [
            "inheritance",
            "class",
            "properties",
            "behavior",
            "parent",
            "child"
        ]
    },

    # ========================================================
    # OOP - MEDIUM
    # ========================================================

    {
        "question_id": "OOP_M_001",
        "skill": "OOP",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": "What is polymorphism?",
        "expected_answer": (
            "Polymorphism allows the same interface or method call "
            "to represent different implementations."
        ),
        "keywords": [
            "polymorphism",
            "interface",
            "method",
            "implementation"
        ]
    },

    {
        "question_id": "OOP_M_002",
        "skill": "OOP",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between abstraction "
            "and encapsulation?"
        ),
        "expected_answer": (
            "Abstraction focuses on hiding unnecessary implementation "
            "details and exposing essential behavior. Encapsulation "
            "focuses on bundling data and methods and controlling access."
        ),
        "keywords": [
            "abstraction",
            "encapsulation",
            "implementation",
            "data",
            "access",
            "behavior"
        ]
    },

    # ========================================================
    # OOP - HARD
    # ========================================================

    {
        "question_id": "OOP_H_001",
        "skill": "OOP",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "Explain the SOLID principles in object-oriented design."
        ),
        "expected_answer": (
            "SOLID is a set of five design principles: "
            "Single Responsibility, Open Closed, Liskov Substitution, "
            "Interface Segregation, and Dependency Inversion."
        ),
        "keywords": [
            "solid",
            "single responsibility",
            "open closed",
            "liskov",
            "interface segregation",
            "dependency inversion"
        ]
    },

    {
        "question_id": "OOP_H_002",
        "skill": "OOP",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "Why is composition often preferred over inheritance?"
        ),
        "expected_answer": (
            "Composition builds objects from other objects and "
            "can provide more flexibility and lower coupling than "
            "deep inheritance hierarchies."
        ),
        "keywords": [
            "composition",
            "inheritance",
            "flexibility",
            "coupling",
            "objects"
        ]
    },

    # ========================================================
    # DSA - EASY
    # ========================================================

    {
        "question_id": "DSA_E_001",
        "skill": "DSA",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is an array?",
        "expected_answer": (
            "An array is a data structure that stores elements "
            "in indexed positions, typically in contiguous memory."
        ),
        "keywords": [
            "array",
            "data structure",
            "index",
            "elements",
            "memory"
        ]
    },

    {
        "question_id": "DSA_E_002",
        "skill": "DSA",
        "difficulty": "easy",
        "question_type": "TECHNICAL",
        "question": "What is a stack data structure?",
        "expected_answer": (
            "A stack is a linear data structure that follows "
            "the Last In First Out principle."
        ),
        "keywords": [
            "stack",
            "linear",
            "last in first out",
            "lifo"
        ]
    },

    # ========================================================
    # DSA - MEDIUM
    # ========================================================

    {
        "question_id": "DSA_M_001",
        "skill": "DSA",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the time complexity of binary search "
            "and why?"
        ),
        "expected_answer": (
            "Binary search has O(log n) time complexity because "
            "it divides the search space approximately in half "
            "after each comparison."
        ),
        "keywords": [
            "binary search",
            "log n",
            "divide",
            "half",
            "time complexity"
        ]
    },

    {
        "question_id": "DSA_M_002",
        "skill": "DSA",
        "difficulty": "medium",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between a stack and a queue?"
        ),
        "expected_answer": (
            "A stack follows Last In First Out while a queue "
            "follows First In First Out."
        ),
        "keywords": [
            "stack",
            "queue",
            "last in first out",
            "first in first out",
            "lifo",
            "fifo"
        ]
    },

    # ========================================================
    # DSA - HARD
    # ========================================================

    {
        "question_id": "DSA_H_001",
        "skill": "DSA",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "What is the difference between BFS and DFS?"
        ),
        "expected_answer": (
            "BFS explores a graph level by level and commonly "
            "uses a queue. DFS explores as deeply as possible "
            "before backtracking and commonly uses recursion "
            "or a stack."
        ),
        "keywords": [
            "bfs",
            "dfs",
            "graph",
            "queue",
            "stack",
            "recursion",
            "level"
        ]
    },

    {
        "question_id": "DSA_H_002",
        "skill": "DSA",
        "difficulty": "hard",
        "question_type": "TECHNICAL",
        "question": (
            "What is dynamic programming?"
        ),
        "expected_answer": (
            "Dynamic programming solves problems by breaking them "
            "into overlapping subproblems and storing previously "
            "computed results to avoid repeated work."
        ),
        "keywords": [
            "dynamic programming",
            "subproblems",
            "overlapping",
            "store",
            "results",
            "repeated"
        ]
    }
]


# ============================================================
# DIFFICULTY CONFIGURATION
# ============================================================

DIFFICULTY_ORDER = {
    "easy": 0,
    "medium": 1,
    "hard": 2
}

STRONG_PERFORMANCE = 80.0
WEAK_PERFORMANCE = 50.0


# ============================================================
# QUESTION NORMALIZATION
# ============================================================

def normalize_question(question: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensure every interview question follows the same schema.

    This prevents KeyError problems when a question is missing
    a field such as question_type.
    """

    normalized = dict(question)

    normalized.setdefault(
        "question_id",
        f"QUESTION_{random.randint(100000, 999999)}"
    )

    normalized.setdefault(
        "skill",
        "General"
    )

    normalized.setdefault(
        "difficulty",
        "medium"
    )

    normalized.setdefault(
        "question_type",
        "TECHNICAL"
    )

    normalized.setdefault(
        "question",
        ""
    )

    normalized.setdefault(
        "expected_answer",
        ""
    )

    normalized.setdefault(
        "keywords",
        []
    )

    if not isinstance(normalized["keywords"], list):
        normalized["keywords"] = list(normalized["keywords"])

    return normalized


# ============================================================
# STUDENT-SAFE QUESTION
# ============================================================

def create_student_question(
    question: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a student-facing version of an interview question.

    IMPORTANT:
    expected_answer and keywords are never exposed.
    """

    question = normalize_question(question)

    return {
        "question_id": question["question_id"],
        "skill": question["skill"],
        "difficulty": question["difficulty"],
        "question_type": question["question_type"],
        "question": question["question"]
    }


# ============================================================
# INTERNAL QUESTION
# ============================================================

def create_internal_question(
    question: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create an internal evaluator-safe question.

    This keeps the complete rubric available to the AI/ML
    evaluation layer.
    """

    question = normalize_question(question)

    return {
        "question_id": question["question_id"],
        "skill": question["skill"],
        "difficulty": question["difficulty"],
        "question_type": question["question_type"],
        "question": question["question"],
        "expected_answer": question["expected_answer"],
        "keywords": question["keywords"]
    }


# ============================================================
# NORMALIZE SKILL
# ============================================================

def normalize_skill(skill: str) -> str:
    """
    Normalize skill names.
    """

    if not skill:
        return ""

    skill = str(skill).strip().lower()

    aliases = {
        "python3": "python",
        "py": "python",
        "java programming": "java",
        "sql database": "sql",
        "object oriented programming": "oop",
        "object-oriented programming": "oop",
        "data structures": "dsa",
        "data structures and algorithms": "dsa"
    }

    return aliases.get(
        skill,
        skill
    )


# ============================================================
# GET QUESTIONS FOR SKILL
# ============================================================

def get_questions_for_skill(
    skill: str,
    difficulty: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Return questions matching skill and optional difficulty.
    """

    normalized_skill = normalize_skill(skill)

    questions = []

    for question in INTERVIEW_QUESTION_BANK:

        question = normalize_question(question)

        if normalize_skill(
            question["skill"]
        ) != normalized_skill:
            continue

        if difficulty is not None:

            if question["difficulty"] != difficulty:
                continue

        questions.append(
            create_internal_question(question)
        )

    return questions


# ============================================================
# CALCULATE NEXT DIFFICULTY
# ============================================================

def calculate_next_difficulty(
    current_difficulty: str,
    performance_percentage: float
) -> str:
    """
    Adaptive difficulty rules:

    >= 80:
        increase difficulty

    50 - 79.99:
        maintain difficulty

    < 50:
        decrease difficulty
    """

    current_level = DIFFICULTY_ORDER.get(
        current_difficulty,
        0
    )

    try:
        performance_percentage = float(
            performance_percentage
        )
    except (TypeError, ValueError):
        performance_percentage = 0.0

    performance_percentage = max(
        0.0,
        min(
            100.0,
            performance_percentage
        )
    )

    # --------------------------------------------------------
    # Strong performance
    # --------------------------------------------------------

    if performance_percentage >= STRONG_PERFORMANCE:

        next_level = min(
            current_level + 1,
            2
        )

    # --------------------------------------------------------
    # Weak performance
    # --------------------------------------------------------

    elif performance_percentage < WEAK_PERFORMANCE:

        next_level = max(
            current_level - 1,
            0
        )

    # --------------------------------------------------------
    # Average performance
    # --------------------------------------------------------

    else:

        next_level = current_level

    for difficulty, level in DIFFICULTY_ORDER.items():

        if level == next_level:
            return difficulty

    return "easy"


# ============================================================
# SELECT QUESTION
# ============================================================

def select_question(
    skills: List[str],
    difficulty: str,
    asked_question_ids: Optional[List[str]] = None
) -> Optional[Dict[str, Any]]:
    """
    Select a random question for the requested difficulty.

    Previously asked questions are excluded.
    """

    if asked_question_ids is None:
        asked_question_ids = []

    asked_set = set(
        asked_question_ids
    )

    candidate_questions = []

    normalized_skills = {
        normalize_skill(skill)
        for skill in skills
    }

    for raw_question in INTERVIEW_QUESTION_BANK:

        question = normalize_question(
            raw_question
        )

        if normalize_skill(
            question["skill"]
        ) not in normalized_skills:
            continue

        if question["difficulty"] != difficulty:
            continue

        if question["question_id"] in asked_set:
            continue

        candidate_questions.append(
            create_internal_question(question)
        )

    if not candidate_questions:
        return None

    return random.choice(
        candidate_questions
    )


# ============================================================
# INITIAL DIFFICULTY
# ============================================================

def select_initial_difficulty(
    initial_performance: Optional[float] = None
) -> str:
    """
    Select initial interview difficulty.
    """

    if initial_performance is None:
        return "medium"

    try:
        performance = float(
            initial_performance
        )
    except (TypeError, ValueError):
        return "medium"

    if performance >= STRONG_PERFORMANCE:
        return "hard"

    if performance < WEAK_PERFORMANCE:
        return "easy"

    return "medium"


# ============================================================
# ADAPTIVE INTERVIEW ENGINE
# ============================================================

class AdaptiveInterviewEngine:

    def __init__(
        self,
        student_id: str,
        job_id: str,
        required_skills: List[str],
        initial_performance: Optional[float] = None
    ):

        self.student_id = student_id
        self.job_id = job_id

        self.required_skills = required_skills

        self.current_difficulty = (
            select_initial_difficulty(
                initial_performance
            )
        )

        self.last_performance = (
            initial_performance
        )

        self.asked_question_ids = []

        self.question_history = []

    # ========================================================
    # GET NEXT QUESTION
    # ========================================================

    def get_next_question(
        self
    ) -> Optional[Dict[str, Any]]:
        """
        Generate next adaptive interview question.

        Returns the INTERNAL question because
        interview_manager.py needs the evaluation rubric.

        interview_manager.py is responsible for creating
        the student-safe version.
        """

        # ----------------------------------------------------
        # First try current difficulty
        # ----------------------------------------------------

        question = select_question(
            skills=self.required_skills,
            difficulty=self.current_difficulty,
            asked_question_ids=self.asked_question_ids
        )

        # ----------------------------------------------------
        # If unavailable, try other difficulties
        # ----------------------------------------------------

        if question is None:

            difficulties = [
                "easy",
                "medium",
                "hard"
            ]

            # Prefer closest difficulty
            difficulties.sort(
                key=lambda difficulty: abs(
                    DIFFICULTY_ORDER[difficulty]
                    -
                    DIFFICULTY_ORDER[
                        self.current_difficulty
                    ]
                )
            )

            for difficulty in difficulties:

                question = select_question(
                    skills=self.required_skills,
                    difficulty=difficulty,
                    asked_question_ids=self.asked_question_ids
                )

                if question is not None:

                    self.current_difficulty = difficulty

                    break

        # ----------------------------------------------------
        # No question available
        # ----------------------------------------------------

        if question is None:
            return None

        # ----------------------------------------------------
        # Normalize question one more time
        # ----------------------------------------------------

        question = normalize_question(
            question
        )

        # ----------------------------------------------------
        # Record question
        # ----------------------------------------------------

        question_id = question[
            "question_id"
        ]

        self.asked_question_ids.append(
            question_id
        )

        self.question_history.append({
            "question_id": question_id,
            "skill": question["skill"],
            "difficulty": question["difficulty"],
            "question_type": question["question_type"]
        })

        return question


    # ========================================================
    # RECORD PERFORMANCE
    # ========================================================

    def record_performance(
        self,
        performance_percentage: float
    ) -> str:
        """
        Update difficulty based on performance.
        """

        try:

            performance_percentage = float(
                performance_percentage
            )

        except (
            TypeError,
            ValueError
        ):

            performance_percentage = 0.0

        performance_percentage = max(
            0.0,
            min(
                100.0,
                performance_percentage
            )
        )

        self.last_performance = (
            performance_percentage
        )

        self.current_difficulty = (
            calculate_next_difficulty(
                current_difficulty=self.current_difficulty,
                performance_percentage=performance_percentage
            )
        )

        return self.current_difficulty


    # ========================================================
    # GET STATUS
    # ========================================================

    def get_status(
        self
    ) -> Dict[str, Any]:
        """
        Return current adaptive engine status.
        """

        return {
            "student_id": self.student_id,
            "job_id": self.job_id,
            "required_skills": self.required_skills,
            "current_difficulty": self.current_difficulty,
            "last_performance": self.last_performance,
            "questions_asked": len(
                self.asked_question_ids
            ),
            "question_history": self.question_history
        }


# ============================================================
# VALIDATE QUESTION BANK
# ============================================================

def validate_question_bank() -> Dict[str, Any]:
    """
    Validate the complete interview question bank.

    This is useful during development to make sure every
    question contains all required fields.
    """

    required_fields = [
        "question_id",
        "skill",
        "difficulty",
        "question_type",
        "question",
        "expected_answer",
        "keywords"
    ]

    errors = []

    question_ids = set()

    for index, raw_question in enumerate(
        INTERVIEW_QUESTION_BANK,
        start=1
    ):

        for field in required_fields:

            if field not in raw_question:

                errors.append({
                    "question_index": index,
                    "question_id": raw_question.get(
                        "question_id",
                        "UNKNOWN"
                    ),
                    "missing_field": field
                })

        question_id = raw_question.get(
            "question_id"
        )

        if question_id in question_ids:

            errors.append({
                "question_index": index,
                "question_id": question_id,
                "error": "Duplicate question_id"
            })

        if question_id:
            question_ids.add(
                question_id
            )

    return {
        "valid": len(errors) == 0,
        "total_questions": len(
            INTERVIEW_QUESTION_BANK
        ),
        "errors": errors
    }


# ============================================================
# DEMO
# ============================================================

def demo():

    print("=" * 70)
    print("ADAPTIVE INTERVIEW QUESTION ENGINE")
    print("=" * 70)

    # --------------------------------------------------------
    # Validate question bank
    # --------------------------------------------------------

    validation = validate_question_bank()

    print("\nQUESTION BANK VALIDATION")
    print("-" * 70)

    print(
        "Valid:",
        validation["valid"]
    )

    print(
        "Total questions:",
        validation["total_questions"]
    )

    if validation["errors"]:

        print(
            "Errors:",
            validation["errors"]
        )

    else:

        print(
            "All questions contain the required fields."
        )

    # --------------------------------------------------------
    # Create engine
    # --------------------------------------------------------

    engine = AdaptiveInterviewEngine(
        student_id="STU001",
        job_id="JOB001",
        required_skills=[
            "Python",
            "SQL",
            "OOP",
            "DSA"
        ]
    )

    # --------------------------------------------------------
    # Simulated performance
    # --------------------------------------------------------

    simulated_scores = [
        88,
        91,
        45,
        42,
        76,
        85
    ]

    for index, score in enumerate(
        simulated_scores,
        start=1
    ):

        print("\n" + "-" * 70)
        print(
            f"ROUND {index}"
        )
        print("-" * 70)

        print(
            "Current difficulty:",
            engine.current_difficulty
        )

        question = engine.get_next_question()

        if question is None:

            print(
                "No more questions available."
            )

            break

        # ----------------------------------------------------
        # Student-safe display
        # ----------------------------------------------------

        student_question = (
            create_student_question(
                question
            )
        )

        print(
            "Question:",
            student_question["question"]
        )

        print(
            "Skill:",
            student_question["skill"]
        )

        print(
            "Difficulty:",
            student_question["difficulty"]
        )

        print(
            "Question type:",
            student_question["question_type"]
        )

        # ----------------------------------------------------
        # Confirm evaluator fields remain internal
        # ----------------------------------------------------

        print(
            "Expected answer available internally:",
            bool(
                question.get(
                    "expected_answer"
                )
            )
        )

        print(
            "Keywords available internally:",
            bool(
                question.get(
                    "keywords"
                )
            )
        )

        print(
            "Simulated score:",
            score
        )

        next_difficulty = (
            engine.record_performance(
                score
            )
        )

        print(
            "Next difficulty:",
            next_difficulty
        )

    # --------------------------------------------------------
    # Final status
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("FINAL ENGINE STATUS")
    print("=" * 70)

    print(
        engine.get_status()
    )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    demo()