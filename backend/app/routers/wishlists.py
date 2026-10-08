import uuid
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Wishlist, WishlistItem, WishlistShare
from app.schemas import (
    CreateWishItemRequest,
    CreateWishlistRequest,
    UpdateWishlistRequest,
    WishItemResponse,
    WishlistDetailResponse,
    WishlistResponse,
)
from app.routers.auth import get_current_user_from_token
from app.routers.notifications import create_notification

router = APIRouter(prefix="/api/wishlists", tags=["Wishlists"])

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

def _wishlist_to_dict(wishlist: Wishlist) -> dict:
    reserved_count = sum(1 for item in wishlist.items if item.is_reserved)

    return {
        "id": wishlist.id,
        "userId": wishlist.user_id,
        "title": wishlist.title,
        "description": wishlist.description,
        "imageUrl": wishlist.image_url,
        "giftingDate": wishlist.gifting_date,
        "visibility": wishlist.visibility,
        "itemCount": len(wishlist.items),
        "authorName": wishlist.owner.name if wishlist.owner else "Unknown",
        "authorAvatarUrl": wishlist.owner.avatar_url if wishlist.owner else None,
        "reservedCount": reserved_count
    }

def _item_to_dict(item: WishlistItem, current_user_id: str | None = None) -> dict:
    reveal_secret = False
    if item.wishlist and item.wishlist.gifting_date:
        gifting_date = item.wishlist.gifting_date
        now = datetime.now(gifting_date.tzinfo) if gifting_date.tzinfo else datetime.now()
        
        if now >= gifting_date + timedelta(days=1):
            reveal_secret = True

    show_note = reveal_secret or (item.reserved_by_user_id == current_user_id)

    return {
        "id": item.id,
        "wishlistId": item.wishlist_id,
        "title": item.title,
        "price": item.price,
        "description": item.description,
        "imageUrl": item.image_url,
        "externalLink": item.external_link,
        "isReserved": item.is_reserved,
        "reservedNote": item.reserved_note if show_note else None, 
        "reservedByMe": (item.reserved_by_user_id == current_user_id) if current_user_id else False,
        "reservedByName": item.reserver.name if (reveal_secret and item.reserver) else None,
    }


@router.get(
    "",
    response_model=list[WishlistResponse],
    summary="List current user's wishlists",
)
def list_wishlists(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token)
) -> list[dict]:
    wishlists = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id)
        .order_by(Wishlist.id)
        .all()
    )
    return [_wishlist_to_dict(wishlist) for wishlist in wishlists]


@router.get(
    "/shared",
    response_model=list[WishlistResponse],
    summary="List wishlists shared with the current user",
    description=(
        "Return wishlists that other users have shared with the authenticated user.\n\n"
        "**React page:** `SharedWishesPage` (`/shared-wishes`)"
    ),
)
def list_shared_wishlists(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token)
) -> list[dict]:
    shared_wishlists = (
        db.query(Wishlist)
        .join(WishlistShare, Wishlist.id == WishlistShare.wishlist_id)
        .filter(
            WishlistShare.user_id == user.id,
            Wishlist.visibility != "Only me"
        )
        .all()
    )
    
    return [_wishlist_to_dict(wishlist) for wishlist in shared_wishlists]


@router.post(
    "",
    response_model=WishlistResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new wishlist",
)
def create_wishlist(
    body: CreateWishlistRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
) -> dict:
    
    if body.gifting_date:
        check_date = body.gifting_date.date() if isinstance(body.gifting_date, datetime) else body.gifting_date
        
        if check_date < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gifting date cannot be in the past"
            )
    
    wishlist = Wishlist(
        id=str(uuid.uuid4()),
        title=body.title,
        description=body.description,
        image_url=body.image_url,
        gifting_date=body.gifting_date,
        visibility=body.visibility,
        user_id=user.id,
    )
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)

    return _wishlist_to_dict(wishlist)


