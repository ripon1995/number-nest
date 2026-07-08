from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.teacher.models import Teacher


class TeacherRepository:
    """Data access for the Teacher model. No query logic belongs above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, teacher_id: int) -> Teacher | None:
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
