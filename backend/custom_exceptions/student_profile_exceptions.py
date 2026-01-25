from rest_framework.exceptions import APIException
from rest_framework import status


class StudentProfileException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Student Profile Error"
    default_code = "student_profile_error"
