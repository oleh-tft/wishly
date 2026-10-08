"""Auth router — register, login, and user profile endpoints."""

import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import bcrypt
import httpx
import jwt
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, OAuthRequest

router = APIRouter(prefix="/api/auth", tags=["Auth"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "wishly-dev-secret-key-change-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24
TOKEN_EXPIRE_HOURS_REMEMBER_ME = 720  # 30 days


def _create_token(user_id: str, email: str, expires_hours: int = TOKEN_EXPIRE_HOURS) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=expires_hours),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:5173").strip().rstrip("/")


def _api_public_url() -> str:
    return (
        os.getenv("API_PUBLIC_URL")
        or os.getenv("RENDER_EXTERNAL_URL")
        or "http://localhost:8000"
    ).strip().rstrip("/")


def _google_oauth_redirect_uri() -> str:
    explicit = os.getenv("GOOGLE_REDIRECT_URI", "").strip().rstrip("/")
    if explicit:
        return explicit
    return f"{_api_public_url()}/api/auth/google/callback"


def _google_client_id() -> str:
    google_client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    if not google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured on the server.",
        )
    return google_client_id


def _google_oauth_configured() -> tuple[str, str]:
    google_client_id = _google_client_id()
    google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    if not google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured on the server.",
        )
    return google_client_id, google_client_secret


def _redirect_to_frontend_oauth(**params: str) -> RedirectResponse:
    query = urlencode({key: value for key, value in params.items() if value})
    url = f"{_frontend_url()}/auth/google/callback"
    if query:
        url = f"{url}?{query}"
    return RedirectResponse(url=url, status_code=status.HTTP_302_FOUND)


def _login_or_create_google_user(userinfo: dict, db: Session) -> User:
    email = userinfo.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not provide an email address.",
        )

    name = userinfo.get("name") or email.split("@", 1)[0]
    avatar_url = userinfo.get("picture")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            name=name,
            email=email,
            password_hash=_hash_password(str(uuid.uuid4())),
            avatar_url=avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    updated = False
    if name and user.name != name:
        user.name = name
        updated = True
    if avatar_url and user.avatar_url != avatar_url:
        user.avatar_url = avatar_url
        updated = True
    if updated:
        db.commit()
        db.refresh(user)
    return user


def _exchange_google_code(code: str, redirect_uri: str, db: Session) -> str:
    google_client_id, google_client_secret = _google_oauth_configured()

    try:
        token_response = httpx.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": google_client_id,
                "client_secret": google_client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10.0,
        )
        token_response.raise_for_status()
        tokens = token_response.json()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.json().get(
            "error_description",
            "Failed to exchange Google authorization code.",
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach Google OAuth service. Please try again later.",
        ) from exc

    google_access_token = tokens.get("access_token")
    if not google_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google did not return an access token.",
        )

    try:
        userinfo_response = httpx.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
            timeout=10.0,
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to fetch Google profile information.",
        ) from exc

    user = _login_or_create_google_user(userinfo, db)
    return _create_token(user.id, user.email)


def _verify_google_credential(credential: str, db: Session) -> str:
    from jwt import PyJWKClient

    client_id = _google_client_id()
    try:
        jwks_client = PyJWKClient("https://www.googleapis.com/oauth2/v3/certs")
        signing_key = jwks_client.get_signing_key_from_jwt(credential)
        idinfo = jwt.decode(
            credential,
            signing_key.key,
            algorithms=["RS256"],
            audience=client_id,
            issuer=["accounts.google.com", "https://accounts.google.com"],
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google credential.",
        ) from exc

    user = _login_or_create_google_user(
        {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        },
        db,
    )
    return _create_token(user.id, user.email)


