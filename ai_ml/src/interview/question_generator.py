import random


# ============================================================
# CAMPUSLINK MCQ QUESTION BANK
# ============================================================
#
# IMPORTANT:
# correct_answer and explanation are INTERNAL data.
# They must NEVER be sent to the student during the test.
#
# ============================================================

MCQ_BANK = {

    # ========================================================
    # PYTHON
    # ========================================================

    "Python": [
        {
            "question_id": "PY001",
            "skill": "Python",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question": "Which keyword is used to define a function in Python?",

            "options": [
                "A. function",
                "B. def",
                "C. define",
                "D. fun"
            ],

            "correct_answer": "B",

            "explanation":
                "The def keyword is used to define a function in Python."
        },

        {
            "question_id": "PY002",
            "skill": "Python",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which of the following is a mutable data type in Python?",

            "options": [
                "A. Tuple",
                "B. String",
                "C. List",
                "D. Integer"
            ],

            "correct_answer": "C",

            "explanation":
                "Lists are mutable, meaning their elements can be changed."
        },

        {
            "question_id": "PY003",
            "skill": "Python",
            "difficulty": "medium",
            "question_type": "MCQ",

            "question": "What is the output of len([10, 20, 30])?",

            "options": [
                "A. 2",
                "B. 3",
                "C. 4",
                "D. Error"
            ],

            "correct_answer": "B",

            "explanation":
                "The list contains three elements."
        },

        {
            "question_id": "PY004",
            "skill": "Python",
            "difficulty": "medium",
            "question_type": "MCQ",

            "question":
                "Which data structure stores key-value pairs in Python?",

            "options": [
                "A. List",
                "B. Tuple",
                "C. Set",
                "D. Dictionary"
            ],

            "correct_answer": "D",

            "explanation":
                "A Python dictionary stores data as key-value pairs."
        },

        {
            "question_id": "PY005",
            "skill": "Python",
            "difficulty": "hard",
            "question_type": "MCQ",

            "question":
                "Which concept allows a function to remember variables from its enclosing scope?",

            "options": [
                "A. Inheritance",
                "B. Closure",
                "C. Polymorphism",
                "D. Encapsulation"
            ],

            "correct_answer": "B",

            "explanation":
                "A closure allows an inner function to retain access to variables from its enclosing scope."
        }
    ],


    # ========================================================
    # JAVA
    # ========================================================

    "Java": [
        {
            "question_id": "JAVA001",
            "skill": "Java",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which keyword is used to create an object in Java?",

            "options": [
                "A. create",
                "B. object",
                "C. new",
                "D. class"
            ],

            "correct_answer": "C",

            "explanation":
                "The new keyword is used to create objects in Java."
        },

        {
            "question_id": "JAVA002",
            "skill": "Java",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which method is the entry point of a Java application?",

            "options": [
                "A. start()",
                "B. main()",
                "C. run()",
                "D. execute()"
            ],

            "correct_answer": "B",

            "explanation":
                "Execution of a standard Java application begins with main()."
        },

        {
            "question_id": "JAVA003",
            "skill": "Java",
            "difficulty": "medium",
            "question_type": "MCQ",

            "question":
                "Which concept allows a Java class to inherit properties from another class?",

            "options": [
                "A. Encapsulation",
                "B. Inheritance",
                "C. Abstraction",
                "D. Compilation"
            ],

            "correct_answer": "B",

            "explanation":
                "Inheritance allows one class to acquire properties and methods of another class."
        }
    ],


    # ========================================================
    # SQL
    # ========================================================

    "SQL": [
        {
            "question_id": "SQL001",
            "skill": "SQL",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which SQL command is used to retrieve data from a table?",

            "options": [
                "A. GET",
                "B. SELECT",
                "C. FETCH",
                "D. READ"
            ],

            "correct_answer": "B",

            "explanation":
                "SELECT is used to retrieve data from database tables."
        },

        {
            "question_id": "SQL002",
            "skill": "SQL",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which SQL command is used to remove records from a table?",

            "options": [
                "A. REMOVE",
                "B. DELETE",
                "C. DROP",
                "D. CLEAR"
            ],

            "correct_answer": "B",

            "explanation":
                "DELETE removes records from a table."
        },

        {
            "question_id": "SQL003",
            "skill": "SQL",
            "difficulty": "medium",
            "question_type": "MCQ",

            "question":
                "Which clause is used to filter rows in SQL?",

            "options": [
                "A. FILTER",
                "B. WHERE",
                "C. HAVING",
                "D. CONDITION"
            ],

            "correct_answer": "B",

            "explanation":
                "WHERE filters rows according to a specified condition."
        },

        {
            "question_id": "SQL004",
            "skill": "SQL",
            "difficulty": "hard",
            "question_type": "MCQ",

            "question":
                "Which SQL operation combines rows from two or more tables based on a related column?",

            "options": [
                "A. JOIN",
                "B. MERGE",
                "C. UNION",
                "D. GROUP"
            ],

            "correct_answer": "A",

            "explanation":
                "JOIN combines related rows from multiple tables."
        }
    ],


    # ========================================================
    # OOP
    # ========================================================

    "OOP": [
        {
            "question_id": "OOP001",
            "skill": "OOP",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which OOP concept hides internal implementation details?",

            "options": [
                "A. Abstraction",
                "B. Inheritance",
                "C. Polymorphism",
                "D. Compilation"
            ],

            "correct_answer": "A",

            "explanation":
                "Abstraction hides unnecessary implementation details."
        },

        {
            "question_id": "OOP002",
            "skill": "OOP",
            "difficulty": "medium",
            "question_type": "MCQ",

            "question":
                "Which OOP concept allows the same interface to have different implementations?",

            "options": [
                "A. Encapsulation",
                "B. Polymorphism",
                "C. Inheritance",
                "D. Abstraction"
            ],

            "correct_answer": "B",

            "explanation":
                "Polymorphism allows the same interface or method to behave differently."
        }
    ],


    # ========================================================
    # DSA
    # ========================================================

    "DSA": [
        {
            "question_id": "DSA001",
            "skill": "DSA",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which data structure follows FIFO?",

            "options": [
                "A. Stack",
                "B. Queue",
                "C. Tree",
                "D. Graph"
            ],

            "correct_answer": "B",

            "explanation":
                "A queue follows First In, First Out."
        },

        {
            "question_id": "DSA002",
            "skill": "DSA",
            "difficulty": "easy",
            "question_type": "MCQ",

            "question":
                "Which data structure follows LIFO?",

            "options": [
                "A. Queue",
                "B. Stack",
                "C. Linked List",
                "D. Graph"
            ],

            "correct_answer": "B",

            "explanation":
                "A stack follows Last In, First Out."
        },

        {
            "question_id": "DSA003",
            "skill": "DSA",
            "difficulty": "medium",
            "question_type": "MCQ",

            "question":
                "What is the average time complexity of binary search on a sorted array?",

            "options": [
                "A. O(n)",
                "B. O(n²)",
                "C. O(log n)",
                "D. O(1)"
            ],

            "correct_answer": "C",

            "explanation":
                "Binary search eliminates approximately half of the search space at each step."
        }
    ]
}


