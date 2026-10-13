from sqlalchemy.orm import Session
from app.models import User

DEMO_USER_ID = "demo-user"
DEMO_PASSWORD_HASH = "$2b$12$YNd56J1L6McWtNUt3Ry0cuvbS1C4dwMcnU26MF7wyuX416jKLeFgu"

# SEED_WISHLISTS = [
#     {
#         "id": "1",
#         "title": "Birthday 2025",
#         "description": "Everything I actually want and would never buy myself.",
#     },
#     {
#         "id": "2",
#         "title": "Christmas Ideas",
#         "description": None,
#     },
#     {
#         "id": "3",
#         "title": "Winter Essentials",
#         "description": None,
#     },
#     {
#         "id": "4",
#         "title": "Wedding Registry",
#         "description": None,
#     },
# ]

# SEED_WISHLIST_ITEMS: dict[str, list[dict]] = {
#     "1": [
#         {
#             "id": "item-1-1",
#             "title": "AirPods Pro",
#             "price": 249.99,
#             "is_reserved": False,
#         },
#         {
#             "id": "item-1-2",
#             "title": "Kindle Paperwhite",
#             "price": 139.99,
#             "is_reserved": True,
#         },
#     ],
#     "2": [
#         {
#             "id": "item-2-1",
#             "title": "iPhone 7 Plus",
#             "price": 549.99,
#             "is_reserved": False,
#         },
#     ],
#     "3": [
#         {
#             "id": "item-3-1",
#             "title": "Cropp Shirt",
#             "price": 549.99,
#             "is_reserved": True,
#         },
#         {
#             "id": "item-3-2",
#             "title": "Black Candle",
#             "price": 249.00,
#             "is_reserved": True,
#         },
#         {
#             "id": "item-3-3",
#             "title": "Red Candle",
#             "price": 239.00,
#             "is_reserved": True,
#         },
#     ],
#     "4": [
#         {
#             "id": "item-4-1",
#             "title": "iPhone 17 Pro Max",
#             "price": 45499.99,
#             "is_reserved": False,
#         },
#     ],
# }

# SEED_SHARED_WISHLISTS = [
#     {
#         "id": "shared-1",
#         "title": "Birthday 2026",
#         "description": "Emma's birthday wishlist",
#         "user_id": EMMA_USER_ID,
#         "items": [
#             {
#                 "id": "shared-item-1",
#                 "title": "Aesop Parsley Seed Serum",
#                 "price": 78.0,
#                 "is_reserved": False,
#             },
#             {
#                 "id": "shared-item-2",
#                 "title": "Muji Ultrasonic Diffuser",
#                 "price": 55.0,
#                 "is_reserved": True,
#                 "reserved_by_user_id": DEMO_USER_ID,
#             },
#         ],
#     },
# ]

# SEED_NOTIFICATIONS = [
#     {
#         "id": "notif-1",
#         "title": "Item reserved",
#         "message": "Emma K. reserved 'Kindle Paperwhite' from your Birthday 2025 list.",
#         "read": False,
#         "hours_ago": 0,
#     },
#     {
#         "id": "notif-2",
#         "title": "Wishlist shared with you",
#         "message": "Tom shared his 'Housewarming Essentials' wishlist with you.",
#         "read": False,
#         "hours_ago": 1,
#     },
#     {
#         "id": "notif-3",
#         "title": "Reservation cancelled",
#         "message": "A reservation on 'Braun Ceramic Grinder' was cancelled and is available again.",
#         "read": False,
#         "hours_ago": 3,
#     },
#     {
#         "id": "notif-4",
#         "title": "Birthday coming up",
#         "message": "Sara Mitchell's birthday is in 5 days. Don't forget to check her wishlist!",
#         "read": True,
#         "hours_ago": 24,
#     },
#     {
#         "id": "notif-5",
#         "title": "Wishlist milestone",
#         "message": "Your 'Wedding Registry' list just reached 20 items.",
#         "read": True,
#         "hours_ago": 48,
#     },
#     {
#         "id": "notif-6",
#         "title": "Item reserved",
#         "message": "James L. reserved 'Analog Minimalist Watch' from your Winter Essentials list.",
#         "read": True,
#         "hours_ago": 72,
#     },
# ]


def seed_db(db: Session) -> None:
    if db.query(User).first() is not None:
        return

    password_hash = DEMO_PASSWORD_HASH
    demo_user = User(
        id=DEMO_USER_ID,
        name="Demo User",
        email="demo@example.com",
        password_hash=password_hash,
        avatar_url=None,
    )
    db.add(demo_user)

    db.commit()