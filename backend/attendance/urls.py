from django.urls import path

from .views import AttendanceView

urlpatterns = [
    path('attendance-save/', AttendanceView.as_view(), name='attendance_save'),
]
