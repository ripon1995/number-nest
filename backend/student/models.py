from mongoengine import (
    Document,
    StringField,
    EmailField,
    ReferenceField,
    BooleanField,
    CASCADE,
)

from course.models import Course
from user.models import User


class StudentProfile(Document):
    user = ReferenceField(User, reverse_delete_rule=CASCADE, unique=True)
    father_name = StringField(unique=True, required=True, max_length=100)
    college = StringField(required=True, max_length=100)
    father_contact = StringField()
    email = EmailField(unique=True)
    course = ReferenceField(Course, required=False)

    meta = {
        "collection": "student_profiles",
    }
