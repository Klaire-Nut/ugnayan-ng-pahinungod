from django.urls import path
from .views import (
    volunteer_login,
    volunteer_logout,
    VolunteerProfileView,
    VolunteerHistoryView,
    ChangePasswordView,
    RegisterVolunteer
)
from events.views.volunteer_views import VolunteerEventListView

from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    # Auth
    path('login/', volunteer_login, name='volunteer-login'),
    path('logout/', volunteer_logout, name='volunteer-logout'),
    
    # DRF token login
    path('api/auth/login/', obtain_auth_token, name='api_token_auth'),

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
    
    path('events/', VolunteerEventListView.as_view(), name='volunteer-events'),
]