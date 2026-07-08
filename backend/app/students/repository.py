import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.students.models import Student


class StudentRepository:
    """Data access for the Student model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, student_id: uuid.UUID) -> Student | None:
        return await self.db.get(Student, student_id)

    async def list_all(self) -> list[Student]:
        result = await self.db.scalars(select(Student).order_by(Student.id))
        return list(result.all())

    async def create(
        self,
        *,
        name: str,
        college: str | None,
        contact: str,
        email: str | None,
        whatsapp_number: str,
    ) -> Student:
        student = Student(
            name=name,
            college=college,
            contact=contact,
            email=email,
            whatsapp_number=whatsapp_number,
        )
        self.db.add(student)
        await self.db.commit()
        await self.db.refresh(student)
        return student

    async def update(
        self,
        student: Student,
        *,
        name: str,
        college: str | None,
        contact: str,
        email: str | None,
        whatsapp_number: str,
    ) -> Student:
        student.name = name
        student.college = college
        student.contact = contact
        student.email = email
        student.whatsapp_number = whatsapp_number
        await self.db.commit()
        await self.db.refresh(student)
        return student

    async def delete(self, student: Student) -> None:
        await self.db.delete(student)
        await self.db.commit()
