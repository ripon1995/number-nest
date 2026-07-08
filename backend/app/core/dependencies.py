import uuid

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AuthenticationException
from app.teacher.models import Teacher
from app.teacher.security import decode_access_token
from app.teacher.service import TeacherService, get_teacher_service


class BearerAuth(HTTPBearer):
    """HTTPBearer raises a bare HTTPException (missing/malformed Authorization
    header) that bypasses our AppException handler and its response shape.
    Re-raise as AuthenticationException so every auth failure looks the same.
    """

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        try:
            return await super().__call__(request)
        except HTTPException as exc:
            raise AuthenticationException(exc.detail) from exc


bearer_scheme = BearerAuth()


async def get_current_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    service: TeacherService = Depends(get_teacher_service),
) -> Teacher:
    try:
        teacher_id = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as exc:
        raise AuthenticationException() from exc

    try:
        teacher = await service.get_by_id(uuid.UUID(teacher_id))
    except ValueError as exc:
        raise AuthenticationException() from exc
    if teacher is None:
        raise AuthenticationException()
    return teacher
