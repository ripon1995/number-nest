import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AuthenticationException
from app.teacher.models import Teacher
from app.teacher.security import decode_access_token

bearer_scheme = HTTPBearer()


async def get_current_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Teacher:
    try:
        teacher_id = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as exc:
        raise AuthenticationException() from exc

    teacher = await db.get(Teacher, int(teacher_id))
    if teacher is None:
        raise AuthenticationException()
    return teacher
