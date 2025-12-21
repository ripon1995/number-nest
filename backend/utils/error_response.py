from rest_framework.response import Response
from rest_framework import status


def error_response(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Standard error response template

    Args:
        message (str): Error message
        errors (dict/list): Detailed error information
        status_code (int): HTTP status code (default: 400)

    Returns:
        Response: DRF Response object with standardized error format
    """
    response_data = {
        "success": False,
        "message": message,
        "errors": errors if errors is not None else {}
    }

    return Response(response_data, status=status_code)