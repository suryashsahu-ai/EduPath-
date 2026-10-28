"""Authentication endpoints: /api/auth/register, /login, /me, /logout."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pymongo.database import Database

from app.core.cookies import ACCESS_COOKIE_NAME, clear_auth_cookie, set_auth_cookie
from app.core.deps import Session, get_current_session, require_csrf
from app.core.exceptions import EmailAlreadyRegisteredError, InvalidCredentialsError
from app.core.security import TokenError, create_access_token, csrf_token_for, decode_access_token, verify_csrf
from app.database import get_db
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MeResponse,
    MessageResponse,
    ProfileResponse,
    RegisterRequest,
    RegisterResponse,
    UpdateProfileRequest,
    UserPublic,
)
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Database = Depends(get_db)) -> RegisterResponse:
    try:
        user = auth_service.register_user(
            db, full_name=payload.full_name, email=payload.email, password=payload.password
        )
    except EmailAlreadyRegisteredError:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
    return RegisterResponse(
        message="Account created successfully. You can now sign in.",
        user=UserPublic.from_document(user),
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Database = Depends(get_db)) -> LoginResponse:
    try:
        user = auth_service.authenticate_user(db, email=payload.email, password=payload.password)
    except InvalidCredentialsError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    token, jti = create_access_token(str(user["_id"]), user["email"])
    set_auth_cookie(response, token)
    return LoginResponse(
        message="Signed in successfully.",
        user=UserPublic.from_document(user),
        csrf_token=csrf_token_for(jti),
    )


@router.get("/me", response_model=MeResponse)
def me(session: Session = Depends(get_current_session)) -> MeResponse:
    return MeResponse(user=UserPublic.from_document(session.user), csrf_token=session.csrf_token)


@router.patch("/profile", response_model=ProfileResponse)
def update_profile(
    payload: UpdateProfileRequest,
    session: Session = Depends(require_csrf),
    db: Database = Depends(get_db),
) -> ProfileResponse:
    try:
        user = auth_service.update_user_profile(
            db,
            user_id=str(session.user["_id"]),
            full_name=payload.full_name,
            email=payload.email,
            avatar=payload.avatar,
            bio=payload.bio,
        )
    except EmailAlreadyRegisteredError:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")

    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")

    return ProfileResponse(
        message="Profile updated successfully.",
        user=UserPublic.from_document(user),
    )


@router.put("/password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    session: Session = Depends(require_csrf),
    db: Database = Depends(get_db),
) -> MessageResponse:
    try:
        auth_service.change_user_password(
            db,
            user_id=str(session.user["_id"]),
            current_password=payload.current_password,
            new_password=payload.new_password,
        )
    except InvalidCredentialsError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect.")

    return MessageResponse(message="Password changed successfully.")


@router.delete("/account", response_model=MessageResponse)
def delete_account(
    response: Response,
    session: Session = Depends(require_csrf),
    db: Database = Depends(get_db),
) -> MessageResponse:
    auth_service.delete_user_account(db, user_id=str(session.user["_id"]))
    clear_auth_cookie(response)
    return MessageResponse(message="Your account has been deleted permanently.")


@router.post("/logout", response_model=MessageResponse)
def logout(request: Request, response: Response) -> MessageResponse:
    """Clear the auth cookie.

    A valid session must present its CSRF token, so another site cannot sign a user out.
    A missing, expired or invalid cookie is simply cleared.
    """
    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if token:
        try:
            payload = decode_access_token(token)
        except TokenError:
            payload = None
        if payload and not verify_csrf(payload["jti"], request.headers.get("x-csrf-token")):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Invalid or missing CSRF token.")
    clear_auth_cookie(response)
    return MessageResponse(message="Signed out.")
