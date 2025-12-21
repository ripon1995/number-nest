from rest_framework.views import APIView
from rest_framework import status
from .serializers import UserRegistrationSerializer
from utils import success_response, handle_exceptions


class RegisterView(APIView):
    @handle_exceptions
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            message="User created successfully",
            status_code=status.HTTP_201_CREATED,
            data=serializer.data
        )

