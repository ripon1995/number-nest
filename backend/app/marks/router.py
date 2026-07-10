import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.marks.schemas import MarkBulkCreate, MarkRead
from app.marks.service import MarkService, get_mark_service

router = APIRouter(
    prefix="/marks", tags=["marks"], dependencies=[Depends(get_current_teacher)]
)


@router.post("/bulk", response_model=list[MarkRead], status_code=status.HTTP_201_CREATED)
async def submit_marks(
        payload: MarkBulkCreate,
        service: MarkService = Depends(get_mark_service)
) -> list[MarkRead]:
    return await service.record_bulk(payload)


@router.get("", response_model=list[MarkRead])
async def list_marks(
        exam_id: uuid.UUID,
        service: MarkService = Depends(get_mark_service)
) -> list[MarkRead]:
    return await service.list_for_exam(exam_id)


@router.delete("/{mark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mark(
        mark_id: uuid.UUID,
        service: MarkService = Depends(get_mark_service)
) -> None:
    await service.delete_mark(mark_id)
