"""User document shape stored in MongoDB.

Document fields:
    _id            ObjectId
    full_name      str
    email          str   (lower-cased, unique index)
    password_hash  str   (Argon2id hash - never the plaintext password)
    avatar         str | None (base64 image or image URL)
    bio            str | None
    created_at     datetime (UTC)
    updated_at     datetime (UTC)
"""

from datetime import datetime, timezone
from typing import Any

USERS_COLLECTION = "users"


def build_user_document(
    full_name: str,
    email: str,
    password_hash: str,
    avatar: str | None = None,
    bio: str | None = None,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "full_name": full_name,
        "email": email,
        "password_hash": password_hash,
        "avatar": avatar,
        "bio": bio,
        "created_at": now,
        "updated_at": now,
    }

