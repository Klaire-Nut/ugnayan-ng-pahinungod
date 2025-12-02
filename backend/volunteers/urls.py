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

    # Profile
    path('profile/', VolunteerProfileView.as_view(), name='volunteer-profile'),
    path('history/', VolunteerHistoryView.as_view(), name='volunteer-history'),
    path('change-password/', ChangePasswordView.as_view(), name='volunteer-change-password'),

    # Registration
    path('register/', RegisterVolunteer.as_view(), name='volunteer-register'),
]
