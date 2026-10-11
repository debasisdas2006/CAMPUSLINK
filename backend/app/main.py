import sys
from pathlib import Path

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

# =========================================================
# MODELS
# =========================================================

from app.auth.user_model import User
from app.students.student_model import Student
from app.companies.company_model import Company
from app.recruiters.recruiter_model import Recruiter
from app.jobs.job_model import Job
from app.applications.application_model import Application
from app.interviews.interview_model import Interview
from app.interviews.question_model import InterviewQuestion
from app.tests.test_model import AssessmentTest
from app.tests.question_model import AssessmentQuestion
from app.tests.attempt_model import TestAttempt
from app.notifications.models import Notification


# =========================================================
# ROUTERS
# =========================================================

from app.auth.routes import router as auth_router

from app.students.routes import router as student_router

from app.companies.routes import router as company_router

from app.recruiters.routes import router as recruiter_router

from app.jobs.routes import router as job_router
from app.jobs.eligibility_routes import router as eligibility_router

from app.applications.routes import router as application_router

from app.interviews.routes import router as interview_router

from app.tests.routes import router as test_router
from app.tests.ai_routes import router as ai_test_router

from app.ai_ml.routes import router as ai_ml_router

from app.admins.routes import router as admin_router

from app.analytics.routes import router as analytics_router

from app.monitoring.routes import router as monitoring_router

from app.notifications.routes import router as notification_router


# =========================================================
# DATABASE TABLE CREATION
# =========================================================

# Database schema already exists. Schema creation is managed separately.


from contextlib import asynccontextmanager
from sqlalchemy import text


# =========================================================
# FASTAPI APPLICATION LIFESPAN
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm connection pool on startup so the first user request is fast
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        print(f"Database pre-warm warning: {exc}")
    yield


app = FastAPI(
    title="CAMPUSLINK API",
    description="AI Powered Campus-to-Corporate Placement Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "CAMPUSLINK API is running",
        "version": "1.0.0"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================================================
# API ROUTERS (Mount both under /api/v1 and directly)
# =========================================================

api_routers = [
    auth_router,
    student_router,
    company_router,
    recruiter_router,
    job_router,
    eligibility_router,
    application_router,
    interview_router,
    test_router,
    ai_test_router,
    ai_ml_router,
    admin_router,
    analytics_router,
    monitoring_router,
    notification_router,
]

for router_item in api_routers:
    app.include_router(router_item, prefix="/api/v1")
    app.include_router(router_item)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8006, reload=True)