# ============================================================
# SKILL NORMALIZATION
# ============================================================

def normalize_skill(skill):
    """
    Convert different skill names to the names
    used in MCQ_BANK.
    """

    if not isinstance(skill, str):
        return ""

    skill = skill.strip().lower()

    aliases = {

        "python programming": "Python",
        "python": "Python",

        "java programming": "Java",
        "java": "Java",

        "sql": "SQL",
        "mysql": "SQL",
        "postgresql": "SQL",

        "object oriented programming": "OOP",
        "object-oriented programming": "OOP",
        "oop": "OOP",

        "data structures": "DSA",
        "data structures and algorithms": "DSA",
        "dsa": "DSA"
    }

    return aliases.get(skill, skill.title())


# ============================================================
# GET QUESTIONS FOR A SKILL
# ============================================================

def get_questions_for_skill(skill):
    """
    Return a copy of the MCQ bank for one skill.
    """

    normalized_skill = normalize_skill(skill)

    questions = MCQ_BANK.get(normalized_skill, [])

    return questions.copy()


# ============================================================
# GENERATE MCQs
# ============================================================

def generate_questions(
    skills,
    questions_per_skill=2,
    difficulty=None
):
    """
    Generate MCQs for the supplied skills.

    correct_answer remains inside the returned internal
    question object.

    The student-facing selector will remove it.
    """

    if not skills:
        return []

    generated_questions = []

    for skill in skills:

        normalized_skill = normalize_skill(skill)

        available_questions = get_questions_for_skill(
            normalized_skill
        )

        if difficulty:

            available_questions = [
                question
                for question in available_questions
                if question["difficulty"].lower()
                == difficulty.lower()
            ]

        if not available_questions:
            continue

        random.shuffle(available_questions)

        selected_questions = available_questions[
            :questions_per_skill
        ]

        generated_questions.extend(selected_questions)

    random.shuffle(generated_questions)

    return generated_questions


