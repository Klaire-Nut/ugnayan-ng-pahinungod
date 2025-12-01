from django.urls import path
from .views import login_view, logout_view, user_view, volunteer_login, volunteer_logout

urlpatterns = [
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("user/", user_view, name="user"),

    # Volunteer login + logout
    path("volunteer/login/", volunteer_login, name="volunteer-login"),
    path("volunteer/logout/", volunteer_logout, name="volunteer-logout"),
]
