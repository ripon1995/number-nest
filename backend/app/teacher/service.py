from datetime import datetime, timedelta, timezone

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AuthenticationException, ConflictException
from app.teacher.models import Teacher
from app.teacher.repository import RefreshTokenRepository, TeacherRepository
from app.teacher.schemas import TeacherLogin, TeacherRegister, Token
from app.teacher.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)


class TeacherService:
    """Auth business logic: single-teacher registration, login, session lookup,
    and refresh-token issuance/rotation/revocation.
    """

    def __init__(
        self, repository: TeacherRepository, refresh_token_repository: RefreshTokenRepository
    ) -> None:
        self.repository = repository
        self.refresh_token_repository = refresh_token_repository

    async def register(self, payload: TeacherRegister) -> Teacher:
        # Single-teacher system: once the one account exists, registration is closed.
        if await self.repository.exists_any():
            raise ConflictException("A teacher account already exists")

        return await self.repository.create(
            email=payload.email,
            name=payload.name,
            hashed_password=hash_password(payload.password),
        )

    async def login(self, payload: TeacherLogin) -> Token:
        teacher = await self.repository.get_by_email(payload.email)
        if teacher is None or not verify_password(payload.password, teacher.hashed_password):
            raise AuthenticationException("Invalid email or password")

        return await self._issue_tokens(teacher.id)

    async def refresh(self, raw_refresh_token: str) -> Token:
        stored = await self.refresh_token_repository.get_valid_by_hash(
            hash_refresh_token(raw_refresh_token)
        )
        if stored is None:
            raise AuthenticationException("Invalid or expired refresh token")

        # Rotate: the presented token is single-use, so a stolen-and-replayed
        # token is invalidated the moment the legitimate client refreshes.
        await self.refresh_token_repository.revoke(stored)
        return await self._issue_tokens(stored.teacher_id)

    async def logout(self, raw_refresh_token: str) -> None:
        await self.refresh_token_repository.revoke_by_hash(hash_refresh_token(raw_refresh_token))

    async def get_by_id(self, teacher_id: int) -> Teacher | None:
        return await self.repository.get_by_id(teacher_id)

    async def _issue_tokens(self, teacher_id: int) -> Token:
        access_token = create_access_token(subject=str(teacher_id))

        raw_refresh_token = generate_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.jwt_refresh_token_expire_days
        )
        await self.refresh_token_repository.create(
            teacher_id=teacher_id,
            token_hash=hash_refresh_token(raw_refresh_token),
            expires_at=expires_at,
        )

        return Token(access_token=access_token, refresh_token=raw_refresh_token)


def get_teacher_service(db: AsyncSession = Depends(get_db)) -> TeacherService:
    return TeacherService(TeacherRepository(db), RefreshTokenRepository(db))
