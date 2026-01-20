from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_admin
        )


class IsStudent(BasePermission):

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and not request.user.is_admin
        )


class IsAdminOrIsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_admin or not request.user.is_admin)
        )
