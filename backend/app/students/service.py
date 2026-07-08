import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.students.models import Student
from app.students.repository import StudentRepository
from app.students.schemas import StudentCreate, StudentUpdate


class StudentService:
    """Business logic for creating/managing students."""

    def __init__(self, repository: StudentRepository) -> None:
        self.repository = repository

    async def create(self, payload: StudentCreate) -> Student:
        return await self.repository.create(
            name=payload.name,
            college=payload.college,
            contact=payload.contact,
            email=payload.email,
            whatsapp_number=payload.whatsapp_number,
        )

    async def list_all(self) -> list[Student]:
        return await self.repository.list_all()

    async def get_by_id(self, student_id: uuid.UUID) -> Student:
        student = await self.repository.get_by_id(student_id)
        if student is None:
            raise NotFoundException(f"Student {student_id} not found")
        return student

    async def update(self, student_id: uuid.UUID, payload: StudentUpdate) -> Student:
        student = await self.get_by_id(student_id)
        return await self.repository.update(
            student,
            name=payload.name,
            college=payload.college,
            contact=payload.contact,
            email=payload.email,
            whatsapp_number=payload.whatsapp_number,
        )

    async def delete(self, student_id: uuid.UUID) -> None:
        student = await self.get_by_id(student_id)
        await self.repository.delete(student)


def get_student_service(db: AsyncSession = Depends(get_db)) -> StudentService:
    return StudentService(StudentRepository(db))
