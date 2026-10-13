from datetime import timezone
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification, User
from app.routers.auth import get_current_user_from_token
from app.schemas import NotificationResponse

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def _notification_to_dict(notification: Notification) -> dict:
    created_at = notification.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "category": notification.category,
        "read": notification.read,
        "createdAt": created_at.isoformat(),
    }


def _resolve_user_id(
    user: User | None,
) -> str:
    return user.id


def _optional_current_user(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return get_current_user_from_token(authorization=authorization, db=db)
    except HTTPException:
        return None


def create_notification(
    db: Session, 
    user_id: str, 
    title: str, 
    message: str, 
    category: str
):
    """
    Допоміжна функція для відправки сповіщень.
    Викликай її у роутах бронювання, поширення тощо.
    """
    new_notification = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        message=message,
        category=category # "reserved", "shared", "cancelled", "event"
    )
    db.add(new_notification)
    db.commit()


@router.get(
    "",
    response_model=list[NotificationResponse],
    summary="List user notifications",
    description=(
        "Return notifications for the authenticated user. "
        "Support optional `?read=false` query to filter unread only.\n\n"
        "**React pages:** `NotificationsPage` (`/notifications`), "
        "`NotificationsUnreadPage` (`/notifications/unread`)"
    ),
)
def list_notifications(
    read: bool | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
) -> list[dict]:
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if read is False:
        query = query.filter(Notification.read.is_(False))
    elif read is True:
        query = query.filter(Notification.read.is_(True))

    notifications = query.order_by(Notification.created_at.desc()).all()
    return [_notification_to_dict(notification) for notification in notifications]


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark a notification as read",
)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    user: User | None = Depends(_optional_current_user),
) -> dict:
    user_id = _resolve_user_id(user)
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.read = True
    db.commit()
    db.refresh(notification)
    return _notification_to_dict(notification)


@router.patch(
    "/read-all",
    summary="Mark all notifications as read",
)
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.read.is_(False)
    ).update({"read": True})
    
    db.commit()
    return {"status": "success"}