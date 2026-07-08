import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.courses.models import Course
from app.courses.schemas import CourseCreate, CourseDetailRead, CourseRead, CourseUpdate
from app.courses.service import CourseService, get_course_service

router = APIRouter(
    prefix="/courses", tags=["courses"], dependencies=[Depends(get_current_teacher)]
)


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
        payload: CourseCreate,
        service: CourseService = Depends(get_course_service)
) -> Course:
    return await service.create(payload)


@router.get("", response_model=list[CourseRead])
async def list_courses(service: CourseService = Depends(get_course_service)) -> list[Course]:
    return await service.list_all()


@router.get("/{course_id}", response_model=CourseDetailRead)
async def get_course(
        course_id: uuid.UUID,
        service: CourseService = Depends(get_course_service)
) -> CourseDetailRead:
    course, students = await service.get_detail(course_id)
    return CourseDetailRead(**CourseRead.model_validate(course).model_dump(), students=students)


@router.put("/{course_id}", response_model=CourseRead)
async def update_course(
        course_id: uuid.UUID,
        payload: CourseUpdate,
        service: CourseService = Depends(get_course_service)
) -> Course:
    return await service.update(course_id, payload)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
        course_id: uuid.UUID,
        service: CourseService = Depends(get_course_service)
) -> None:
    await service.delete(course_id)
