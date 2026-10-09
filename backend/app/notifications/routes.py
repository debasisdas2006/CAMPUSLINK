from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.user_model import User
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.notifications.schemas import (
    NotificationCreate,
    NotificationResponse
)
from app.notifications.service import (
    create_notification,
    get_user_notifications,
    mark_notification_read
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "recruiter"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and recruiters can create notifications"
        )

    notification = create_notification(
        db=db,
        notification_data=notification_data
    )

    return notification


@router.get(
    "/my-notifications",
    response_model=list[NotificationResponse]
)
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_notifications(
        db=db,
        user_id=current_user.id
    )


@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = mark_notification_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return notification