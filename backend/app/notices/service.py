import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.courses.repository import CourseRepository
from app.notices.models import Notice
from app.notices.repository import NoticeRepository
from app.notices.schemas import NoticeCreate


class NoticeService:
    """Business logic for announcing/listing notices. Add/delete only - no
    edit-in-place; see .claude/rules/features/notice.md.
    """

    def __init__(
        self,
        repository: NoticeRepository,
        course_repository: CourseRepository,
    ) -> None:
        self.repository = repository
        self.course_repository = course_repository

    async def create(self, payload: NoticeCreate) -> Notice:
        if await self.course_repository.get_by_id(payload.course_id) is None:
            raise NotFoundException(f"Course {payload.course_id} not found")

        return await self.repository.create(
            course_id=payload.course_id,
            event_name=payload.event_name,
            event_place=payload.event_place,
            event_datetime=payload.event_datetime,
        )

    async def list_all(self, *, course_id: uuid.UUID | None = None) -> list[Notice]:
        return await self.repository.list_all(course_id=course_id)

    async def delete_notice(self, notice_id: uuid.UUID) -> None:
        notice = await self.repository.get_by_id(notice_id)
        if notice is None:
            raise NotFoundException(f"Notice {notice_id} not found")
        await self.repository.delete(notice)


def get_notice_service(db: AsyncSession = Depends(get_db)) -> NoticeService:
    return NoticeService(NoticeRepository(db), CourseRepository(db))
