from rest_framework.serializers import (
    Serializer,
    ValidationError,
    CharField,
    SerializerMethodField,
)
from django.contrib.auth.hashers import check_password
from .models import User, UserProfile
from rest_framework_mongoengine import serializers as mongo_serializers


class UserRegistrationSerializer(Serializer):
    name = CharField(max_length=100)
    phone_number = CharField()
    password = CharField(write_only=True)

    def validate_phone_number(self, value):
        if User.objects(phone_number=value).first():
            raise ValidationError("A user with this phone number already exists.")
        return value

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data["password"])
        user.save()
        return user


class UserLoginSerializer(Serializer):
    phone_number = CharField()
    password = CharField(write_only=True)

    def validate(self, data):
        phone_number = data.get("phone_number")
        password = data.get("password")

        user = User.objects(phone_number=phone_number).first()
        if not user:
            raise ValidationError("Invalid phone number or password.")

        if not check_password(password, user.password):
            raise ValidationError("Invalid phone number or password.")

        data["user"] = user
        return data


class UserProfileSerializer(mongo_serializers.DocumentSerializer):
    father_name = SerializerMethodField(allow_null=True)
    college = SerializerMethodField(allow_null=True)
    father_contact = SerializerMethodField(allow_null=True)
    email = SerializerMethodField(allow_null=True)

    class Meta:
        model = User
        fields = [
            "name",
            "phone_number",
            "father_name",
            "college",
            "father_contact",
            "email",
        ]

    def get_father_name(self, obj):
        profile = self.context.get("profile")
        return profile.father_name if profile else None

    def get_college(self, obj):
        profile = self.context.get("profile")
        return profile.college if profile else None

    def get_father_contact(self, obj):
        profile = self.context.get("profile")
        return profile.father_contact if profile else None

    def get_email(self, obj):
        profile = self.context.get("profile")
        return profile.email if profile else None
