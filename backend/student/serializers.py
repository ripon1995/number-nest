from rest_framework_mongoengine import serializers
import re
from .models import StudentProfile
from custom_exceptions import StudentProfileException


class StudentProfileListCreateSerializer(serializers.DocumentSerializer):
    class Meta:
        model = StudentProfile
        fields = "__all__"
        read_only_fields = ["user", "course"]
        depth = 1

    @staticmethod
    def validate_father_name(father_name):
        father_name_capitalize = father_name.capitalize().strip()
        if len(father_name_capitalize) < 3 or len(father_name_capitalize) > 20:
            raise StudentProfileException("Name cannot be more than 20 characters")

        return father_name_capitalize

    @staticmethod
    def validate_father_contact(father_contact):
        bd_phone_regex = r"^(?:\+88|88)?(01[3-9]\d{8})$"
        if not re.match(bd_phone_regex, father_contact):
            raise StudentProfileException("Phone Number cannot be formatted correctly")
        match = re.match(bd_phone_regex, father_contact)
        return match.group(1)

    @staticmethod
    def validate_college_name(college_name):
        college_name = college_name.capitalize().strip()
        if len(college_name) < 3 or len(college_name) > 10:
            raise StudentProfileException(
                "College Name cannot be more than 10 characters"
            )
        return college_name

    @staticmethod
    def validate_email(email):
        email = email.strip()

        if StudentProfile.objects.filter(email=email).first():
            raise StudentProfileException("Email already exists")
        return email


class StudentProfileRetrieveUpdateDestroySerializer(serializers.DocumentSerializer):
    class Meta:
        model = StudentProfile
        fields = ["father_name", "father_contact", "college", "email"]

    @staticmethod
    def validate_father_name(father_name):
        father_name_capitalize = father_name.capitalize().strip()
        if len(father_name_capitalize) < 3 or len(father_name_capitalize) > 20:
            raise StudentProfileException("Name cannot be more than 20 characters")

        return father_name_capitalize

    @staticmethod
    def validate_father_contact(father_contact):
        bd_phone_regex = r"^(?:\+88|88)?(01[3-9]\d{8})$"
        if not re.match(bd_phone_regex, father_contact):
            raise StudentProfileException("Phone Number cannot be formatted correctly")
        match = re.match(bd_phone_regex, father_contact)
        return match.group(1)

    @staticmethod
    def validate_college_name(college_name):
        college_name = college_name.capitalize().strip()
        if len(college_name) < 3 or len(college_name) > 10:
            raise StudentProfileException(
                "College Name cannot be more than 10 characters"
            )
        return college_name

    @staticmethod
    def validate_email(email):
        email = email.strip()
        if StudentProfile.objects.filter(email=email).first():
            raise StudentProfileException("Email already exists")
        return email
