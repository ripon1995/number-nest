from rest_framework_mongoengine import serializers
from .models import Course
from custom_exceptions import CourseCapacityFullException


class CourseCreateSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['id']

    @staticmethod
    def validate_capacity(capacity):
        if capacity <= 0:
            raise CourseCapacityFullException()

        return capacity


class CourseRetrieveSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Course
        fields = "__all__"
        read_only_fields = ['id']
