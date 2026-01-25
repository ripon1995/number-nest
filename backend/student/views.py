from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from student.models import StudentProfile
from utils import success_response
from utils.permissions import IsAdminOrIsStudent, IsAdmin
from .serializers import (
    StudentProfileListCreateSerializer,
    StudentProfileRetrieveUpdateDestroySerializer,
)


class StudentListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAdminOrIsStudent]
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileListCreateSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data, message="Student Profile List")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return success_response(
            data=serializer.data,
            message="Student Profile Created",
            status_code=status.HTTP_201_CREATED,
        )


class StudentProfileRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    lookup_field = "pk"
    queryset = StudentProfile.objects.all()

    def get_permissions(self):
        if (
            self.request.method == "PUT"
            or self.request.method == "GET"
            or self.request.method == "PATCH"
        ):
            return [IsAdminOrIsStudent()]

        return [IsAdmin()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = StudentProfileListCreateSerializer(instance)
        return success_response(
            data=serializer.data, message="Student Profile Retrieved"
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = StudentProfileRetrieveUpdateDestroySerializer(
            instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return success_response(data=serializer.data, message="Student Profile Updated")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return success_response(message="Student Profile Deleted")
