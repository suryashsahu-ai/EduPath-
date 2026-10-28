"""Authentication business logic, kept separate from the HTTP layer."""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import EmailAlreadyRegisteredError, InvalidCredentialsError
from app.core.security import hash_password, password_needs_rehash, verify_password
from app.models.user import USERS_COLLECTION, build_user_document


def register_user(db: Database, *, full_name: str, email: str, password: str) -> dict[str, Any]:
    users = db[USERS_COLLECTION]
    if users.find_one({"email": email}, {"_id": 1}) is not None:
        raise EmailAlreadyRegisteredError

    document = build_user_document(full_name, email, hash_password(password))
    try:
        result = users.insert_one(document)
    except DuplicateKeyError as exc:  # lost a race with a concurrent registration
        raise EmailAlreadyRegisteredError from exc
    document["_id"] = result.inserted_id
    return document


def authenticate_user(db: Database, *, email: str, password: str) -> dict[str, Any]:
    users = db[USERS_COLLECTION]
    user = users.find_one({"email": email})
    stored_hash = user["password_hash"] if user else None

    if not verify_password(stored_hash, password) or user is None:
        raise InvalidCredentialsError

    if password_needs_rehash(user["password_hash"]):
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"password_hash": hash_password(password), "updated_at": datetime.now(timezone.utc)}},
        )
    return user


def get_user_by_id(db: Database, user_id: str) -> dict[str, Any] | None:
    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        return None
    return db[USERS_COLLECTION].find_one({"_id": object_id})


def update_user_profile(
    db: Database,
    user_id: str,
    *,
    full_name: str | None = None,
    email: str | None = None,
    avatar: str | None = None,
    bio: str | None = None,
) -> dict[str, Any] | None:
    from pymongo import ReturnDocument

    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        return None

    users = db[USERS_COLLECTION]
    user = users.find_one({"_id": object_id})
    if not user:
        return None

    updates: dict[str, Any] = {}
    if full_name is not None:
        updates["full_name"] = full_name
    if email is not None and email != user.get("email"):
        if users.find_one({"email": email, "_id": {"$ne": object_id}}, {"_id": 1}) is not None:
            raise EmailAlreadyRegisteredError
        updates["email"] = email
    if avatar is not None:
        updates["avatar"] = avatar if avatar.strip() != "" else None
    if bio is not None:
        updates["bio"] = bio

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        return users.find_one_and_update(
            {"_id": object_id},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
    return user


def change_user_password(
    db: Database,
    user_id: str,
    *,
    current_password: str,
    new_password: str,
) -> None:
    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        raise InvalidCredentialsError

    users = db[USERS_COLLECTION]
    user = users.find_one({"_id": object_id})
    if not user or not verify_password(user.get("password_hash"), current_password):
        raise InvalidCredentialsError

    users.update_one(
        {"_id": object_id},
        {
            "$set": {
                "password_hash": hash_password(new_password),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )


def delete_user_account(db: Database, user_id: str) -> bool:
    try:
        object_id = ObjectId(user_id)
    except (InvalidId, TypeError):
        return False
    result = db[USERS_COLLECTION].delete_one({"_id": object_id})
    return result.deleted_count > 0
