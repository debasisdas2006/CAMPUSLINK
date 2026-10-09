from app.students.student_model import Student
from app.jobs.job_model import Job


def check_job_eligibility(
    student: Student,
    job: Job
):
    reasons = []

    # =========================
    # CGPA CHECK
    # =========================

    if (
        job.minimum_cgpa is not None
        and (
            student.cgpa is None
            or student.cgpa < job.minimum_cgpa
        )
    ):
        reasons.append(
            f"Minimum CGPA required: {job.minimum_cgpa}"
        )


    # =========================
    # DEGREE CHECK
    # =========================

    if (
        job.degree_required
        and student.degree
        and job.degree_required.lower()
        not in student.degree.lower()
    ):
        reasons.append(
            f"Degree required: {job.degree_required}"
        )


    # =========================
    # EXPERIENCE CHECK
    # =========================

    if (
        job.experience_required is not None
        and (
            student.experience_years is None
            or student.experience_years < job.experience_required
        )
    ):
        reasons.append(
            f"Experience required: {job.experience_required} years"
        )


    # =========================
    # FINAL RESULT
    # =========================

    eligible = len(reasons) == 0

    return {
        "eligible": eligible,
        "reasons": reasons
    }