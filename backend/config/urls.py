from django.urls import path, include

urlpatterns = [
    path('course/api/', include('course.urls')),
]
