from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.admins.schemas import (
    AdminDashboardResponse,
    AdminUserResponse
)
from app.admins.service import (
    get_admin_dashboard,
    get_all_users
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse
)
def admin_dashboard(
    db: Session = Depends(get_db)
):
    return get_admin_dashboard(db)


@router.get(
    "/users",
    response_model=list[AdminUserResponse]
)
def admin_users(
    db: Session = Depends(get_db)
):
    return get_all_users(db)