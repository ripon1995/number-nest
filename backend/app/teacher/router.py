from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_teacher
from app.teacher.models import Teacher
from app.teacher.schemas import Token, TeacherLogin, TeacherRead, TeacherRegister
from app.teacher.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TeacherRead, status_code=status.HTTP_201_CREATED)
async def register(payload: TeacherRegister, db: AsyncSession = Depends(get_db)) -> Teacher:
    # Single-teacher system: once the one account exists, registration is closed.
    existing = await db.scalar(select(Teacher))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A teacher account already exists",
        )

    teacher = Teacher(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(teacher)
    await db.commit()
    await db.refresh(teacher)
    return teacher


@router.post("/login", response_model=Token)
async def login(payload: TeacherLogin, db: AsyncSession = Depends(get_db)) -> Token:
    teacher = await db.scalar(select(Teacher).where(Teacher.email == payload.email))
    if teacher is None or not verify_password(payload.password, teacher.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(subject=str(teacher.id))
    return Token(access_token=access_token)


@router.get("/me", response_model=TeacherRead)
def read_current_teacher(current_teacher: Teacher = Depends(get_current_teacher)) -> Teacher:
    return current_teacher
