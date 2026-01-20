import logging
from rest_framework import status
from rest_framework.views import exception_handler
from utils.error_response import error_response

logger = logging.getLogger(__name__)


def __flatten_errors(error_dict):
    """
    Converts {'field': ['Error message']} into 'field: Error message'
    """
    messages = []
    for field, errors in error_dict.items():
        if isinstance(errors, list):
            # Take the first error for that field
            messages.append(f"{field.replace('_', ' ').capitalize()}: {errors[0]}")
        else:
            messages.append(f"{field}: {errors}")
    return " ".join(messages)


def __handle_client_error(response):
    errors = response.data
    message = "Bad Request"
    match response.status_code:
        case status.HTTP_400_BAD_REQUEST:
            message = "Bad Request"
        case status.HTTP_401_UNAUTHORIZED:
            message = "Unauthorized"
        case status.HTTP_403_FORBIDDEN:
            message = "Permission Denied"

    return message, errors, response.status_code


def __handle_server_error(response, exc):
    message = "Internal Server Error"
    errors = exc.errors() if hasattr(exc, "errors") else None
    status_code = response.status_code

    return message, errors, status_code


def __unhandled_server_error(exc):
    message = "Internal Server Error"
    errors = exc.errors() if hasattr(exc, "errors") else None
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    return message, errors, status_code


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    message = "An unknown error occurred."
    errors = None
    status_code = None

    if response is not None:
        if status.is_client_error(response.status_code):
            logger.warning(f"Client Exception: {exc}", exc_info=True)
            message, errors, status_code = __handle_client_error(response)

        elif status.is_server_error(response.status_code):
            logger.warning(f"DRF Server error: {exc}", exc_info=True)
            message, errors, status_code = __handle_server_error(response, exc)

    else:
        logger.critical(f"Server crash: {exc}", exc_info=True)
        message, errors, status_code = __unhandled_server_error(exc)

    return error_response(
        message=message,
        errors=errors,
        status_code=status_code,
    )
