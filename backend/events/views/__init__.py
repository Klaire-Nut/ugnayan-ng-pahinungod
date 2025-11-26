# events/views/__init__.py

from .event_views import (
    PublicEventListView,
    PublicEventDetailView
)

from .admin_views import (
    AdminEventListCreateView,
    AdminEventDetailView,
    AdminEventVolunteersView,
    AdminUpdateVolunteerEventView,
    AdminCancelEventView,
    AdminEventStatsView
)

from .volunteer_views import (
    VolunteerEventListView,
    VolunteerJoinEventView,
    VolunteerMyEventsView,
    VolunteerDropEventView,
    VolunteerEventDetailView,
    VolunteerUpdateAvailabilityView
)

__all__ = [
    # Public views
    'PublicEventListView',
    'PublicEventDetailView',
    
    # Admin views
    'AdminEventListCreateView',
    'AdminEventDetailView',
    'AdminEventVolunteersView',
    'AdminUpdateVolunteerEventView',
    'AdminCancelEventView',
    'AdminEventStatsView',
    
    # Volunteer views
    'VolunteerEventListView',
    'VolunteerJoinEventView',
    'VolunteerMyEventsView',
    'VolunteerDropEventView',
    'VolunteerEventDetailView',
    'VolunteerUpdateAvailabilityView',
]