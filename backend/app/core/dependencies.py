import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AuthenticationException
from app.teacher.models import Teacher
from app.teacher.security import decode_access_token
from app.teacher.service import TeacherService, get_teacher_service

bearer_scheme = HTTPBearer()


async def get_current_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    service: TeacherService = Depends(get_teacher_service),
) -> Teacher:
    try:
        teacher_id = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as exc:
        raise AuthenticationException() from exc

    teacher = await service.get_by_id(int(teacher_id))
    if teacher is None:
        raise AuthenticationException()
    return teacher
