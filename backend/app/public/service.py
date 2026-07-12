from datetime import datetime

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.courses.models import Course
from app.courses.repository import CourseRepository
from app.notices.models import Notice
from app.notices.repository import NoticeRepository


class PublicService:
    """Read-only business logic for the unauthenticated landing page. Wraps the
    same repositories app/courses/ and app/notices/ use directly, rather than
    their teacher-gated services - see .claude/rules/features/landing-page.md.
    """

    def __init__(self, course_repository: CourseRepository, notice_repository: NoticeRepository) -> None:
        self.course_repository = course_repository
        self.notice_repository = notice_repository

    async def list_courses(self) -> list[Course]:
        return await self.course_repository.list_all()

    async def list_upcoming_notices(self) -> list[Notice]:
        # event_datetime is a naive DateTime (see .claude/rules/features/notice.md), so the
        # cutoff must be naive too - datetime.now(), not an aware UTC timestamp.
        return await self.notice_repository.list_upcoming(datetime.now())


def get_public_service(db: AsyncSession = Depends(get_db)) -> PublicService:
    return PublicService(CourseRepository(db), NoticeRepository(db))
