from rest_framework import status
from rest_framework_mongoengine.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)

from utils import success_response
from utils.permissions import IsAdmin, IsAdminOrIsStudent, IsPublic
from .models import Course
from .serializers import (
    CourseCreateSerializer,
    CourseRetrieveSerializer,
    CourseUpdateSerializer,
)


class CourseListCreateAPIView(ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsPublic()]
        return [IsPublic()]

    def list(self, request, *args, **kwargs):
        queryset = self.queryset
        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            data=serializer.data, message="Course list fetched successfully"
        )

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            data=serializer.data,
            message="Course created successfully",
            status_code=status.HTTP_201_CREATED,
        )


class CourseRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    lookup_field = "id"
    queryset = Course.objects.all()

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsPublic()]
        return [IsPublic()]

    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = CourseRetrieveSerializer(course)
        return success_response(
            data=serializer.data, message="Course fetched successfully"
        )

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = CourseUpdateSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(
            data=serializer.data, message="Course updated successfully"
        )

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        course.delete()
        return success_response(
            message="Course deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT,
        )
