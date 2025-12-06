from django.urls import path
from .views.event_views import (
    PublicEventListView,
    PublicEventDetailView
)
from .views.admin_views import (
    AdminEventListCreateView,
    AdminEventDetailView,
    AdminEventVolunteersView,
    AdminUpdateVolunteerEventView,
    AdminCancelEventView,
    AdminEventStatsView,
    AdminEventListCreateView, 
    AdminEventDetailView,
    AdminDeleteEventView,
    AdminRestoreEventView
)
from .views.volunteer_views import (
    VolunteerEventListView,
    VolunteerJoinEventView,
    VolunteerMyEventsView,
    VolunteerDropEventView,
    VolunteerEventDetailView,
    VolunteerUpdateAvailabilityView,
    RegisterEventAPIView,
    VolunteerJoinEventView
)

app_name = 'events'  # This allows you to use reverse('events:public-event-list')

urlpatterns = [
    # Public endpoints (no auth required)
    path('events/', PublicEventListView.as_view(), name='public-event-list'),
    path('events/<int:event_id>/', PublicEventDetailView.as_view(), name='public-event-detail'),
    
    # Admin endpoints
    path('admin/events/', AdminEventListCreateView.as_view(), name='admin-event-list-create'),
    path('admin/events/<int:event_id>/', AdminEventDetailView.as_view(), name='admin-event-detail'),
    path('admin/events/<int:event_id>/volunteers/', AdminEventVolunteersView.as_view(), name='admin-event-volunteers'),
    path('admin/events/<int:event_id>/volunteers/<int:volunteer_id>/', AdminUpdateVolunteerEventView.as_view(), name='admin-update-volunteer-event'),
    path('admin/events/<int:event_id>/cancel/', AdminCancelEventView.as_view(), name='admin-cancel-event'),
    path('admin/events/<int:event_id>/stats/', AdminEventStatsView.as_view(), name='admin-event-stats'),
    
    # Volunteer endpoints
    path('volunteer/events/', VolunteerEventListView.as_view(), name='volunteer-event-list'),
    path('volunteer/events/<int:event_id>/', VolunteerEventDetailView.as_view(), name='volunteer-event-detail'),
    path('volunteer/events/join/', VolunteerJoinEventView.as_view(), name='volunteer-join-event'),
    path('volunteer/my-events/', VolunteerMyEventsView.as_view(), name='volunteer-my-events'),  # Simplified path
    path('volunteer/events/<int:event_id>/drop/', VolunteerDropEventView.as_view(), name='volunteer-drop-event'),
    path('volunteer/events/<int:event_id>/availability/', VolunteerUpdateAvailabilityView.as_view(), name='volunteer-update-availability'),


    path('<int:event_id>/register/', RegisterEventAPIView.as_view(), name='event-register'),

    path('volunteers/<int:volunteer_id>/events/', VolunteerJoinEventView.as_view(), name='volunteer-joined-events'),

]