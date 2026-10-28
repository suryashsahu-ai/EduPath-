from datetime import datetime, timedelta, timezone

import jwt

from app.models.user import USERS_COLLECTION
from tests.conftest import ORIGIN, VALID_USER

SECRET = "test-secret-key-that-is-at-least-32-characters-long"


# ------------------------------------------------------------- registration


def test_register_success_hides_password_and_stores_argon2_hash(client, db):
    response = client.post("/api/auth/register", json=VALID_USER, headers=ORIGIN)
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "asha@example.com"
    assert "password" not in str(body).lower()
    assert "hash" not in str(body).lower()

    stored = db[USERS_COLLECTION].find_one({"email": "asha@example.com"})
    assert stored["password_hash"].startswith("$argon2id$")
    assert VALID_USER["password"] not in str(stored)


def test_register_normalises_email_and_name(client, db):
    payload = {"full_name": "  Asha   Verma ", "email": "Asha@Example.COM", "password": "Sup3rSecret"}
    assert client.post("/api/auth/register", json=payload, headers=ORIGIN).status_code == 201
    stored = db[USERS_COLLECTION].find_one({})
    assert stored["email"] == "asha@example.com"
    assert stored["full_name"] == "Asha Verma"


def test_register_duplicate_email_returns_409_even_with_different_case(client, registered):
    payload = {**VALID_USER, "email": "ASHA@example.com"}
    response = client.post("/api/auth/register", json=payload, headers=ORIGIN)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_register_validation_errors_do_not_echo_password(client):
    payload = {"full_name": "A", "email": "not-an-email", "password": "weakpass"}
    response = client.post("/api/auth/register", json=payload, headers=ORIGIN)
    assert response.status_code == 422
    body = response.json()
    assert set(body["errors"]) == {"full_name", "email", "password"}
    assert "weakpass" not in response.text


def test_register_rejects_short_password(client):
    payload = {**VALID_USER, "password": "Ab1"}
    response = client.post("/api/auth/register", json=payload, headers=ORIGIN)
    assert response.status_code == 422
    assert "password" in response.json()["errors"]


# -------------------------------------------------------------------- login


def test_login_success_sets_httponly_cookie_and_returns_csrf(client, registered):
    response = client.post(
        "/api/auth/login",
        json={"email": registered["email"], "password": registered["password"]},
        headers=ORIGIN,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == registered["email"]
    assert body["csrf_token"]
    assert "token" not in {k for k in body if k != "csrf_token"}  # JWT is never in the body

    set_cookie = response.headers["set-cookie"].lower()
    assert "edupath_access=" in set_cookie
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie

    claims = jwt.decode(client.cookies["edupath_access"], SECRET, algorithms=["HS256"])
    assert claims["email"] == registered["email"]
    assert claims["sub"] == body["user"]["id"]
    assert claims["exp"] > claims["iat"]


def test_login_wrong_password_and_unknown_email_give_same_error(client, registered):
    wrong_pw = client.post(
        "/api/auth/login", json={"email": registered["email"], "password": "WrongPass1"}, headers=ORIGIN
    )
    unknown = client.post(
        "/api/auth/login", json={"email": "nobody@example.com", "password": "WrongPass1"}, headers=ORIGIN
    )
    assert wrong_pw.status_code == unknown.status_code == 401
    assert wrong_pw.json() == unknown.json() == {"detail": "Invalid email or password."}
    assert "set-cookie" not in wrong_pw.headers


def test_login_email_is_case_insensitive(client, registered):
    response = client.post(
        "/api/auth/login",
        json={"email": "ASHA@EXAMPLE.COM", "password": registered["password"]},
        headers=ORIGIN,
    )
    assert response.status_code == 200


# ----------------------------------------------------------------------- me


def test_me_requires_authentication(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_returns_safe_profile(client, logged_in):
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == VALID_USER["email"]
    assert body["csrf_token"] == logged_in["csrf_token"]
    assert "password" not in response.text.lower()


def test_me_rejects_garbage_token(client):
    client.cookies.set("edupath_access", "not.a.jwt")
    assert client.get("/api/auth/me").status_code == 401


def test_me_rejects_token_signed_with_wrong_secret(client, logged_in):
    forged = jwt.encode(
        {
            "sub": logged_in["user"]["id"],
            "email": "asha@example.com",
            "jti": "x",
            "type": "access",
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        "a-completely-different-secret-value-1234567890",
        algorithm="HS256",
    )
    client.cookies.clear()
    client.cookies.set("edupath_access", forged)
    assert client.get("/api/auth/me").status_code == 401


def test_me_rejects_alg_none_token(client, logged_in):
    unsigned = jwt.encode({"sub": logged_in["user"]["id"]}, key=None, algorithm="none")
    client.cookies.clear()
    client.cookies.set("edupath_access", unsigned)
    assert client.get("/api/auth/me").status_code == 401


def test_me_rejects_expired_token(client, logged_in):
    expired = jwt.encode(
        {
            "sub": logged_in["user"]["id"],
            "email": "asha@example.com",
            "jti": "x",
            "type": "access",
            "iat": datetime.now(timezone.utc) - timedelta(hours=2),
            "exp": datetime.now(timezone.utc) - timedelta(hours=1),
        },
        SECRET,
        algorithm="HS256",
    )
    client.cookies.clear()
    client.cookies.set("edupath_access", expired)
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_me_rejects_token_for_deleted_user(client, db, logged_in):
    db[USERS_COLLECTION].delete_many({})
    assert client.get("/api/auth/me").status_code == 401


# ------------------------------------------------------------------- logout


def test_logout_requires_csrf_token_for_valid_session(client, logged_in):
    response = client.post("/api/auth/logout", headers=ORIGIN)
    assert response.status_code == 403
    assert client.get("/api/auth/me").status_code == 200  # still signed in


def test_logout_with_csrf_clears_session(client, logged_in):
    response = client.post(
        "/api/auth/logout", headers={**ORIGIN, "X-CSRF-Token": logged_in["csrf_token"]}
    )
    assert response.status_code == 200
    assert "edupath_access=" in response.headers["set-cookie"]
    assert client.get("/api/auth/me").status_code == 401


def test_logout_without_session_is_harmless(client):
    assert client.post("/api/auth/logout", headers=ORIGIN).status_code == 200


# --------------------------------------------------------- origin / CORS / misc


def test_untrusted_origin_is_rejected_on_post(client):
    response = client.post("/api/auth/register", json=VALID_USER, headers={"Origin": "https://evil.example"})
    assert response.status_code == 403


def test_cors_preflight_allows_frontend_with_credentials(client):
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-csrf-token",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_cors_preflight_denies_other_origins(client):
    response = client.options(
        "/api/auth/login",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in response.headers


def test_health_reports_database_status(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}
