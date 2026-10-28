"""Pydantic request/response schemas for authentication."""

import re
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, value: Any) -> Any:
        if isinstance(value, str):
            return re.sub(r"\s+", " ", value).strip()
        return value

    @field_validator("email")
    @classmethod
    def normalise_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, value: str) -> str:
        if not (re.search(r"[a-z]", value) and re.search(r"[A-Z]", value) and re.search(r"\d", value)):
            raise ValueError("Password must include an upper case letter, a lower case letter and a number.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalise_email(cls, value: str) -> str:
        return value.strip().lower()


class UserPublic(BaseModel):
    """The only user shape ever returned to clients - no password hash."""

    id: str
    full_name: str
    email: EmailStr
    avatar: str | None = None
    bio: str | None = None
    created_at: datetime

    @classmethod
    def from_document(cls, doc: dict[str, Any]) -> "UserPublic":
        return cls(
            id=str(doc["_id"]),
            full_name=doc["full_name"],
            email=doc["email"],
            avatar=doc.get("avatar"),
            bio=doc.get("bio"),
            created_at=doc["created_at"],
        )


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    avatar: str | None = None
    bio: str | None = Field(default=None, max_length=300)

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, value: Any) -> Any:
        if isinstance(value, str):
            val = re.sub(r"\s+", " ", value).strip()
            return val or None
        return value

    @field_validator("email")
    @classmethod
    def normalise_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip().lower()


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def check_password_strength(cls, value: str) -> str:
        if not (re.search(r"[a-z]", value) and re.search(r"[A-Z]", value) and re.search(r"\d", value)):
            raise ValueError("Password must include an upper case letter, a lower case letter and a number.")
        return value


class RegisterResponse(BaseModel):
    message: str
    user: UserPublic


class ProfileResponse(BaseModel):
    message: str
    user: UserPublic


class LoginResponse(BaseModel):
    message: str
    user: UserPublic
    csrf_token: str


class MeResponse(BaseModel):
    user: UserPublic
    csrf_token: str


class MessageResponse(BaseModel):
    message: str
