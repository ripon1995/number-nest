import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AuthenticationException
from app.users.models import User, UserRole
from app.users.repository import RefreshTokenRepository, UserRepository
from app.users.schemas import UserLogin, UserRegister, Token
from app.users.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)


class UserService:
    """Auth business logic: registration (student self-serve, admin API-only),
    login, session lookup, and refresh-token issuance/rotation/revocation.
    """

    def __init__(
        self, repository: UserRepository, refresh_token_repository: RefreshTokenRepository
    ) -> None:
        self.repository = repository
        self.refresh_token_repository = refresh_token_repository

    async def register(self, payload: UserRegister) -> User:
        """Public self-registration - always creates a student account. There is
        no way to request role=admin through this method or its payload.
        """
        return await self.repository.create(
            email=payload.email,
            name=payload.name,
            hashed_password=hash_password(payload.password),
            role=UserRole.STUDENT,
        )

    async def register_admin(self, payload: UserRegister) -> User:
        """Admin-only route target (see require_admin) - creates another admin
        account. Deliberately a separate method from register, not a role
        parameter on it, so the public self-registration path can never be
        pointed at admin creation by a future refactor.
        """
        return await self.repository.create(
            email=payload.email,
            name=payload.name,
            hashed_password=hash_password(payload.password),
            role=UserRole.ADMIN,
        )

    async def login(self, payload: UserLogin) -> Token:
        user = await self.repository.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise AuthenticationException("Invalid email or password")

        return await self._issue_tokens(user.id)

    async def refresh(self, raw_refresh_token: str) -> Token:
        stored = await self.refresh_token_repository.get_valid_by_hash(
            hash_refresh_token(raw_refresh_token)
        )
        if stored is None:
            raise AuthenticationException("Invalid or expired refresh token")

        # Rotate: the presented token is single-use, so a stolen-and-replayed
        # token is invalidated the moment the legitimate client refreshes.
        await self.refresh_token_repository.revoke(stored)
        return await self._issue_tokens(stored.user_id)

    async def logout(self, raw_refresh_token: str) -> None:
        await self.refresh_token_repository.revoke_by_hash(hash_refresh_token(raw_refresh_token))

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return await self.repository.get_by_id(user_id)

    async def _issue_tokens(self, user_id: uuid.UUID) -> Token:
        access_token = create_access_token(subject=str(user_id))

        raw_refresh_token = generate_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.jwt_refresh_token_expire_days
        )
        await self.refresh_token_repository.create(
            user_id=user_id,
            token_hash=hash_refresh_token(raw_refresh_token),
            expires_at=expires_at,
        )

        return Token(access_token=access_token, refresh_token=raw_refresh_token)


def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(db), RefreshTokenRepository(db))
