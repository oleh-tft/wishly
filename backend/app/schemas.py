from datetime import datetime
from typing import Annotated, Optional, Self

from pydantic import AfterValidator, BaseModel, EmailStr, Field, model_validator

NAME_PATTERN = r"^[A-Za-z\s\-']+$"

def _require_ascii_latin_domain(v: str) -> str:
    domain = v.split("@", 1)[1]            
    if not domain.isascii():
        raise ValueError(
            "Email domain must use only ASCII characters "
            "(Latin letters, digits, hyphens, dots)."
        )
    domain_label = domain.rsplit(".", 1)[0]  
    if not any(c.isalpha() for c in domain_label):
        raise ValueError(
            "Email domain must contain at least one letter "
            "(purely numeric domains are not accepted)."
        )
    return v

EmailField = Annotated[
    EmailStr,
    Field(min_length=6, max_length=254),
    AfterValidator(_require_ascii_latin_domain),
]

# ---------------------------------------------------------------------------
# Auth & Users
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=50, pattern=NAME_PATTERN)
    email: EmailField
    password: str = Field(min_length=8, max_length=50)

class LoginRequest(BaseModel):
    email: EmailField
    password: str
    remember_me: bool = False

class OAuthRequest(BaseModel):
    credential: str | None = None
    code: str | None = None
    state: str | None = None
    redirect_uri: str | None = None

    @model_validator(mode="after")
    def credential_or_code(self) -> Self:
        if not self.credential and not self.code:
            raise ValueError("Either credential or code is required.")
        return self

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatar_url: str | None = Field(alias="avatarUrl", default=None)
    bio: str | None = None
    created_at: datetime = Field(alias="createdAt")
    
    email_notifications: bool = Field(alias="emailNotifications", default=False)
    reservation_notifications: bool = Field(alias="reservationNotifications", default=False)
    wishlist_activity: bool = Field(alias="wishlistActivity", default=False)
    language: str = "EN"
    default_visibility: str = Field(alias="defaultVisibility", default="Only me")

    model_config = {"populate_by_name": True}

class UpdateUserRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50, pattern=NAME_PATTERN)
    email: EmailField | None = None
    avatar_url: str | None = Field(alias="avatarUrl", default=None)
    bio: str | None = None
    
    email_notifications: bool | None = Field(alias="emailNotifications", default=None)
    reservation_notifications: bool | None = Field(alias="reservationNotifications", default=None)
    wishlist_activity: bool | None = Field(alias="wishlistActivity", default=None)
    language: str | None = None
    default_visibility: str | None = Field(alias="defaultVisibility", default=None)

    model_config = {"populate_by_name": True}

# ---------------------------------------------------------------------------
# Wishlists
# ---------------------------------------------------------------------------

class WishlistResponse(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    title: str
    description: str | None = None
    image_url: str | None = Field(alias="imageUrl", default=None)
    gifting_date: datetime | None = Field(alias="giftingDate", default=None)
    visibility: str
    item_count: int = Field(alias="itemCount")
    author_name: str = Field(alias="authorName", default="Unknown")
    author_avatar_url: str | None = Field(alias="authorAvatarUrl", default=None)
    reserved_count: int = Field(alias="reservedCount", default=0)

    model_config = {"populate_by_name": True}

class WishlistDetailResponse(WishlistResponse):
    reserved_count: int = Field(alias="reservedCount", default=0)

class UpdateWishlistRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    giftingDate: Optional[str] = None
    visibility: Optional[str] = None

class CreateWishlistRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str | None = None
    image_url: str | None = Field(alias="imageUrl", default=None)
    gifting_date: datetime | None = Field(alias="giftingDate", default=None)
    visibility: str = "Only me"

# ---------------------------------------------------------------------------
# Items
# ---------------------------------------------------------------------------

class WishItemResponse(BaseModel):
    id: str
    wishlist_id: str = Field(alias="wishlistId")
    title: str
    price: float
    description: str | None = None
    image_url: str | None = Field(alias="imageUrl", default=None)
    external_link: str | None = Field(alias="externalLink", default=None)
    is_reserved: bool = Field(alias="isReserved", default=False)
    reserved_note: str | None = Field(alias="reservedNote", default=None)
    reserved_by_me: bool = Field(alias="reservedByMe", default=False)
    reserved_by_name: str | None = Field(alias="reservedByName", default=None)

    model_config = {"populate_by_name": True}

class CreateWishItemRequest(BaseModel):
    title: str
    price: float
    description: str | None = None
    image_url: str | None = Field(alias="imageUrl", default=None)
    external_link: str | None = Field(alias="externalLink", default=None)

class UpdateWishItemRequest(BaseModel):
    title: str | None = None
    price: float | None = None
    description: str | None = None
    image_url: str | None = Field(alias="imageUrl", default=None)
    external_link: str | None = Field(alias="externalLink", default=None)

class ReserveItemRequest(BaseModel):
    note: str | None = None

class ReservedItemResponse(BaseModel):
    id: str
    wishlistId: str
    title: str
    price: float
    wishlist_title: str = Field(alias="wishlistTitle")
    note: str | None = None
    image_url: str | None = Field(alias="imageUrl", default=None)
    gifting_date: datetime | None = Field(alias="giftingDate", default=None)
    wishlist_image_url: str | None = Field(alias="wishlistImageUrl", default=None)
    author_name: str = Field(alias="authorName")
    reserved_by_name: str | None = Field(alias="reservedByName", default=None)
    description: str | None = None
    externalLink: str | None = None

    model_config = {"populate_by_name": True}

# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    category: str
    read: bool
    created_at: datetime = Field(alias="createdAt")

    model_config = {"populate_by_name": True}