from fastapi import FastAPI
from analytics.src.data_loader import (
    load_students,
    load_companies,
    load_jobs,
    load_placements,
)
from analytics.src.placement_analysis import (
    placement_rate,
    average_package,
    highest_package,
    lowest_package,
    branch_wise_placements,
    company_wise_placements,
    package_by_company,
)
from analytics.src.company_analysis import company_summary
from analytics.src.job_demand import (
    total_jobs,
    total_applications,
    average_applications,
    role_demand,
    company_job_demand,
    skill_demand,
)
from analytics.src.skill_analysis import (
    extract_student_skills,
    student_skill_demand,
    required_skill_demand,
    skill_gap,
)
from analytics.src.student_readiness import generate_readiness

app = FastAPI(
    title="CAMPUSLINK Analytics API",
    description="Analytics and placement insights for CAMPUSLINK",
    version="1.0.0",
)


@app.get("/")
def home():
    return {
        "message": "CAMPUSLINK Analytics API is running",
        "docs": "/docs",
    }


@app.get("/analytics/placement")
def placement_analytics():
    students = load_students()
    placements = load_placements()

    return {
        "placement_rate": placement_rate(students),
        "average_package": average_package(placements),
        "highest_package": highest_package(placements),
        "lowest_package": lowest_package(placements),
        "branch_wise_placements": branch_wise_placements(placements),
        "company_wise_placements": company_wise_placements(placements),
        "package_by_company": package_by_company(placements),
    }


@app.get("/analytics/company")
def company_analytics():
    companies = load_companies()
    return company_summary(companies)


@app.get("/analytics/job-demand")
def job_demand_analytics():
    jobs = load_jobs()

    return {
        "total_jobs": total_jobs(jobs),
        "total_applications": total_applications(jobs),
        "average_applications": average_applications(jobs),
        "role_demand": role_demand(jobs),
        "company_job_demand": company_job_demand(jobs),
        "skill_demand": skill_demand(jobs),
    }


@app.get("/analytics/skills")
def skill_analytics():
    students = load_students()
    jobs = load_jobs()

    return {
        "student_skills": extract_student_skills(students),
        "student_skill_demand": student_skill_demand(students),
        "required_skill_demand": required_skill_demand(jobs),
        "skill_gap": skill_gap(students, jobs),
    }


@app.get("/analytics/student-readiness")
def student_readiness_analytics():
    students = load_students()
    return generate_readiness(students)