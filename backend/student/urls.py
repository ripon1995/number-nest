from django.urls import path
from .views import (
    StudentListCreateAPIView,
    StudentProfileRetrieveUpdateDestroyAPIView,
    CourseEnrollmentView,
)

urlpatterns = [
    path("profiles/", StudentListCreateAPIView.as_view(), name="student_list_create"),
    path(
        "profile/<str:pk>/",
        StudentProfileRetrieveUpdateDestroyAPIView.as_view(),
        name="student_detail_update_delete",
    ),
    path("enroll-course/", CourseEnrollmentView.as_view(), name="enroll_course"),
]
