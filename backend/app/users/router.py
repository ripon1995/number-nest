from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, require_admin
from app.users.models import User
from app.users.schemas import (
    RefreshTokenRequest,
    UserLogin,
    UserRead,
    UserRegister,
    Token,
)
from app.users.service import UserService, get_user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
        payload: UserRegister,
        service: UserService = Depends(get_user_service)
) -> User:
    return await service.register(payload)


@router.post(
    "/register-admin",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def register_admin(
        payload: UserRegister,
        service: UserService = Depends(get_user_service)
) -> User:
    """Admin-only: creates another admin account. Not called from any frontend
    UI - meant to be hit directly (curl/Postman/etc.) by an existing admin.
    See .claude/rules/features/role-based-access.md.
    """
    return await service.register_admin(payload)


@router.post("/login", response_model=Token)
async def login(
        payload: UserLogin,
        service: UserService = Depends(get_user_service)
) -> Token:
    return await service.login(payload)


@router.post("/refresh", response_model=Token)
async def refresh(
        payload: RefreshTokenRequest,
        service: UserService = Depends(get_user_service)
) -> Token:
    return await service.refresh(payload.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
        payload: RefreshTokenRequest,
        service: UserService = Depends(get_user_service)
) -> None:
    await service.logout(payload.refresh_token)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
