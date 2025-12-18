from rest_framework.serializers import Serializer, IntegerField, CharField, DateTimeField, DecimalField

from .models import Course


class CourseCreateSerializer(Serializer):
    id = CharField(read_only=True)
    title = CharField(required=True)
    description = CharField(required=True)
    batch_days = CharField(required=True)
    batch_time = DateTimeField(required=True)
    capacity = IntegerField(required=True)
    course_fee = DecimalField(required=True, max_digits=4, decimal_places=0)

    def create(self, validated_data):
        course = Course(**validated_data)
        course.save()
        return course