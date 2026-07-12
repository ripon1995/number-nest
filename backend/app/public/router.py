from fastapi import APIRouter, Depends

from app.courses.models import Course
from app.courses.schemas import CourseRead
from app.notices.models import Notice
from app.notices.schemas import NoticeRead
from app.public.service import PublicService, get_public_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/courses", response_model=list[CourseRead])
async def list_public_courses(service: PublicService = Depends(get_public_service)) -> list[Course]:
    return await service.list_courses()


@router.get("/notices", response_model=list[NoticeRead])
async def list_public_notices(service: PublicService = Depends(get_public_service)) -> list[Notice]:
    return await service.list_upcoming_notices()
