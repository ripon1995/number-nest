import uuid
from datetime import date

from fastapi import APIRouter, Depends, status

from app.attendance.schemas import AttendanceBulkCreate, AttendanceRead
from app.attendance.service import AttendanceService, get_attendance_service
from app.core.dependencies import get_current_teacher

router = APIRouter(
    prefix="/attendance", tags=["attendance"], dependencies=[Depends(get_current_teacher)]
)


@router.post("/bulk", response_model=list[AttendanceRead], status_code=status.HTTP_201_CREATED)
async def submit_attendance(
        payload: AttendanceBulkCreate,
        service: AttendanceService = Depends(get_attendance_service)
) -> list[AttendanceRead]:
    return await service.record_bulk(payload)


@router.get("", response_model=list[AttendanceRead])
async def list_attendance(
        course_id: uuid.UUID,
        session_date: date | None = None,
        service: AttendanceService = Depends(get_attendance_service)
) -> list[AttendanceRead]:
    return await service.list_for_course(course_id, session_date)


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendance(
        attendance_id: uuid.UUID,
        service: AttendanceService = Depends(get_attendance_service)
) -> None:
    await service.delete_attendance(attendance_id)