# ============================================================
# CREATE STUDENT-SAFE QUESTION
# ============================================================

def create_student_question(question):
    """
    Remove internal answer information.

    This object can safely be sent to the student.

    The student will NOT receive:
        - correct_answer
        - explanation
    """

    return {
        "question_id": question["question_id"],
        "skill": question["skill"],
        "difficulty": question["difficulty"],
        "question_type": question["question_type"],
        "question": question["question"],
        "options": question["options"]
    }


# ============================================================
# CREATE RECRUITER RESULT QUESTION
# ============================================================

def create_evaluation_question(question, student_answer=None):
    """
    Create an evaluation object.

    This object is for backend/recruiter/admin use.

    It contains the correct answer and evaluation result.
    """

    correct_answer = question["correct_answer"]

    is_correct = False

    if student_answer is not None:

        is_correct = (
            str(student_answer).strip().upper()
            == str(correct_answer).strip().upper()
        )

    return {
        "question_id": question["question_id"],
        "skill": question["skill"],
        "difficulty": question["difficulty"],
        "question_type": question["question_type"],
        "question": question["question"],
        "options": question["options"],

        "student_answer": student_answer,

        "correct_answer": correct_answer,

        "is_correct": is_correct,

        "explanation": question["explanation"]
    }


# ============================================================
# PRINT STUDENT VIEW
# ============================================================

def print_student_questions(questions):
    """
    Print only the information that a student should see.
    """

    print("\n")
    print("=" * 70)
    print("CAMPUSLINK MCQ TEST")
    print("=" * 70)

    for number, question in enumerate(questions, start=1):

        student_question = create_student_question(question)

        print()
        print(f"Question {number}")
        print(f"Skill      : {student_question['skill']}")
        print(f"Difficulty : {student_question['difficulty']}")
        print(f"Type       : {student_question['question_type']}")

        print()
        print(student_question["question"])

        for option in student_question["options"]:
            print(option)

        print("-" * 70)


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    skills = [
        "Python",
        "SQL",
        "OOP",
        "DSA"
    ]

    questions = generate_questions(
        skills=skills,
        questions_per_skill=2
    )

    print_student_questions(questions)

    print()
    print("=" * 70)
    print("INTERNAL DATA CHECK")
    print("=" * 70)

    print("Correct answers are stored internally.")
    print("They are NOT displayed in the student view.")
# ============================================================
# CAMPUSLINK AI INTERVIEW QUESTION BANK
# ============================================================
#
# These are OPEN-ENDED interview questions.
# They are different from the MCQ assessment bank above.
#
# Student receives:
#   question_id
#   skill
#   difficulty
#   question
#
# Internal systems may also use the complete question object.
# ============================================================

