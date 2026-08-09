import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import RefreshToken, User, UserRole


class UserRepository:
    """Data access for the User model. No query logic belongs above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return await self.db.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        return await self.db.scalar(select(User).where(User.email == email))

    async def create(
        self, *, email: str, name: str, hashed_password: str, role: UserRole
    ) -> User:
        user = User(email=email, name=name, hashed_password=hashed_password, role=role.value)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        await self.db.commit()
        await self.db.refresh(user)
        return user


class RefreshTokenRepository:
    """Data access for the RefreshToken model. No query logic belongs above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(
        self, *, user_id: uuid.UUID, token_hash: str, expires_at: datetime
    ) -> RefreshToken:
        refresh_token = RefreshToken(
            user_id=user_id, token_hash=token_hash, expires_at=expires_at
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

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> None:
        result = await self.db.scalars(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None)
            )
        )
        now = datetime.now(timezone.utc)
        for refresh_token in result:
            refresh_token.revoked_at = now
        await self.db.commit()
