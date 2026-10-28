"""EduPath API entry point.

Run from the backend/ directory:
    uvicorn app.main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.database import Database
from pymongo.errors import PyMongoError

from app.config import get_settings
from app.database import close_db, get_db, init_db
from app.routes import auth

logging.basicConfig(level=logging.INFO, format="%(levelname)s [%(name)s] %(message)s")
logger = logging.getLogger("edupath")

settings = get_settings()

UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        init_db()
    except PyMongoError as exc:
        # Keep the API up so /docs and /api/health can explain the problem.
        logger.error(
            "Could not connect to MongoDB (%s). Check MONGODB_URI in backend/.env and make sure "
            "MongoDB is running. Auth endpoints will return 503 until it is reachable.",
            exc.__class__.__name__,
        )
    yield
    close_db()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
)


# Added first => runs inside CORS. Rejects state-changing requests from untrusted origins.
@app.middleware("http")
async def enforce_trusted_origin(request: Request, call_next):
    if request.method in UNSAFE_METHODS:
        origin = request.headers.get("origin")
        if origin and origin.rstrip("/") not in settings.origins:
            return JSONResponse(status_code=403, content={"detail": "Origin not allowed."})
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Return per-field messages without echoing submitted values (e.g. passwords)."""
    errors: dict[str, str] = {}
    for error in exc.errors():
        loc = [str(part) for part in error["loc"] if part not in ("body", "query", "path")]
        field = loc[-1] if loc else "request"
        if field in errors:
            continue
        message = error["msg"].removeprefix("Value error, ")
        if field == "email":
            message = "Enter a valid email address."
        errors[field] = message
    return JSONResponse(
        status_code=422,
        content={"detail": "Please correct the highlighted fields.", "errors": errors},
    )


@app.exception_handler(PyMongoError)
async def database_error_handler(_: Request, exc: PyMongoError) -> JSONResponse:
    logger.error("Database error: %s", exc.__class__.__name__)
    return JSONResponse(
        status_code=503,
        content={"detail": "The service is temporarily unavailable. Please try again shortly."},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s", exc.__class__.__name__)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


app.include_router(auth.router)


@app.get("/api/health", tags=["health"])
def health(db: Database = Depends(get_db)) -> dict[str, str]:
    try:
        db.command("ping")
        database = "ok"
    except PyMongoError:
        database = "unavailable"
    return {"status": "ok", "database": database}