INTERVIEW_QUESTION_BANK = [

    # ========================================================
    # PYTHON
    # ========================================================

    {
        "question_id": "INT-PY-001",
        "skill": "Python",
        "difficulty": "easy",
        "question_type": "INTERVIEW",
        "question": "What are the main differences between a list and a tuple in Python?"
    },

    {
        "question_id": "INT-PY-002",
        "skill": "Python",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "Explain how exception handling works in Python and when you would use try, except, else, and finally."
    },

    {
        "question_id": "INT-PY-003",
        "skill": "Python",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "What is a Python decorator, and where would you use one in a real project?"
    },

    {
        "question_id": "INT-PY-004",
        "skill": "Python",
        "difficulty": "hard",
        "question_type": "INTERVIEW",
        "question": "Explain how Python manages memory and garbage collection at a high level."
    },

    # ========================================================
    # SQL
    # ========================================================

    {
        "question_id": "INT-SQL-001",
        "skill": "SQL",
        "difficulty": "easy",
        "question_type": "INTERVIEW",
        "question": "What is the difference between a primary key and a foreign key?"
    },

    {
        "question_id": "INT-SQL-002",
        "skill": "SQL",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "Explain the difference between INNER JOIN and LEFT JOIN with an example."
    },

    {
        "question_id": "INT-SQL-003",
        "skill": "SQL",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "How would you find duplicate records in a SQL table?"
    },

    {
        "question_id": "INT-SQL-004",
        "skill": "SQL",
        "difficulty": "hard",
        "question_type": "INTERVIEW",
        "question": "What is a database index and how can it improve query performance?"
    },

    # ========================================================
    # OOP
    # ========================================================

    {
        "question_id": "INT-OOP-001",
        "skill": "OOP",
        "difficulty": "easy",
        "question_type": "INTERVIEW",
        "question": "What are the four major principles of object-oriented programming?"
    },

    {
        "question_id": "INT-OOP-002",
        "skill": "OOP",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "Explain inheritance and polymorphism with a practical example."
    },

    {
        "question_id": "INT-OOP-003",
        "skill": "OOP",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "What is encapsulation and why is it useful in software design?"
    },

    {
        "question_id": "INT-OOP-004",
        "skill": "OOP",
        "difficulty": "hard",
        "question_type": "INTERVIEW",
        "question": "Explain the difference between abstraction and encapsulation."
    },

    # ========================================================
    # DSA
    # ========================================================

    {
        "question_id": "INT-DSA-001",
        "skill": "DSA",
        "difficulty": "easy",
        "question_type": "INTERVIEW",
        "question": "What is the difference between a stack and a queue?"
    },

    {
        "question_id": "INT-DSA-002",
        "skill": "DSA",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "Explain the time complexity of binary search and why it is efficient."
    },

    {
        "question_id": "INT-DSA-003",
        "skill": "DSA",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "When would you choose a hash table instead of a list?"
    },

    {
        "question_id": "INT-DSA-004",
        "skill": "DSA",
        "difficulty": "hard",
        "question_type": "INTERVIEW",
        "question": "How would you approach solving a problem when the input size is very large?"
    },

    # ========================================================
    # JAVA
    # ========================================================

    {
        "question_id": "INT-JAVA-001",
        "skill": "Java",
        "difficulty": "easy",
        "question_type": "INTERVIEW",
        "question": "What is the difference between a class and an object in Java?"
    },

    {
        "question_id": "INT-JAVA-002",
        "skill": "Java",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "Explain method overloading and method overriding in Java."
    },

    {
        "question_id": "INT-JAVA-003",
        "skill": "Java",
        "difficulty": "medium",
        "question_type": "INTERVIEW",
        "question": "What is the purpose of an interface in Java?"
    },

    {
        "question_id": "INT-JAVA-004",
        "skill": "Java",
        "difficulty": "hard",
        "question_type": "INTERVIEW",
        "question": "Explain the difference between checked and unchecked exceptions in Java."
    }
]


