from fastapi import FastAPI
from analytics_api import router

app = FastAPI(
    title="CAMPUSLINK Analytics API",
    description="Analytics and placement intelligence API",
    version="1.0.0"
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "project": "CAMPUSLINK",
        "module": "Analytics",
        "status": "running"
    }