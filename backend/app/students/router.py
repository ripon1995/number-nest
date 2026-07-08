import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.students.models import Student
from app.students.schemas import StudentCreate, StudentRead, StudentUpdate
from app.students.service import StudentService, get_student_service

router = APIRouter(
    prefix="/students", tags=["students"], dependencies=[Depends(get_current_teacher)]
)


@router.post("", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
async def create_student(
        payload: StudentCreate,
        service: StudentService = Depends(get_student_service)
) -> Student:
    return await service.create(payload)


@router.get("", response_model=list[StudentRead])
async def list_students(service: StudentService = Depends(get_student_service)) -> list[Student]:
    return await service.list_all()


@router.get("/{student_id}", response_model=StudentRead)
async def get_student(
        student_id: uuid.UUID,
        service: StudentService = Depends(get_student_service)
) -> Student:
    return await service.get_by_id(student_id)


@router.put("/{student_id}", response_model=StudentRead)
async def update_student(
        student_id: uuid.UUID,
        payload: StudentUpdate,
        service: StudentService = Depends(get_student_service)
) -> Student:
    return await service.update(student_id, payload)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
        student_id: uuid.UUID,
        service: StudentService = Depends(get_student_service)
) -> None:
    await service.delete(student_id)