# ============================================================
# LOAD INTERVIEW QUESTION BANK
# ============================================================

def load_question_bank():
    """
    Return the complete OPEN-ENDED interview question bank.

    interview_service.py expects a list.
    """

    return [
        dict(question)
        for question in INTERVIEW_QUESTION_BANK
    ]


# ============================================================
# NORMALIZE INTERVIEW SKILL
# ============================================================

def normalize_interview_skill(skill):
    """
    Normalize skill names used by student/job profiles.
    """

    if not isinstance(skill, str):
        return ""

    value = skill.strip().lower()

    aliases = {
        "python programming": "Python",
        "python": "Python",

        "java programming": "Java",
        "java": "Java",

        "sql": "SQL",
        "mysql": "SQL",
        "postgresql": "SQL",

        "object oriented programming": "OOP",
        "object-oriented programming": "OOP",
        "oop": "OOP",

        "data structures": "DSA",
        "data structures and algorithms": "DSA",
        "dsa": "DSA"
    }

    return aliases.get(
        value,
        value.title()
    )


# ============================================================
# GET INTERVIEW QUESTIONS FOR SKILL
# ============================================================

def get_interview_questions_for_skill(skill):
    """
    Return interview questions for one skill.
    """

    normalized_skill = normalize_interview_skill(
        skill
    )

    return [
        dict(question)
        for question in INTERVIEW_QUESTION_BANK
        if normalize_interview_skill(
            question.get("skill", "")
        ) == normalized_skill
    ]


# ============================================================
# EXTRACT STUDENT SKILLS
# ============================================================

def _extract_student_skills(student):
    """
    Extract technical skills from different possible
    student profile structures.
    """

    if not isinstance(student, dict):
        return []

    possible_fields = [
        "skills",
        "technical_skills",
        "programming_languages",
        "languages",
    ]

    skills = []

    for field in possible_fields:

        value = student.get(field, [])

        if isinstance(value, str):
            value = [value]

        if isinstance(value, list):

            for skill in value:

                if isinstance(skill, str):
                    normalized = normalize_interview_skill(
                        skill
                    )

                    if normalized:
                        skills.append(
                            normalized
                        )

    return list(
        dict.fromkeys(skills)
    )


# ============================================================
# EXTRACT JOB SKILLS
# ============================================================

def _extract_job_skills(job):
    """
    Extract required skills from a job profile.
    """

    if not isinstance(job, dict):
        return []

    possible_fields = [
        "required_skills",
        "technical_skills",
        "skills",
        "required_languages",
    ]

    skills = []

    for field in possible_fields:

        value = job.get(field, [])

        if isinstance(value, str):
            value = [value]

        if isinstance(value, list):

            for skill in value:

                if isinstance(skill, str):
                    normalized = normalize_interview_skill(
                        skill
                    )

                    if normalized:
                        skills.append(
                            normalized
                        )

    return list(
        dict.fromkeys(skills)
    )


# ============================================================
# GENERATE INTERVIEW QUESTIONS FOR JOB
# ============================================================

