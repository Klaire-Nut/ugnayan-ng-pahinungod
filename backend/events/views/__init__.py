# events/views/__init__.py

# Only import public and volunteer views
from .event_views import (
    PublicEventListView,
    PublicEventDetailView
)

from .volunteer_views import (
    VolunteerEventListView,
    VolunteerJoinEventView,
    VolunteerMyEventsView,
    VolunteerDropEventView,
    VolunteerEventDetailView,
    VolunteerUpdateAvailabilityView,
    RegisterEventAPIView
)

__all__ = [
    # Public views
    'PublicEventListView',
    'PublicEventDetailView',
    
    # Volunteer views
    'VolunteerEventListView',
    'VolunteerJoinEventView',
    'VolunteerMyEventsView',
    'VolunteerDropEventView',
    'VolunteerEventDetailView',
    'VolunteerUpdateAvailabilityView',
    'RegisterEventAPIView'
]
