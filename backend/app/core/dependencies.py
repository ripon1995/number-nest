import uuid

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AuthenticationException, PermissionDeniedException
from app.users.models import User, UserRole
from app.users.security import decode_access_token
from app.users.service import UserService, get_user_service


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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    service: UserService = Depends(get_user_service),
) -> User:
    try:
        user_id = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as exc:
        raise AuthenticationException() from exc

    try:
        user = await service.get_by_id(uuid.UUID(user_id))
    except ValueError as exc:
        raise AuthenticationException() from exc
    if user is None:
        raise AuthenticationException()
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise PermissionDeniedException()
    return current_user
