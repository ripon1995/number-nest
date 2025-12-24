from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import User


class MongoRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        """
        Override to use MongoDB ObjectId as string
        """
        token = super().for_user(user)
        token['user_id'] = str(user.id)
        return token


class MongoJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """
        Override to fetch user from MongoDB using mongoengine
        """
        try:
            print(validated_token)
            user_id = validated_token.get('user_id')
            if user_id is None:
                raise InvalidToken('Token contained no recognizable user identification')

            user = User.objects(id=user_id).first()
            if user is None:
                raise InvalidToken('User not found')

            return user
        except Exception as e:
            raise InvalidToken(f'Invalid user: {str(e)}')