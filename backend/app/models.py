from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    email_notifications: Mapped[bool] = mapped_column(Boolean, default=False)
    reservation_notifications: Mapped[bool] = mapped_column(Boolean, default=False)
    wishlist_activity: Mapped[bool] = mapped_column(Boolean, default=False)
    language: Mapped[str] = mapped_column(String(10), default="EN")
    default_visibility: Mapped[str] = mapped_column(String(50), default="Only me")

    wishlists: Mapped[list["Wishlist"]] = relationship(back_populates="owner")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
    shared_wishlists: Mapped[list["WishlistShare"]] = relationship(back_populates="user")

class Wishlist(Base):
    __tablename__ = "wishlists"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    gifting_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    visibility: Mapped[str] = mapped_column(String(50), default="Only me") # "Only me" / "Anyone with the link"

    owner: Mapped["User"] = relationship(back_populates="wishlists")
    items: Mapped[list["WishlistItem"]] = relationship(back_populates="wishlist", cascade="all, delete-orphan")
    shares: Mapped[list["WishlistShare"]] = relationship(back_populates="wishlist", cascade="all, delete-orphan")


class WishlistShare(Base):
    __tablename__ = "wishlist_shares"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    wishlist_id: Mapped[str] = mapped_column(String, ForeignKey("wishlists.id"))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))

    wishlist: Mapped["Wishlist"] = relationship(back_populates="shares")
    user: Mapped["User"] = relationship(back_populates="shared_wishlists")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    wishlist_id: Mapped[str] = mapped_column(String, ForeignKey("wishlists.id"))
    title: Mapped[str] = mapped_column(String(200))
    price: Mapped[float] = mapped_column(Float)
    
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    external_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    is_reserved: Mapped[bool] = mapped_column(Boolean, default=False)
    reserved_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reserved_by_user_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)

    reserver: Mapped["User | None"] = relationship(foreign_keys=[reserved_by_user_id])

    wishlist: Mapped["Wishlist"] = relationship(back_populates="items")

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    
    category: Mapped[str] = mapped_column(String(50), default="event") # reserved, shared, cancelled, event, milestone
    
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="notifications")