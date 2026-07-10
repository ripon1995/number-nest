import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.notices.models import Notice
from app.notices.schemas import NoticeCreate, NoticeRead
from app.notices.service import NoticeService, get_notice_service

router = APIRouter(
    prefix="/notices", tags=["notices"], dependencies=[Depends(get_current_teacher)]
)


@router.post("", response_model=NoticeRead, status_code=status.HTTP_201_CREATED)
async def create_notice(
        payload: NoticeCreate,
        service: NoticeService = Depends(get_notice_service)
) -> Notice:
    return await service.create(payload)


@router.get("", response_model=list[NoticeRead])
async def list_notices(
        course_id: uuid.UUID | None = None,
        service: NoticeService = Depends(get_notice_service)
) -> list[Notice]:
    return await service.list_all(course_id=course_id)


@router.delete("/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notice(
        notice_id: uuid.UUID,
        service: NoticeService = Depends(get_notice_service)
) -> None:
    await service.delete_notice(notice_id)
