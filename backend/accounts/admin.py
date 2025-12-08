from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("username", "email", "is_admin", "is_volunteer", "is_staff", "is_active")
    list_filter = ("is_admin", "is_volunteer", "is_staff", "is_active")
    fieldsets = (
        ("Login Info", {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "email")}),
        ("Roles", {"fields": ("is_admin", "is_volunteer", "is_staff", "is_active")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "is_admin", "is_volunteer"),
        }),
    )
    search_fields = ("username", "email")
    ordering = ("username",)
