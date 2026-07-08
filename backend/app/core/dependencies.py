import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.teacher.models import Teacher
from app.teacher.security import decode_access_token

bearer_scheme = HTTPBearer()


async def get_current_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Teacher:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        teacher_id = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as exc:
        raise credentials_error from exc

    teacher = await db.get(Teacher, int(teacher_id))
    if teacher is None:
        raise credentials_error
    return teacher
