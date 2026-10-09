import sys
from pathlib import Path
from pprint import pprint


# ============================================================
# PATH SETUP
# ============================================================

ROOT_DIR = Path(__file__).resolve().parent

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


# ============================================================
# IMPORTS
# ============================================================

from src.matching.job_matching import (
    match_student_to_job,
    match_student_to_jobs,
    get_eligible_jobs,
)

from src.tests.test_engine import MCQTestEngine

from src.interview.interview_manager import (
    InterviewSessionManager,
)

from src.interview.performance_score import (
    analyze_interview_performance,
)

from src.interview.feedback_generator import (
    generate_complete_feedback,
)

from src.interview.final_evaluation import (
    generate_final_evaluation,
)

from src.monitoring.camera_monitor import (
    CameraMonitor,
)


# ============================================================
# SAMPLE STUDENT
# ============================================================

STUDENT = {
    "student_id": "STU001",
    "name": "Debais Das",
    "degree": "B.Tech",
    "cgpa": 8.5,
    "experience_years": 1,
    "languages": [
        "Python",
        "Java",
    ],
    "skills": [
        "Python",
        "Java",
        "SQL",
        "OOP",
        "DSA",
    ],
}


# ============================================================
# SAMPLE JOB
# ============================================================

JOB = {
    "job_id": "JOB001",
    "company_id": "COMP001",
    "job_title": "Software Developer",
    "required_degree": "B.Tech",
    "minimum_cgpa": 7.0,
    "required_experience": 0,
    "required_languages": [
        "Python",
        "Java",
    ],
    "required_skills": [
        "Python",
        "Java",
        "SQL",
        "OOP",
        "DSA",
    ],
}


# ============================================================
# SAMPLE JOBS
# ============================================================

JOBS = [
    JOB,

    {
        "job_id": "JOB002",
        "company_id": "COMP002",
        "job_title": "Python Developer",
        "required_degree": "B.Tech",
        "minimum_cgpa": 7.0,
        "required_experience": 0,
        "required_languages": [
            "Python",
        ],
        "required_skills": [
            "Python",
            "SQL",
            "OOP",
        ],
    },

    {
        "job_id": "JOB003",
        "company_id": "COMP003",
        "job_title": "Java Developer",
        "required_degree": "B.Tech",
        "minimum_cgpa": 7.0,
        "required_experience": 0,
        "required_languages": [
            "Java",
        ],
        "required_skills": [
            "Java",
            "OOP",
            "DSA",
        ],
    },
]


# ============================================================
# MCQ HELPER
# ============================================================

def extract_option_letter(option):

    if option is None:
        return None

    text = str(option).strip()

    if not text:
        return None

    first_character = text[0].upper()

    if first_character in ["A", "B", "C", "D"]:
        return first_character

    return None


# ============================================================
# INTERVIEW QUESTION HELPER
# ============================================================

def extract_interview_question(response):

    if response is None:
        return None

    if not isinstance(response, dict):
        return None

    if "question_id" in response:
        return response

    question = response.get("question")

    if isinstance(question, dict):

        if "question_id" in question:
            return question

    data = response.get("data")

    if isinstance(data, dict):

        if "question_id" in data:
            return data

        question = data.get("question")

        if isinstance(question, dict):

            if "question_id" in question:
                return question

    result = response.get("result")

    if isinstance(result, dict):

        if "question_id" in result:
            return result

        question = result.get("question")

        if isinstance(question, dict):

            if "question_id" in question:
                return question

    return None


# ============================================================
# INTERVIEW SAMPLE ANSWER
# ============================================================

def generate_sample_interview_answer(question):

    if not isinstance(question, dict):

        return (
            "I would explain the concept clearly "
            "and provide a practical example."
        )

    skill = str(
        question.get("skill", "")
    ).lower()

    question_text = str(
        question.get("question", "")
    ).lower()

    if "sql" in skill:

        if (
            "where" in question_text
            and "having" in question_text
        ):

            return (
                "WHERE filters rows before grouping, "
                "while HAVING filters grouped results "
                "after GROUP BY."
            )

        if "join" in question_text:

            return (
                "JOIN combines rows from two or more "
                "tables using a related column or condition."
            )

        return (
            "SQL is used to query and manipulate "
            "data in relational databases."
        )

    if "python" in skill:

        return (
            "Python is a high-level programming language "
            "used for general purpose software development."
        )

    if "java" in skill:

        return (
            "Java is an object-oriented programming language "
            "that uses classes and objects."
        )

    if "oop" in skill:

        return (
            "Object oriented programming organizes software "
            "using classes and objects and supports abstraction, "
            "encapsulation, inheritance and polymorphism."
        )

    if "dsa" in skill:

        return (
            "Data structures organize data efficiently and "
            "algorithms define the steps used to solve problems."
        )

    return (
        "I would explain the concept clearly, describe how "
        "it works and provide a practical example."
    )


