from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AuthenticationException, ConflictException
from app.teacher.models import Teacher
from app.teacher.repository import TeacherRepository
from app.teacher.schemas import TeacherLogin, TeacherRegister, Token
from app.teacher.security import create_access_token, hash_password, verify_password


class TeacherService:
    """Auth business logic: single-teacher registration, login, session lookup."""

    def __init__(self, repository: TeacherRepository) -> None:
        self.repository = repository

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

        access_token = create_access_token(subject=str(teacher.id))
        return Token(access_token=access_token)

    async def get_by_id(self, teacher_id: int) -> Teacher | None:
        return await self.repository.get_by_id(teacher_id)


def get_teacher_service(db: AsyncSession = Depends(get_db)) -> TeacherService:
    return TeacherService(TeacherRepository(db))
