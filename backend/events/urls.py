from django.urls import path
from .views.event_views import (
    PublicEventListView,
    PublicEventDetailView,
)
from .views.volunteer_views import (
    VolunteerEventListView,
    VolunteerJoinEventView,
    VolunteerMyEventsView,
    VolunteerDropEventView,
    VolunteerEventDetailView,
    VolunteerUpdateAvailabilityView,
    VolunteerJoinEventView,
)

app_name = "events"

urlpatterns = [
    # Public
    path("public/", PublicEventListView.as_view()),
    path("public/<int:event_id>/", PublicEventDetailView.as_view()),

    # Volunteer event browsing
    path("volunteer/events/", VolunteerEventListView.as_view()),
    path("volunteer/events/<int:event_id>/", VolunteerEventDetailView.as_view()),

    # Volunteer join (NEW with schedules)
    path("volunteer/events/join/", VolunteerJoinEventView.as_view()),  # UPDATED

    # Volunteer my events
    path("volunteer/my-events/", VolunteerMyEventsView.as_view()),

    # Volunteer drops event
    path("volunteer/events/<int:event_id>/drop/", VolunteerDropEventView.as_view()),

    # Update availability (legacy)
    path("volunteer/events/<int:event_id>/availability/", VolunteerUpdateAvailabilityView.as_view()),
]