@router.get(
    "/{wishlist_id}",
    response_model=WishlistDetailResponse,
    summary="Get a single wishlist by ID",
)
def get_wishlist(wishlist_id: str, db: Session = Depends(get_db), current_user: User | None = Depends(_optional_current_user)) -> dict:
    wishlist = db.get(Wishlist, wishlist_id)
    if wishlist is None:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    if wishlist.visibility == "Only me":
        if not current_user or wishlist.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this wishlist")

    reserved_count = sum(1 for item in wishlist.items if item.is_reserved)
    detail = _wishlist_to_dict(wishlist)
    detail["reservedCount"] = reserved_count
    return detail


@router.get(
    "/{wishlist_id}/items",
    response_model=list[WishItemResponse],
    summary="List items in a wishlist",
)
def list_wishlist_items(wishlist_id: str, db: Session = Depends(get_db), current_user: User | None = Depends(_optional_current_user)) -> list[dict]:
    wishlist = db.get(Wishlist, wishlist_id)
    if wishlist is None:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    if wishlist.visibility == "Only me":
        if not current_user or wishlist.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this wishlist")
            
    user_id = current_user.id if current_user else None
    return [_item_to_dict(item, user_id) for item in wishlist.items]


@router.post("/{wishlist_id}/items", status_code=status.HTTP_201_CREATED)
def add_item_to_wishlist(
    wishlist_id: str,
    body: CreateWishItemRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
) -> dict:
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist or wishlist.user_id != user.id:
        raise HTTPException(status_code=404, detail="Wishlist not found")
        
    new_item = WishlistItem(
        id=str(uuid.uuid4()),
        wishlist_id=wishlist_id,
        title=body.title,
        price=body.price,
        description=body.description,
        image_url=body.image_url,
        external_link=body.external_link
    )
    db.add(new_item)
    db.commit()
    return {"status": "success", "id": new_item.id}


@router.patch(
    "/{wishlist_id}",
    response_model=WishlistResponse,
    summary="Update a wishlist",
)
def update_wishlist(
    wishlist_id: str,
    body: UpdateWishlistRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token)
) -> dict:
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    if wishlist.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this wishlist")
    
    # Оновлюємо тільки ті поля, які були передані
    if body.title is not None:
        wishlist.title = body.title
    if body.description is not None:
        wishlist.description = body.description
    if body.imageUrl is not None:
        wishlist.image_url = body.imageUrl
    if body.giftingDate:
        try:
            new_date = datetime.strptime(body.giftingDate, "%Y-%m-%d").date()
            if new_date < date.today():
                raise HTTPException(status_code=400, detail="Gifting date cannot be in the past")
            wishlist.gifting_date = new_date
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
    if body.visibility is not None:
        wishlist.visibility = body.visibility
        
    db.commit()
    db.refresh(wishlist)
    return _wishlist_to_dict(wishlist)


@router.delete(
    "/{wishlist_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a wishlist",
)
def delete_wishlist(
    wishlist_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token)
):
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    if wishlist.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this wishlist")
    
    db.delete(wishlist)
    db.commit()
    return None


@router.post("/{wishlist_id}/share", status_code=status.HTTP_200_OK)
def join_shared_wishlist(
    wishlist_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token)
) -> dict:
    wishlist = db.get(Wishlist, wishlist_id)
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    if wishlist.user_id == user.id:
        return {"status": "owner"}
        
    if wishlist.visibility == "Only me":
        raise HTTPException(status_code=403, detail="You cannot access this private wishlist")

    existing_share = db.query(WishlistShare).filter_by(wishlist_id=wishlist_id, user_id=user.id).first()
    if not existing_share:
        new_share = WishlistShare(
            id=str(uuid.uuid4()),
            wishlist_id=wishlist_id,
            user_id=user.id
        )
        db.add(new_share)
        create_notification(db, user.id, "Wishlist shared with you", f"{wishlist.owner.name} shared her/his '{wishlist.title}' wishlist with you.", "shared")
        db.commit()

    return {"status": "joined"}