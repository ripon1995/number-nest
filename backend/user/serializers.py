from rest_framework import serializers
from .models import User


class UserRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_phone_number(self, value):
        if User.objects(phone_number=value).first():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user
