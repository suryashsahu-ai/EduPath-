"""Domain-level exceptions raised by services and translated to HTTP errors by routes."""


class EmailAlreadyRegisteredError(Exception):
    """An account already exists for the given email address."""


class InvalidCredentialsError(Exception):
    """Email/password did not match. Deliberately does not say which was wrong."""
