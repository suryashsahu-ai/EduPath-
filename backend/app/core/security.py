"""Password hashing, JWT creation/validation and CSRF token helpers."""

import hashlib
import hmac
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.config import get_settings

# ---------------------------------------------------------------- passwords

_hasher = PasswordHasher()  # Argon2id with the library's recommended parameters
# Verified against when the email is unknown so both failure paths take similar time.
_DUMMY_HASH = _hasher.hash("edupath-timing-equaliser")


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str | None, password: str) -> bool:
    try:
        matched = _hasher.verify(password_hash or _DUMMY_HASH, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
    return matched and password_hash is not None


def password_needs_rehash(password_hash: str) -> bool:
    return _hasher.check_needs_rehash(password_hash)


# --------------------------------------------------------------------- JWT


class TokenError(Exception):
    """Token missing claims, malformed, or signed incorrectly."""


class TokenExpiredError(TokenError):
    """Token was valid but has expired."""


def create_access_token(user_id: str, email: str) -> tuple[str, str]:
    """Return (signed_jwt, jti). Claims: sub, email, jti, type, iat, exp."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    jti = uuid.uuid4().hex
    payload = {
        "sub": user_id,
        "email": email,
        "jti": jti,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, jti


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],  # pinned: never trust the token's own "alg"
            options={"require": ["exp", "iat", "sub", "jti"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise TokenExpiredError from exc
    except jwt.InvalidTokenError as exc:
        raise TokenError from exc
    if payload.get("type") != "access":
        raise TokenError("Unexpected token type.")
    return payload


# -------------------------------------------------------------------- CSRF
# The CSRF token is an HMAC of the session's jti. The browser receives it in the
# JSON body of /login and /me (which other sites cannot read) and must echo it in the
# X-CSRF-Token header on state-changing requests. The HttpOnly cookie alone is not enough.


def csrf_token_for(jti: str) -> str:
    key = get_settings().jwt_secret_key.encode()
    return hmac.new(key, f"csrf:{jti}".encode(), hashlib.sha256).hexdigest()


def verify_csrf(jti: str, provided: str | None) -> bool:
    return hmac.compare_digest(csrf_token_for(jti).encode(), (provided or "").encode())
