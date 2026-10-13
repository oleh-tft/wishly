from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user_from_token
from app.schemas import UpdateUserRequest, UserResponse

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description=(
        "Return the authenticated user's profile data.\n\n"
        "Requires a valid JWT token in the `Authorization: Bearer <token>` header.\n\n"
        "**React pages:** `ProfilePage` (`/profile`), `Header` (user name & avatar)."
    ),
)
def get_current_user(user: User = Depends(get_current_user_from_token)) -> dict:
    return user


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile / settings",
    description=(
        "Update name, avatar, or other profile fields.\n\n"
        "**React page:** `SettingsPage` (`/settings`)"
    ),
)
def update_current_user(
    body: UpdateUserRequest,
    user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
) -> dict:

    update_data = body.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != user.email:
        existing_user = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already in use by another account."
            )

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/me", status_code=204)
def delete_current_user(
    user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db),
):
    user.deleted_at = func.now()
    db.commit()
    return None