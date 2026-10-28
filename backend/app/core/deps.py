"""Reusable FastAPI dependencies for protected routes."""

from dataclasses import dataclass
from typing import Any

from fastapi import Depends, HTTPException, Request, status
from pymongo.database import Database

from app.core.cookies import ACCESS_COOKIE_NAME
from app.core.security import (
    TokenError,
    TokenExpiredError,
    csrf_token_for,
    decode_access_token,
    verify_csrf,
)
from app.database import get_db
from app.services import auth_service


@dataclass
class Session:
    user: dict[str, Any]
    jti: str
    csrf_token: str


def get_current_session(request: Request, db: Database = Depends(get_db)) -> Session:
    """Authenticate the request from the HttpOnly cookie.

    The user id always comes from the verified token, never from request input.
    """
    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated.")
    try:
        payload = decode_access_token(token)
    except TokenExpiredError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Your session has expired. Please sign in again.")
    except TokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid authentication credentials.")

    user = auth_service.get_user_by_id(db, payload["sub"])
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid authentication credentials.")
    return Session(user=user, jti=payload["jti"], csrf_token=csrf_token_for(payload["jti"]))


def require_csrf(request: Request, session: Session = Depends(get_current_session)) -> Session:
    """Use on any authenticated route that changes state."""
    if not verify_csrf(session.jti, request.headers.get("x-csrf-token")):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Invalid or missing CSRF token.")
    return session
