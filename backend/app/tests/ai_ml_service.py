import httpx

from app.core.config import settings


AI_TEST_URL = settings.ai_ml_test_url.rstrip("/")


def start_ai_test(
    student_id: str,
    student_name: str,
    skills: list[str],
    total_questions: int = 10,
    test_type: str = "SELF_ASSESSMENT",
):
    payload = {
        "student_id": str(student_id),
        "student_name": student_name or "",
        "skills": skills or [],
        "total_questions": total_questions,
        "test_type": test_type,
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{AI_TEST_URL}/test/start",
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        detail = exc.response.text
        raise RuntimeError(
            f"AI/ML test start failed: "
            f"{exc.response.status_code} - {detail}"
        ) from exc

    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Could not connect to AI/ML Test API at "
            f"{AI_TEST_URL}: {exc}"
        ) from exc


def get_ai_test(test_id: str):
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(
                f"{AI_TEST_URL}/test/{test_id}"
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"AI/ML get test failed: "
            f"{exc.response.status_code} - "
            f"{exc.response.text}"
        ) from exc

    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Could not connect to AI/ML Test API at "
            f"{AI_TEST_URL}: {exc}"
        ) from exc


def answer_ai_test(
    test_id: str,
    question_id: str,
    answer: str,
):
    payload = {
        "question_id": question_id,
        "answer": answer,
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{AI_TEST_URL}/test/{test_id}/answer",
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"AI/ML answer submission failed: "
            f"{exc.response.status_code} - "
            f"{exc.response.text}"
        ) from exc

    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Could not connect to AI/ML Test API at "
            f"{AI_TEST_URL}: {exc}"
        ) from exc


def get_ai_test_progress(test_id: str):
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(
                f"{AI_TEST_URL}/test/{test_id}/progress"
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"AI/ML progress request failed: "
            f"{exc.response.status_code} - "
            f"{exc.response.text}"
        ) from exc

    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Could not connect to AI/ML Test API at "
            f"{AI_TEST_URL}: {exc}"
        ) from exc


def submit_ai_test(test_id: str):
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{AI_TEST_URL}/test/{test_id}/submit"
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"AI/ML test submission failed: "
            f"{exc.response.status_code} - "
            f"{exc.response.text}"
        ) from exc

    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Could not connect to AI/ML Test API at "
            f"{AI_TEST_URL}: {exc}"
        ) from exc


def get_ai_student_result(test_id: str):
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(
                f"{AI_TEST_URL}/test/{test_id}/result/student"
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"AI/ML student result request failed: "
            f"{exc.response.status_code} - "
            f"{exc.response.text}"
        ) from exc

    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Could not connect to AI/ML Test API at "
            f"{AI_TEST_URL}: {exc}"
        ) from exc


def get_ai_recruiter_result(test_id: str):
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(
                f"{AI_TEST_URL}/test/{test_id}/result/recruiter"
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"AI/ML recruiter result request failed: "
            f"{exc.response.status_code} - "
            f"{exc.response.text}"
        ) from exc

    except httpx.RequestError as exc:
        raise RuntimeError(
            f"Could not connect to AI/ML Test API at "
            f"{AI_TEST_URL}: {exc}"
        ) from exc