# ============================================================
# 1. JOB MATCHING
# ============================================================

def test_job_matching():

    print("\n" + "=" * 70)
    print("1. JOB MATCHING")
    print("=" * 70)

    print("Student:")
    print(STUDENT["name"])

    print("\nJob:")
    print(JOB["job_title"])

    result = match_student_to_job(
        student=STUDENT,
        job=JOB,
    )

    print("\nMatching Result:")
    pprint(result)

    return result


# ============================================================
# 2. JOB RECOMMENDATION
# ============================================================

def test_job_recommendation():

    print("\n" + "=" * 70)
    print("2. JOB RECOMMENDATION")
    print("=" * 70)

    results = match_student_to_jobs(
        student=STUDENT,
        jobs=JOBS,
    )

    print("Recommended Jobs:")
    pprint(results)

    return results


# ============================================================
# 3. ELIGIBLE JOBS
# ============================================================

def test_eligible_jobs():

    print("\n" + "=" * 70)
    print("3. ELIGIBLE JOBS")
    print("=" * 70)

    results = get_eligible_jobs(
        student=STUDENT,
        jobs=JOBS,
    )

    print("Eligible Jobs:")
    pprint(results)

    return results


# ============================================================
# 4. MCQ TEST
# ============================================================

def test_mcq():

    print("\n" + "=" * 70)
    print("4. MCQ TEST")
    print("=" * 70)

    print("Generating MCQ test...")

    engine = MCQTestEngine(
        student_id=STUDENT["student_id"],
        student_name=STUDENT["name"],
        skills=[
            "Python",
            "Java",
            "JavaScript",
            "SQL",
            "OOP",
            "DSA",
        ],
        test_type="SELF_ASSESSMENT",
        total_questions=5,
    )

    generated = engine.generate_test()

    print("\nGenerated Test:")
    pprint(generated)

    print("\nStarting test...")

    student_test = engine.start()

    print("\nStudent Test:")
    pprint(student_test)

    questions = []

    if isinstance(student_test, dict):

        possible_questions = student_test.get(
            "questions"
        )

        if isinstance(
            possible_questions,
            list,
        ):

            questions = possible_questions

        elif isinstance(
            student_test.get("test"),
            dict,
        ):

            possible_questions = (
                student_test["test"].get(
                    "questions"
                )
            )

            if isinstance(
                possible_questions,
                list,
            ):

                questions = possible_questions

    elif isinstance(
        student_test,
        list,
    ):

        questions = student_test

    print(
        "\nNumber of Questions:",
        len(questions),
    )

    if not questions:

        print("No MCQ questions found.")

        return None

    for index, question in enumerate(
        questions,
        start=1,
    ):

        question_id = question.get(
            "question_id"
        )

        options = question.get(
            "options",
            [],
        )

        selected_answer = None

        if options:

            selected_answer = (
                extract_option_letter(
                    options[0]
                )
            )

        if selected_answer is None:

            selected_answer = "A"

        print(
            f"\nSubmitting MCQ answer "
            f"{index}: {question_id}"
        )

        print(
            "Selected Answer:",
            selected_answer,
        )

        engine.submit_answer(
            question_id=question_id,
            answer=selected_answer,
        )

    print(
        "\nSubmitting complete MCQ test..."
    )

    result = engine.submit_test()

    print("\nMCQ Test Result:")
    pprint(result)

    return result


# ============================================================
# 5. AI INTERVIEW
# ============================================================

