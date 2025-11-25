# events/views/__init__.py

# Import all views to make them accessible
from .event_views import PublicEventListView, PublicEventDetailView
from .admin_views import (
    AdminEventListCreateView,
    AdminEventDetailView,
    AdminEventVolunteersView,
    AdminUpdateVolunteerEventView,
    AdminCancelEventView,
    AdminEventStatsView,
    IsAdmin,
)
from .volunteer_views import (
    VolunteerEventListView,
    VolunteerJoinEventView,
    VolunteerMyEventsView,
    VolunteerDropEventView,
    VolunteerEventDetailView,
    VolunteerUpdateAvailabilityView,
    IsVolunteer,
)

__all__ = [
    # Event views
    'PublicEventListView',
    'PublicEventDetailView',
    
    # Admin views
    'AdminEventListCreateView',
    'AdminEventDetailView',
    'AdminEventVolunteersView',
    'AdminUpdateVolunteerEventView',
    'AdminCancelEventView',
    'AdminEventStatsView',
    'IsAdmin',
    
    # Volunteer views
    'VolunteerEventListView',
    'VolunteerJoinEventView',
    'VolunteerMyEventsView',
    'VolunteerDropEventView',
    'VolunteerEventDetailView',
    'VolunteerUpdateAvailabilityView',
    'IsVolunteer',
]