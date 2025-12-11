from django.urls import path
from .views import (
    AdminDashboardAPI,
    AdminVolunteerListView,
    AdminVolunteerFullView,
    AdminProfileView,

    # Events
    AdminEventListCreateView,
    AdminEventDetailView,
    AdminEventUpdateDeleteView,
    AdminEventScheduleView,
    AdminEventVolunteersView,
    AdminEventCancelView,
    AdminEventUndoCancelView,
    AdminVolunteerUpdateView
)

urlpatterns = [
    path("dashboard/", AdminDashboardAPI.as_view()),

    # Volunteer Management
    path("volunteers/", AdminVolunteerListView.as_view()),
    path("volunteers/<int:volunteer_id>/", AdminVolunteerFullView.as_view()),

    # Profile
    path("profile/", AdminProfileView.as_view()),

    # EVENTS
    path("events/", AdminEventListCreateView.as_view()),
    path("events/<int:event_id>/detail/", AdminEventDetailView.as_view()),
    path("events/<int:event_id>/", AdminEventUpdateDeleteView.as_view()),
    path("events/<int:event_id>/schedule/", AdminEventScheduleView.as_view()),
    path("events/<int:event_id>/volunteers/", AdminEventVolunteersView.as_view()),
    path("events/<int:event_id>/cancel/", AdminEventCancelView.as_view()),
    path("events/<int:event_id>/uncancel/", AdminEventUndoCancelView.as_view()),
    path("events/<int:event_id>/volunteers/<int:volunteer_event_id>/", AdminVolunteerUpdateView.as_view()),
]