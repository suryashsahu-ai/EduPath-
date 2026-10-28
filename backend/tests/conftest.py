"""Test setup.

Tests run against an in-memory MongoDB stand-in (mongomock) so no server is needed.
That means they verify application logic, not a real MongoDB deployment.
"""

import os

# Must be set before the app is imported.
os.environ["MONGODB_URI"] = "mongodb://localhost:27017"
os.environ["MONGODB_DB_NAME"] = "edupath_test"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-at-least-32-characters-long"
os.environ["FRONTEND_ORIGINS"] = "http://localhost:5173"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"

import mongomock  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.user import USERS_COLLECTION  # noqa: E402

ORIGIN = {"Origin": "http://localhost:5173"}


@pytest.fixture()
def db():
    database = mongomock.MongoClient(tz_aware=True)["edupath_test"]
    database[USERS_COLLECTION].create_index("email", unique=True)
    return database


@pytest.fixture()
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    # Not used as a context manager, so the real-MongoDB startup hook is skipped.
    yield TestClient(app)
    app.dependency_overrides.clear()


VALID_USER = {"full_name": "Asha Verma", "email": "asha@example.com", "password": "Sup3rSecret"}


@pytest.fixture()
def registered(client):
    response = client.post("/api/auth/register", json=VALID_USER, headers=ORIGIN)
    assert response.status_code == 201
    return VALID_USER


@pytest.fixture()
def logged_in(client, registered):
    response = client.post(
        "/api/auth/login",
        json={"email": registered["email"], "password": registered["password"]},
        headers=ORIGIN,
    )
    assert response.status_code == 200
    return response.json()
