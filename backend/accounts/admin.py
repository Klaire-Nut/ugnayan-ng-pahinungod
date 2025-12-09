from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from django.forms import TextInput, Textarea


class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("email", "is_staff", "is_active", "is_admin", "is_volunteer")
    list_filter = ("is_staff", "is_active", "is_admin", "is_volunteer")

    ordering = ("email",)
    search_fields = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "is_admin", "is_volunteer")}),
        ("Groups", {"fields": ("groups",)}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )


admin.site.register(User, CustomUserAdmin)
