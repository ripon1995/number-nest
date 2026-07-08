import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str:
    """Returns the token subject. Raises jwt.InvalidTokenError if invalid/expired."""
    payload = jwt.decode(
        token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
    )
    return payload["sub"]


def generate_refresh_token() -> str:
    """A high-entropy opaque token — unlike the JWT access token, it carries no
    payload, so it can only be validated by looking up its hash in the DB (which
    also makes it revocable).
    """
    return secrets.token_urlsafe(48)


def hash_refresh_token(raw_token: str) -> str:
    """SHA-256 is sufficient here (not bcrypt): the token is already high-entropy
    and random, not a low-entropy user-chosen password vulnerable to brute force.
    """
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