def test_interview():

    print("\n" + "=" * 70)
    print("5. AI INTERVIEW")
    print("=" * 70)

    manager = InterviewSessionManager(
        student_id=STUDENT["student_id"],
        job_id=JOB["job_id"],
        recruiter_id="REC001",
        required_skills=JOB["required_skills"],
        total_questions=5,
    )

    print("Starting interview...")

    start_result = manager.start_interview()

    print("\nInterview Started:")
    pprint(start_result)

    if not isinstance(
        start_result,
        dict,
    ):

        print(
            "Invalid interview start response."
        )

        return None

    interview_id = start_result.get(
        "interview_id"
    )

    if not interview_id:

        interview_id = getattr(
            manager,
            "interview_id",
            None,
        )

    print(
        "\nInterview ID:",
        interview_id,
    )

    for index in range(1, 6):

        print("\n" + "-" * 60)
        print(
            f"INTERVIEW QUESTION {index}"
        )
        print("-" * 60)

        raw_question = (
            manager.get_next_question()
        )

        print(
            "\nRaw Question Response:"
        )

        pprint(raw_question)

        question = (
            extract_interview_question(
                raw_question
            )
        )

        if question is None:

            print(
                "Could not extract "
                "interview question."
            )

            break

        question_id = question.get(
            "question_id"
        )

        question_text = question.get(
            "question"
        )

        print(
            "\nQuestion ID:",
            question_id,
        )

        print(
            "Question:",
            question_text,
        )

        if not question_id:

            print(
                "Question ID missing."
            )

            break

        answer = (
            generate_sample_interview_answer(
                question
            )
        )

        print("\nSample Answer:")
        print(answer)

        try:

            answer_result = (
                manager.submit_answer(
                    question_id=question_id,
                    answer=answer,
                )
            )

        except TypeError:

            answer_result = (
                manager.submit_answer(
                    question_id,
                    answer,
                )
            )

        print(
            "\nAnswer Submission Result:"
        )

        pprint(answer_result)

    print(
        "\nCompleting interview..."
    )

    completion = (
        manager.complete_interview()
    )

    print(
        "\nInterview Completion Result:"
    )

    pprint(completion)

    return manager


# ============================================================
# 6. INTERVIEW PERFORMANCE
# ============================================================

def test_interview_performance(
    manager,
):

    print("\n" + "=" * 70)
    print("6. INTERVIEW PERFORMANCE")
    print("=" * 70)

    if manager is None:

        print(
            "Interview manager is not available."
        )

        return None

    try:

        interview_result = (
            manager.get_recruiter_result()
        )

    except Exception as error:

        print(
            "Could not get recruiter "
            "interview result:"
        )

        print(error)

        return None

    print("\nInterview Result:")
    pprint(interview_result)

    performance_source = (
        interview_result
    )

    if isinstance(
        interview_result,
        dict,
    ):

        if isinstance(
            interview_result.get(
                "performance"
            ),
            dict,
        ):

            performance_source = (
                interview_result["performance"]
            )

        elif isinstance(
            interview_result.get(
                "result"
            ),
            dict,
        ):

            performance_source = (
                interview_result["result"]
            )

    try:

        performance = (
            analyze_interview_performance(
                performance_source
            )
        )

    except Exception as error:

        print(
            "\nPerformance analyzer "
            "could not directly process "
            "the result."
        )

        print(
            "Error:",
            error,
        )

        performance = None

    print(
        "\nPerformance Analysis:"
    )

    pprint(performance)

    return performance


# ============================================================
# 7. INTERVIEW FEEDBACK
# ============================================================

def test_interview_feedback(
    manager,
):

    print("\n" + "=" * 70)
    print("7. INTERVIEW FEEDBACK")
    print("=" * 70)

    if manager is None:

        print(
            "Interview manager is not available."
        )

        return None

    try:

        interview_result = (
            manager.get_recruiter_result()
        )

    except Exception as error:

        print(
            "Could not retrieve "
            "interview result:"
        )

        print(error)

        interview_result = {}

    performance = {}

    if isinstance(
        interview_result,
        dict,
    ):

        if isinstance(
            interview_result.get(
                "performance"
            ),
            dict,
        ):

            performance = (
                interview_result["performance"]
            )

        elif isinstance(
            interview_result.get(
                "result"
            ),
            dict,
        ):

            performance = (
                interview_result["result"]
            )

    try:

        feedback = (
            generate_complete_feedback(
                performance
            )
        )

    except TypeError:

        try:

            feedback = (
                generate_complete_feedback(
                    interview_result
                )
            )

        except Exception as error:

            print(
                "Feedback generation failed:"
            )

            print(error)

            feedback = None

    except Exception as error:

        print(
            "Feedback generation failed:"
        )

        print(error)

        feedback = None

    print("\nGenerated Feedback:")
    pprint(feedback)

    return feedback


# ============================================================
# 8. FINAL EVALUATION
# ============================================================

