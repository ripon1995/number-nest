from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.teacher.models import Teacher
from app.teacher.schemas import Token, TeacherLogin, TeacherRead, TeacherRegister
from app.teacher.service import TeacherService, get_teacher_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TeacherRead, status_code=status.HTTP_201_CREATED)
async def register(
    payload: TeacherRegister, service: TeacherService = Depends(get_teacher_service)
) -> Teacher:
    return await service.register(payload)


@router.post("/login", response_model=Token)
async def login(
    payload: TeacherLogin, service: TeacherService = Depends(get_teacher_service)
) -> Token:
    return await service.login(payload)


@router.get("/me", response_model=TeacherRead)
def read_current_teacher(current_teacher: Teacher = Depends(get_current_teacher)) -> Teacher:
    return current_teacher
