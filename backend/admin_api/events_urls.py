from django.urls import path
from admin_api.events_views import (
    AdminAllEventsAPI,
     AdminCreateEventAPI,
    AdminEventDetailView,
    AdminCancelEventView,
    AdminDeleteEventView,
    AdminRestoreEventView,
    AdminEventVolunteersAPI
)

urlpatterns = [
    path("events/", AdminAllEventsAPI.as_view(), name="admin-events-all"),
    path("create-event/", AdminCreateEventAPI.as_view(), name="admin-create-event"),
    path("events/<int:event_id>/", AdminEventDetailView.as_view(), name="admin-event-detail"),
    path("events/<int:event_id>/cancel/", AdminCancelEventView.as_view(), name="admin-event-cancel"),
    path("events/<int:event_id>/delete/", AdminDeleteEventView.as_view(), name="admin-event-delete"),
    path("events/<int:event_id>/restore/", AdminRestoreEventView.as_view(), name="admin-event-restore"),
    path('events/<int:event_id>/volunteers/', AdminEventVolunteersAPI.as_view(), name='admin-event-volunteers')

]
