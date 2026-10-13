import threading
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import NullPool

DATA_DIR = Path(__file__).resolve().parent / "data"
DATABASE_URL = f"sqlite:///{DATA_DIR / 'wishly.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=NullPool,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

_db_lock = threading.Lock()
_db_ready = False


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def ensure_db() -> None:
    global _db_ready
    if _db_ready:
        return
    with _db_lock:
        if _db_ready:
            return
        from app.seed import seed_db

        init_db()
        db = SessionLocal()
        try:
            seed_db(db)
        finally:
            db.close()
        _db_ready = True


def get_db() -> Generator[Session, None, None]:
    ensure_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
