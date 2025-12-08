from django.urls import path
from .views import login_view, logout_view, user_view

urlpatterns = [
    path("login/", login_view, name="admin-login"),
    path("logout/", logout_view, name="admin-logout"),
    path("user/", user_view, name="admin-user"),
]