import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.notices.models import Notice


class NoticeRepository:
    """Data access for the Notice model. No business rules belong above this layer."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, notice_id: uuid.UUID) -> Notice | None:
        return await self.db.get(Notice, notice_id)

    async def list_all(self, *, course_id: uuid.UUID | None = None) -> list[Notice]:
        query = select(Notice).order_by(Notice.event_datetime.desc())
        if course_id is not None:
            query = query.where(Notice.course_id == course_id)
        result = await self.db.scalars(query)
        return list(result.all())

    async def create(
        self,
        *,
        course_id: uuid.UUID,
        event_name: str,
        event_place: str,
        event_datetime: datetime,
    ) -> Notice:
        notice = Notice(
            course_id=course_id,
            event_name=event_name,
            event_place=event_place,
            event_datetime=event_datetime,
        )
        self.db.add(notice)
        await self.db.commit()
        await self.db.refresh(notice)
        return notice

    async def delete(self, notice: Notice) -> None:
        await self.db.delete(notice)
        await self.db.commit()
