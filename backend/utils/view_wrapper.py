from functools import wraps
from mongoengine.errors import ValidationError as MongoValidationError
from mongoengine.errors import DoesNotExist, NotUniqueError
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework import status
from .error_response import error_response


def handle_exceptions(func):
    """
    Decorator to wrap view methods with exception handling.

    This wrapper catches common exceptions and returns standardized error responses,
    allowing views to focus only on business logic implementation.

    Usage:
        class MyView(APIView):
            @handle_exceptions
            def post(self, request):
                # Only implement business logic here
                # No need for try-catch blocks
                return success_response(...)
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)

        except DRFValidationError as e:
            # Handle Django REST Framework validation errors
            # These are raised by serializer.is_valid(raise_exception=True)
            return error_response(
                message="Validation failed",
                errors=e.detail,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        except NotUniqueError as e:
            return error_response(
                message="Duplicate entry",
                errors={"detail": str(e)},
                status_code=status.HTTP_409_CONFLICT
            )

        except DoesNotExist as e:
            return error_response(
                message="Resource not found",
                errors={"detail": str(e)},
                status_code=status.HTTP_404_NOT_FOUND
            )

        except MongoValidationError as e:
            return error_response(
                message="Validation error",
                errors={"detail": str(e)},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        except ValueError as e:
            return error_response(
                message="Invalid value",
                errors={"detail": str(e)},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        except PermissionError as e:
            return error_response(
                message="Permission denied",
                errors={"detail": str(e)},
                status_code=status.HTTP_403_FORBIDDEN
            )

        except Exception as e:
            return error_response(
                message="Internal server error",
                errors={"detail": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return wrapper