def get_current_user_from_token(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract and validate the JWT token from the Authorization header.
    Returns the User ORM object from the database if valid.

    Usage in endpoints:
        def my_endpoint(user: User = Depends(get_current_user_from_token)):
    """
    # Parse "Bearer <token>"
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>",
        )

    token = authorization[len("Bearer "):]

    # Decode and validate JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        )

    # Find user by id from token payload
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    if user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deleted.",
        )

    return user


# ---------------------------------------------------------------------------
# POST /api/auth/register
# ---------------------------------------------------------------------------
@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description=(
        "Create a new account with name, email, and password.\n\n"
        "**React page:** `SignInPage` (`/sign-in`)\n\n"
        "**Component:** `SignInForm` — wire `handleSubmit` to call this endpoint."
    ),
)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    existing_user = db.query(User).filter(User.email == body.email).first()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        name=body.name,
        email=body.email,
        password_hash=_hash_password(body.password),
        avatar_url=None,
    )
    db.add(new_user)
    db.commit()

    token = _create_token(user_id, body.email)
    return AuthResponse(access_token=token)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Log in with email and password",
    description=(
        "Authenticate user and return a JWT access token.\n\n"
        "**React page:** `LoginPage` (`/login`)\n\n"
        "**Component:** `SignInForm` — same form, different submit handler."
    ),
)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not _verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    
    if user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deleted.",
        )

    expires_hours = TOKEN_EXPIRE_HOURS_REMEMBER_ME if body.remember_me else TOKEN_EXPIRE_HOURS
    token = _create_token(user.id, user.email, expires_hours=expires_hours)
    return AuthResponse(access_token=token)


@router.get(
    "/google/setup",
    summary="Google OAuth setup info",
    description="Returns the redirect URI to register in Google Cloud Console.",
)
def google_setup() -> dict:
    client_id = _google_client_id()
    redirect_uri = _google_oauth_redirect_uri()
    return {
        "client_id": client_id,
        "redirect_uris": [redirect_uri],
        "start_url": f"{_api_public_url()}/api/auth/google/start",
        "console_url": "https://console.cloud.google.com/apis/credentials",
        "note": (
            "Open Google Cloud Console → Credentials → your OAuth 2.0 Client "
            f"({client_id}) → Authorized redirect URIs → add: {redirect_uri}"
        ),
    }


@router.get(
    "/google/start",
    summary="Start Google OAuth (server redirect)",
    description="Redirects the browser to Google. No JavaScript origins required.",
)
def google_start() -> RedirectResponse:
    client_id = _google_client_id()
    redirect_uri = _google_oauth_redirect_uri()
    state = secrets.token_urlsafe(32)
    params = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "online",
            "prompt": "select_account",
        }
    )
    response = RedirectResponse(
        url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}",
        status_code=status.HTTP_302_FOUND,
    )
    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        secure=True,
        max_age=600,
        samesite="lax",
    )
    return response


@router.get(
    "/google/callback",
    summary="Google OAuth browser callback",
    description=(
        "Google redirects here after the user approves access. "
        "The backend exchanges the code and redirects to the frontend with a JWT."
    ),
)
def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    if error:
        response = _redirect_to_frontend_oauth(error=error, state=state or "")
        response.delete_cookie("oauth_state")
        return response

    cookie_state = request.cookies.get("oauth_state")
    if not state or not cookie_state or state != cookie_state:
        response = _redirect_to_frontend_oauth(error="state_mismatch", state=state or "")
        response.delete_cookie("oauth_state")
        return response

    if not code:
        response = _redirect_to_frontend_oauth(error="missing_code", state=state or "")
        response.delete_cookie("oauth_state")
        return response

    try:
        access_token = _exchange_google_code(code, _google_oauth_redirect_uri(), db)
    except HTTPException as exc:
        response = _redirect_to_frontend_oauth(
            error=exc.detail if isinstance(exc.detail, str) else "oauth_failed",
            state=state or "",
        )
        response.delete_cookie("oauth_state")
        return response

    frontend = _frontend_url()
    query = urlencode({"state": state}) if state else ""
    url = f"{frontend}/auth/google/callback"
    if query:
        url = f"{url}?{query}"
    url = f"{url}#access_token={access_token}"
    response = RedirectResponse(url=url, status_code=status.HTTP_302_FOUND)
    response.delete_cookie("oauth_state")
    return response


@router.post(
    "/google",
    response_model=AuthResponse,
    summary="Google OAuth sign-in",
    description="Verify a Google ID token credential or exchange an authorization code for a JWT.",
)
def google_auth(body: OAuthRequest, db: Session = Depends(get_db)) -> AuthResponse:
    if body.credential:
        access_token = _verify_google_credential(body.credential, db)
        return AuthResponse(access_token=access_token)

    redirect_uri = body.redirect_uri or _google_oauth_redirect_uri()
    access_token = _exchange_google_code(body.code, redirect_uri, db)
    return AuthResponse(access_token=access_token)