def generate_interview_for_job(
    job,
    student,
    question_count=10,
    seed=None,
    question_bank=None
):
    """
    Generate open-ended interview questions based on
    student skills and job requirements.

    Parameters
    ----------
    job:
        Job profile dictionary.

    student:
        Student profile dictionary.

    question_count:
        Maximum number of questions to return.

    seed:
        Optional random seed.

    question_bank:
        Optional externally supplied interview bank.

    Returns
    -------
    list
        Internal interview question objects.
    """

    if question_count <= 0:
        return []

    if question_bank is None:
        question_bank = load_question_bank()

    if not isinstance(question_bank, list):
        return []

    # --------------------------------------------------------
    # Extract relevant skills
    # --------------------------------------------------------

    student_skills = _extract_student_skills(
        student
    )

    job_skills = _extract_job_skills(
        job
    )

    # --------------------------------------------------------
    # Prefer job skills.
    # Then include student's skills.
    # --------------------------------------------------------

    relevant_skills = []

    for skill in job_skills + student_skills:

        normalized = normalize_interview_skill(
            skill
        )

        if normalized and normalized not in relevant_skills:
            relevant_skills.append(
                normalized
            )

    # --------------------------------------------------------
    # If no skills are available, use all bank skills.
    # --------------------------------------------------------

    if not relevant_skills:

        relevant_skills = list(
            dict.fromkeys(
                normalize_interview_skill(
                    question.get("skill", "")
                )
                for question in question_bank
                if question.get("skill")
            )
        )

    # --------------------------------------------------------
    # Filter relevant questions
    # --------------------------------------------------------

    candidate_questions = []

    for question in question_bank:

        if not isinstance(question, dict):
            continue

        question_skill = normalize_interview_skill(
            question.get("skill", "")
        )

        if question_skill in relevant_skills:

            candidate_questions.append(
                dict(question)
            )

    # --------------------------------------------------------
    # Fallback to complete bank
    # --------------------------------------------------------

    if not candidate_questions:

        candidate_questions = [
            dict(question)
            for question in question_bank
            if isinstance(question, dict)
        ]

    # --------------------------------------------------------
    # Remove duplicate IDs
    # --------------------------------------------------------

    unique_questions = {}

    for question in candidate_questions:

        question_id = question.get(
            "question_id"
        )

        if question_id and question_id not in unique_questions:

            unique_questions[
                question_id
            ] = question

    candidate_questions = list(
        unique_questions.values()
    )

    # --------------------------------------------------------
    # Random selection
    # --------------------------------------------------------

    rng = random.Random(seed)

    rng.shuffle(
        candidate_questions
    )

    # --------------------------------------------------------
    # Try to maintain skill diversity.
    # --------------------------------------------------------

    selected_questions = []
    used_skills = set()

    # First pass: one question per skill.
    for question in candidate_questions:

        if len(selected_questions) >= question_count:
            break

        skill = normalize_interview_skill(
            question.get("skill", "")
        )

        if skill not in used_skills:

            selected_questions.append(
                question
            )

            used_skills.add(
                skill
            )

    # Second pass: fill remaining slots.
    selected_ids = {
        question.get("question_id")
        for question in selected_questions
    }

    for question in candidate_questions:

        if len(selected_questions) >= question_count:
            break

        if question.get("question_id") in selected_ids:
            continue

        selected_questions.append(
            question
        )

        selected_ids.add(
            question.get("question_id")
        )

    rng.shuffle(
        selected_questions
    )

    return selected_questions[
        :question_count
    ]


# ============================================================
# STUDENT-SAFE INTERVIEW QUESTION
# ============================================================

def create_student_interview_question(question):
    """
    Return only information that the student should receive.
    """

    if not isinstance(question, dict):
        return {}

    return {
        "question_id":
            question.get("question_id"),

        "skill":
            question.get("skill"),

        "difficulty":
            question.get("difficulty"),

        "question_type":
            question.get(
                "question_type",
                "INTERVIEW"
            ),

        "question":
            question.get("question")
    }


# ============================================================
# INTERVIEW QUESTION DEMO
# ============================================================

def print_interview_questions(questions):
    """
    Print generated interview questions.
    """

    print()
    print("=" * 70)
    print("CAMPUSLINK AI INTERVIEW QUESTIONS")
    print("=" * 70)

    for index, question in enumerate(
        questions,
        start=1
    ):

        safe_question = (
            create_student_interview_question(
                question
            )
        )

        print()
        print(
            f"Question {index}"
        )

        print(
            f"ID         : "
            f"{safe_question.get('question_id')}"
        )

        print(
            f"Skill      : "
            f"{safe_question.get('skill')}"
        )

        print(
            f"Difficulty : "
            f"{safe_question.get('difficulty')}"
        )

        print(
            f"Question   : "
            f"{safe_question.get('question')}"
        )

        print("-" * 70)
