from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from utils import success_response
from utils.permissions import IsAdmin, IsAdminOrIsStudent
from .models import Course
from .serializers import CourseCreateSerializer, CourseRetrieveSerializer


class CourseListCreateAPIView(ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer

    def get_permissions(self):
        pass
        if self.request.method == "POST":
            return [IsAdmin()]
        return [IsAdminOrIsStudent()]

    def list(self, request, *args, **kwargs):
        queryset = self.queryset
        serializer = self.get_serializer(queryset, many=True)
        return success_response(
            data=serializer.data, message="Course list fetched successfully"
        )


class CourseRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    lookup_field = 'id'
    queryset = Course.objects.all()
    serializer_class = CourseRetrieveSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAdminOrIsStudent()]
        return [IsAdmin()]

    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.serializer_class(course)
        return success_response(data=serializer.data, message="Course fetched successfully")
