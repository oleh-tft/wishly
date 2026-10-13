from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Wishlist, WishlistItem
from app.routers.auth import get_current_user_from_token
from app.schemas import ReserveItemRequest, ReservedItemResponse, UpdateWishItemRequest, WishItemResponse
from app.routers.notifications import create_notification

router = APIRouter(prefix="/api/items", tags=["Items"])


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


@router.get(
    "/reserved-by-me",
    response_model=list[ReservedItemResponse],
    summary="List items reserved by the current user",
    description="**React page:** `ReservationPage` (`/reservation`) - 'Made by me' tab",
)
def list_reserved_items(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
) -> list[dict]:
    items = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.is_reserved.is_(True),
            WishlistItem.reserved_by_user_id == user.id,
        )
        .all()
    )
    return [
        {
            "id": item.id,
            "wishlistId": item.wishlist_id,
            "title": item.title,
            "price": item.price,
            "wishlistTitle": item.wishlist.title if item.wishlist else "Wishlist",
            "note": item.reserved_note,
            "imageUrl": item.image_url,
            "giftingDate": item.wishlist.gifting_date if item.wishlist else None,
            "wishlistImageUrl": item.wishlist.image_url if item.wishlist else None,
            "authorName": item.wishlist.owner.name if item.wishlist else "Unknown",
            "description": item.description,
            "externalLink": item.external_link,
        }
        for item in items
    ]


@router.get(
    "/reserved-for-me",
    response_model=list[ReservedItemResponse],
    summary="List items reserved by others in the current user's wishlists",
    description="**React page:** `ReservationPage` (`/reservation`) - 'Made for me' tab",
)
def list_reserved_for_me_items(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
) -> list[dict]:
    items = (
        db.query(WishlistItem)
        .join(Wishlist)
        .filter(
            Wishlist.user_id == user.id,
            WishlistItem.is_reserved.is_(True)
        )
        .all()
    )
    
    result = []
    for item in items:
        # Перевіряємо дату для кожного товару
        reveal_secret = False
        if item.wishlist and item.wishlist.gifting_date:
            gifting_date = item.wishlist.gifting_date
            now = datetime.now(gifting_date.tzinfo) if gifting_date.tzinfo else datetime.now()
            if now >= gifting_date + timedelta(days=1):
                reveal_secret = True

        result.append({
            "id": item.id,
            "wishlistId": item.wishlist_id,
            "title": item.title,
            "price": item.price,
            "wishlistTitle": item.wishlist.title,
            "note": item.reserved_note if reveal_secret else None,
            "imageUrl": item.image_url,
            "giftingDate": item.wishlist.gifting_date,
            "wishlistImageUrl": item.wishlist.image_url,
            "authorName": item.wishlist.owner.name if (item.wishlist and item.wishlist.owner) else "Unknown",
            "reservedByName": item.reserver.name if (reveal_secret and item.reserver) else None,
            "description": item.description,
            "externalLink": item.external_link,
        })
        
    return result


@router.post(
    "/{item_id}/reserve",
    status_code=status.HTTP_201_CREATED,
    summary="Reserve a wishlist item",
)
def reserve_item(
    item_id: str,
    body: ReserveItemRequest | None = None,
    db: Session = Depends(get_db),
    user: User | None = Depends(_optional_current_user),
) -> dict:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Authentication required to reserve items"
        )
    
    item = db.get(WishlistItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.wishlist and item.wishlist.user_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="You cannot reserve items from your own wishlist"
        )
    
    if item.is_reserved:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Item already reserved")

    note_text = body.note if body else None
    item.is_reserved = True
    item.reserved_note = note_text
    item.reserved_by_user_id = user.id
    create_notification(db, item.wishlist.user_id, "Item reserved", f"Someone reserved '{item.title}' from your {item.wishlist.title} list.", "reserved")
    db.commit()

    return {
        "status": "success",
        "message": f"Item {item_id} reserved successfully.",
        "note": note_text,
    }


@router.delete(
    "/{item_id}/reserve",
    status_code=status.HTTP_200_OK,
    summary="Remove reservation from a wishlist item",
)
def unreserve_item(
    item_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
) -> dict:
    item = db.get(WishlistItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if not item.is_reserved or item.reserved_by_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You can only unreserve items that you have reserved."
        )
    
    item.is_reserved = False
    item.reserved_note = None
    item.reserved_by_user_id = None
    create_notification(db, item.wishlist.user_id, "Reservation cancelled", f"A reservation on '{item.title}' was cancelled and is available again.", "cancelled")
    db.commit()

    return {
        "status": "success",
        "message": f"Reservation for item {item_id} removed successfully.",
    }


@router.patch(
    "/{item_id}",
    response_model=WishItemResponse,
    summary="Update a wishlist item",
)
def update_item(
    item_id: str,
    body: UpdateWishItemRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token)
) -> dict:
    item = db.get(WishlistItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if not item.wishlist or item.wishlist.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this item")
    
    if body.title is not None:
        item.title = body.title
    if body.price is not None:
        item.price = body.price
    if body.description is not None:
        item.description = body.description
    if body.image_url is not None:
        item.image_url = body.image_url
    if body.external_link is not None:
        item.external_link = body.external_link
        
    db.commit()
    db.refresh(item)
    
    return {
        "id": item.id,
        "wishlistId": item.wishlist_id,
        "title": item.title,
        "price": item.price,
        "description": item.description,
        "imageUrl": item.image_url,
        "externalLink": item.external_link,
        "isReserved": item.is_reserved,
        "reservedNote": item.reserved_note,
        "reservedByMe": item.reserved_by_user_id == user.id,
    }


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a wishlist item",
)
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token)
):
    item = db.get(WishlistItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if not item.wishlist or item.wishlist.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
        
    db.delete(item)
    db.commit()
    return None