def test_final_evaluation():

    print("\n" + "=" * 70)
    print("8. FINAL EVALUATION")
    print("=" * 70)

    eligibility_score = 85.0
    job_match_score = 78.0
    interview_score = 72.0

    print(
        "Eligibility Score:",
        eligibility_score,
    )

    print(
        "Job Match Score:",
        job_match_score,
    )

    print(
        "Interview Score:",
        interview_score,
    )

    try:

        result = generate_final_evaluation(
            eligibility_score=eligibility_score,
            job_match_score=job_match_score,
            interview_score=interview_score,
        )

    except TypeError as error:

        print(
            "\nFinal evaluation error:"
        )

        print(error)

        result = None

    print(
        "\nFinal Evaluation Result:"
    )

    pprint(result)

    return result


# ============================================================
# 9. CAMERA MONITORING
# ============================================================

def test_monitoring():

    print("\n" + "=" * 70)
    print("9. CAMERA MONITORING")
    print("=" * 70)

    interview_id = (
        "INTERVIEW_MONITOR_001"
    )

    student_id = (
        STUDENT["student_id"]
    )

    monitor = CameraMonitor(
        interview_id=interview_id,
        student_id=student_id,
    )

    print(
        "\nCamera monitor created successfully."
    )

    # --------------------------------------------------------
    # START
    # --------------------------------------------------------

    try:

        start_result = monitor.start()

    except AttributeError:

        start_result = (
            monitor.start_monitoring()
        )

    print(
        "\nMonitoring Started:"
    )

    pprint(start_result)

    # --------------------------------------------------------
    # OBSERVATION 1
    #
    # IMPORTANT:
    # process_test_observation() does not accept position.
    # --------------------------------------------------------

    print(
        "\nProcessing observation 1..."
    )

    try:

        observation_result = (
            monitor.process_test_observation(
                face_count=1
            )
        )

    except AttributeError:

        try:

            observation_result = (
                monitor.process_frame(
                    face_count=1
                )
            )

        except TypeError:

            observation_result = (
                monitor.process_frame(
                    {
                        "face_count": 1
                    }
                )
            )

    print(
        "Observation Result:"
    )

    pprint(observation_result)

    # --------------------------------------------------------
    # OBSERVATION 2
    # --------------------------------------------------------

    print(
        "\nProcessing observation 2..."
    )

    try:

        observation_result = (
            monitor.process_test_observation(
                face_count=1
            )
        )

    except AttributeError:

        try:

            observation_result = (
                monitor.process_frame(
                    face_count=1
                )
            )

        except TypeError:

            observation_result = (
                monitor.process_frame(
                    {
                        "face_count": 1
                    }
                )
            )

    print(
        "Observation Result:"
    )

    pprint(observation_result)

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    try:

        summary = (
            monitor.get_summary()
        )

    except AttributeError:

        summary = None

    print(
        "\nMonitoring Summary:"
    )

    pprint(summary)

    # --------------------------------------------------------
    # STOP
    # --------------------------------------------------------

    try:

        stop_result = monitor.stop()

    except AttributeError:

        stop_result = (
            monitor.stop_monitoring()
        )

    print(
        "\nMonitoring Stopped:"
    )

    pprint(stop_result)

    return summary


# ============================================================
# MAIN
# ============================================================

def main():

    print("\n" + "#" * 70)
    print(
        "# CAMPUSLINK AI/ML COMPLETE PIPELINE TEST"
    )
    print("#" * 70)

    try:

        # 1
        test_job_matching()

        # 2
        test_job_recommendation()

        # 3
        test_eligible_jobs()

        # 4
        test_mcq()

        # 5
        interview_manager = (
            test_interview()
        )

        # 6
        test_interview_performance(
            interview_manager
        )

        # 7
        test_interview_feedback(
            interview_manager
        )

        # 8
        test_final_evaluation()

        # 9
        test_monitoring()

        print("\n" + "#" * 70)
        print(
            "# COMPLETE PIPELINE TEST FINISHED"
        )
        print("#" * 70)

        print("\nModules tested:")

        print("1. Job Matching")
        print("2. Job Recommendation")
        print("3. Eligible Jobs")
        print("4. MCQ Test")
        print("5. AI Interview")
        print("6. Interview Performance")
        print("7. Interview Feedback")
        print("8. Final Evaluation")
        print("9. Camera Monitoring")

        print(
            "\nPipeline execution reached the end successfully."
        )

    except Exception as error:

        print("\n" + "#" * 70)
        print(
            "# PIPELINE TEST FAILED"
        )
        print("#" * 70)

        print(
            "\nError Type:"
        )

        print(
            type(error).__name__
        )

        print(
            "\nError:"
        )

        print(error)

        print(
            "\nPlease send the complete traceback "
            "if another error appears."
        )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()