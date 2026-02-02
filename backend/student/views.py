from bson import ObjectId
from rest_framework import status
from rest_framework_mongoengine.generics import (
    CreateAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    UpdateAPIView,
)
from student.models import StudentProfile
from utils import success_response
from utils.permissions import IsAdminOrIsStudent, IsAdmin
from .serializers import (
    StudentProfileListSerializer,
    StudentProfileCreateSerializer,
    StudentProfileRetrieveUpdateDestroySerializer,
    CourseEnrollmentSerializer,
)


class StudentListCreateAPIView(ListCreateAPIView):
    queryset = StudentProfile.objects.all()

    def get_permissions(self):
        pass
        if self.request.method == "POST":
            return [IsAdmin()]
        return [IsAdminOrIsStudent()]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get("course_id")
        if course_id:
            course_obj_id = ObjectId(course_id)
            queryset = queryset.filter(course=course_obj_id)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = StudentProfileListSerializer(queryset, many=True)
        return success_response(data=serializer.data, message="Student Profile List")

    def create(self, request, *args, **kwargs):
        serializer = StudentProfileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        user = self.request.user
        if not user.profile_created:
            user.profile_created = True
            user.save(update_fields=['profile_created'])
        return success_response(
            data=serializer.data,
            message="Student Profile Created",
            status_code=status.HTTP_201_CREATED,
        )


class StudentProfileRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    lookup_field = "pk"
    queryset = StudentProfile.objects.all()

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAdminOrIsStudent()]

        return [IsAdmin()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = StudentProfileListSerializer(instance)
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
        return success_response(
            message="Student Profile Deleted", status_code=status.HTTP_204_NO_CONTENT
        )


class CourseEnrollmentView(UpdateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = CourseEnrollmentSerializer

    def put(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = serializer.validated_data["student_profile_id"]
        course = serializer.validated_data["course_id"]

        profile.course = course
        profile.save()

        return success_response(message="Course Enrollment Updated")
