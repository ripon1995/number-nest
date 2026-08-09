from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user, require_admin
from app.users.models import User
from app.users.schemas import (
    PasswordResetRequest,
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


@router.patch(
    "/reset-password",
    response_model=UserRead,
    dependencies=[Depends(require_admin)],
)
async def reset_password(
        payload: PasswordResetRequest,
        service: UserService = Depends(get_user_service)
) -> User:
    """Admin-only: sets a new password for an existing account (admin or
    student), identified by email. Not called from any frontend UI - meant
    to be hit directly (curl/Postman/etc.) by an existing admin, same
    operational trust level as register-admin.
    See .claude/rules/features/role-based-access.md.
    """
    return await service.reset_password(payload)


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
