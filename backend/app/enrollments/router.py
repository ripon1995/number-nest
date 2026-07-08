import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_teacher
from app.enrollments.models import Enrollment
from app.enrollments.schemas import EnrollmentCreate, EnrollmentFeeUpdate, EnrollmentRead
from app.enrollments.service import EnrollmentService, get_enrollment_service

router = APIRouter(
    prefix="/enrollments", tags=["enrollments"], dependencies=[Depends(get_current_teacher)]
)


@router.post("", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
        payload: EnrollmentCreate,
        service: EnrollmentService = Depends(get_enrollment_service)
) -> Enrollment:
    return await service.enroll(payload)


@router.get("", response_model=list[EnrollmentRead])
async def list_enrollments(
        student_id: uuid.UUID | None = None,
        course_id: uuid.UUID | None = None,
        service: EnrollmentService = Depends(get_enrollment_service)
) -> list[Enrollment]:
    return await service.list_all(student_id=student_id, course_id=course_id)


@router.patch("/{enrollment_id}/fee-paid", response_model=EnrollmentRead)
async def update_enrollment_fee_paid(
        enrollment_id: uuid.UUID,
        payload: EnrollmentFeeUpdate,
        service: EnrollmentService = Depends(get_enrollment_service)
) -> Enrollment:
    return await service.set_fee_paid(enrollment_id, payload.enrollment_fee_paid)


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enrollment(
        enrollment_id: uuid.UUID,
        service: EnrollmentService = Depends(get_enrollment_service)
) -> None:
    await service.unenroll(enrollment_id)
