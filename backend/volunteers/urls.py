from django.urls import path
from .views import (
    volunteer_login,
    volunteer_logout,
    VolunteerProfileView,
    VolunteerHistoryView,
    ChangePasswordView,
    RegisterVolunteer
)

urlpatterns = [
    # Auth
    path('login/', volunteer_login, name='volunteer-login'),
    path('logout/', volunteer_logout, name='volunteer-logout'),

    # Registration
    path('register/', RegisterVolunteer.as_view(), name='volunteer-register'),

    # Profile Management
    path('profile/', VolunteerProfileView.as_view(), name='volunteer-profile'),

    # Volunteering History
    path('history/', VolunteerHistoryView.as_view(), name='volunteer-history'),

    # Add this for frontend "current user" request
    path('user/', VolunteerProfileView.as_view(), name='volunteer-current-user'),

    # Privacy Settings
    path('change-password/', ChangePasswordView.as_view(), name='volunteer-change-password'),
]