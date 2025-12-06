from django.urls import path
from .views import AdminDashboardAPI, AdminVolunteerListView, AdminVolunteerFullView, AdminProfileView, AdminDataStatisticsAPI, EventVolunteersView
from django.urls import path, include


app_name = "admin_api"

urlpatterns = [
    path('dashboard/', AdminDashboardAPI.as_view(), name='dashboard'),
    path("events/<int:event_id>/volunteers/", EventVolunteersView.as_view(), name="event-volunteers"),
    path('volunteers/', AdminVolunteerListView.as_view(), name='volunteer-list'),
    path('volunteers/<int:volunteer_id>/', AdminVolunteerFullView.as_view(), name='volunteer-full'),
    path('profile/', AdminProfileView.as_view(), name='profile'),
    path('data-statistics/', AdminDataStatisticsAPI.as_view(), name='data-statistics'),
    path("", include("admin_api.events_urls")),
]
