from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.utils import timezone

from core.models import Event, VolunteerEvent
from events.serializers import EventListSerializer, EventDetailSerializer


class PublicEventListView(generics.ListAPIView):
    """
    Public endpoint to view recent/upcoming events.
    No authentication required.
    """
    permission_classes = [AllowAny]
    serializer_class = EventListSerializer
    
    def get_queryset(self):
        queryset = Event.objects.all().order_by('-date_start')
        
        # Filter by upcoming events if requested
        upcoming = self.request.query_params.get('upcoming', None)
        if upcoming == 'true':
            queryset = queryset.filter(date_start__gte=timezone.now())
        
        # Filter by past events
        past = self.request.query_params.get('past', None)
        if past == 'true':
            queryset = queryset.filter(date_end__lt=timezone.now())
        
        # Search by event name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(event_name__icontains=search)
        
        return queryset


class PublicEventDetailView(generics.RetrieveAPIView):
    """
    Public endpoint to view event details.
    No authentication required.
    """
    permission_classes = [AllowAny]
    serializer_class = EventDetailSerializer
    queryset = Event.objects.all()
    lookup_field = 'event_id'