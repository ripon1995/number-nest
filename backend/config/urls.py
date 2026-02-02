from django.urls import path, include

urlpatterns = [
    path("auth/api/", include("user.urls")),
    path("course/api/", include("course.urls")),
    path("student/api/", include("student.urls")),
    path("attendance/api/", include("attendance.urls")),
]
