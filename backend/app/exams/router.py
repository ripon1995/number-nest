import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.exams.models import Exam
from app.exams.schemas import ExamCreate, ExamRead
from app.exams.service import ExamService, get_exam_service

router = APIRouter(
    prefix="/exams", tags=["exams"], dependencies=[Depends(get_current_teacher)]
)


@router.post("", response_model=ExamRead, status_code=status.HTTP_201_CREATED)
async def create_exam(
        payload: ExamCreate,
        service: ExamService = Depends(get_exam_service)
) -> Exam:
    return await service.create(payload)


@router.get("", response_model=list[ExamRead])
async def list_exams(
        course_id: uuid.UUID | None = None,
        service: ExamService = Depends(get_exam_service)
) -> list[Exam]:
    return await service.list_all(course_id=course_id)


@router.get("/{exam_id}", response_model=ExamRead)
async def get_exam(
        exam_id: uuid.UUID,
        service: ExamService = Depends(get_exam_service)
) -> Exam:
    return await service.get_detail(exam_id)


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam(
        exam_id: uuid.UUID,
        service: ExamService = Depends(get_exam_service)
) -> None:
    await service.delete_exam(exam_id)
