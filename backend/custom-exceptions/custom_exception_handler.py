import logging
from rest_framework import status
from rest_framework.views import exception_handler
from utils.error_response import error_response

logger = logging.getLogger(__name__)


def flatten_errors(error_dict):
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
    errors = flatten_errors(response.data)
    message = "Bad Request"
    match response.status_code:
        case status.HTTP_400_BAD_REQUEST:
            message = "Bad Request"
        case status.HTTP_401_UNAUTHORIZED:
            message = "Unauthorized"

    return message, errors


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    message = "An unknown error occurred."

    if status.is_client_error(response.status_code):
        message, errors = __handle_client_error(response)
        return error_response(
            message=message,
            errors=response.data,
            status_code=response.status_code,
        )

    logger.critical(f"Unhandled Exception: {exc}", exc_info=True)
    return error_response(
        message=message,
        errors=exc.errors() if hasattr(exc, "errors") else None,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
