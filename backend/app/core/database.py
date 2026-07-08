from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# statement_cache_size=0: required for Supabase's pgbouncer pooler in transaction
# mode, which doesn't support asyncpg's server-side prepared statement cache.
engine = create_async_engine(
    settings.database_url, connect_args={"statement_cache_size": 0}
)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession]:
    async with SessionLocal() as db:
        yield db
