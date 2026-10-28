"""MongoDB connection helpers (PyMongo)."""

import logging

from pymongo import ASCENDING, MongoClient
from pymongo.database import Database

from app.config import get_settings
from app.models.user import USERS_COLLECTION

logger = logging.getLogger("edupath.database")

_client: MongoClient | None = None


def get_client() -> MongoClient:
    """Create the MongoClient lazily so importing the app never needs a live database."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = MongoClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
            tz_aware=True,
        )
    return _client


def get_db() -> Database:
    """FastAPI dependency returning the application database."""
    return get_client()[get_settings().mongodb_db_name]


def init_db() -> None:
    """Verify the connection and make sure required indexes exist."""
    db = get_db()
    db.command("ping")
    db[USERS_COLLECTION].create_index([("email", ASCENDING)], unique=True, name="uniq_email")
    logger.info("Connected to MongoDB database '%s'.", db.name)


def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
