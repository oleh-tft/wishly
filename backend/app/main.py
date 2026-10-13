import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, items, notifications, users, wishlists

app = FastAPI(title="Wishly API", version="1.0.0")

_DEFAULT_ORIGINS = (
    "http://localhost:5173,"
    "https://wishly.pythonanywhere.com,"
    "https://wishly-bn24.onrender.com"
)


def _cors_origins() -> list[str]:
    origins = [
        o.strip().rstrip("/")
        for o in os.getenv("CORS_ORIGINS", _DEFAULT_ORIGINS).split(",")
        if o.strip()
    ]
    frontend = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
    if frontend and frontend not in origins:
        origins.append(frontend)
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(wishlists.router)
app.include_router(items.router)
app.include_router(notifications.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
