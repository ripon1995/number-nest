import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.teacher.models import RefreshToken, Teacher


class TeacherRepository:
    """Data access for the Teacher model. No query logic belongs above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, teacher_id: uuid.UUID) -> Teacher | None:
        return await self.db.get(Teacher, teacher_id)

    async def get_by_email(self, email: str) -> Teacher | None:
        return await self.db.scalar(select(Teacher).where(Teacher.email == email))

    async def exists_any(self) -> bool:
        return await self.db.scalar(select(Teacher)) is not None

    async def create(self, *, email: str, name: str, hashed_password: str) -> Teacher:
        teacher = Teacher(email=email, name=name, hashed_password=hashed_password)
        self.db.add(teacher)
        await self.db.commit()
        await self.db.refresh(teacher)
        return teacher


class RefreshTokenRepository:
    """Data access for the RefreshToken model. No query logic belongs above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(
        self, *, teacher_id: uuid.UUID, token_hash: str, expires_at: datetime
    ) -> RefreshToken:
        refresh_token = RefreshToken(
            teacher_id=teacher_id, token_hash=token_hash, expires_at=expires_at
        )
        self.db.add(refresh_token)
        await self.db.commit()
        await self.db.refresh(refresh_token)
        return refresh_token

    async def get_valid_by_hash(self, token_hash: str) -> RefreshToken | None:
        return await self.db.scalar(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > datetime.now(timezone.utc),
            )
        )

    async def revoke(self, refresh_token: RefreshToken) -> None:
        refresh_token.revoked_at = datetime.now(timezone.utc)
        await self.db.commit()

    async def revoke_by_hash(self, token_hash: str) -> None:
        refresh_token = await self.db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        if refresh_token is not None and refresh_token.revoked_at is None:
            await self.revoke(refresh_token)
