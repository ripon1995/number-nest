from rest_framework.exceptions import APIException
from rest_framework import status


class CourseCapacityFullException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST  # Or 409 Conflict if it fits better
    default_detail = "The course has reached its maximum capacity."
    default_code = "course_capacity_full"


class InvalidBatchTimeException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Batch time must be in the future and during business hours."
    default_code = "invalid_batch_time"
