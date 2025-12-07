from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from admin_api.events_serializers import AdminEventSerializer
from core.models import Event, VolunteerEvent, Admin
from events.serializers import (
    EventListSerializer,
    EventDetailSerializer,
    EventCreateUpdateSerializer,
    EventVolunteersSerializer,
    VolunteerEventSerializer,
)


class IsAdmin(BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            # Check if user has an associated admin account
            admin = Admin.objects.get(username=request.user.username)
            request.admin = admin
            return True
        except Admin.DoesNotExist:
            return False


class AdminEventListCreateView(generics.ListCreateAPIView):
    """
    Admin can list all events and create new events.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateUpdateSerializer
        return EventListSerializer
    
    def get_queryset(self):
        queryset = Event.objects.all().order_by('-date_start')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        now = timezone.now()
        
        if status_filter == 'upcoming':
            queryset = queryset.filter(date_start__gte=now)
        elif status_filter == 'ongoing':
            queryset = queryset.filter(date_start__lte=now, date_end__gte=now)
        elif status_filter == 'past':
            queryset = queryset.filter(date_end__lt=now)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.admin)


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin can view, update, or delete a specific event.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Event.objects.all()
    lookup_field = 'event_id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateUpdateSerializer
        return EventDetailSerializer


class AdminEventVolunteersView(generics.ListAPIView):
    """
    Admin can view all volunteers for a specific event.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = EventVolunteersSerializer
    
    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        queryset = VolunteerEvent.objects.filter(event_id=event_id).select_related('volunteer')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-signup_date')


class AdminUpdateVolunteerEventView(APIView):
    """
    Admin can update a volunteer's event status or hours rendered.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def patch(self, request, event_id, volunteer_id):
        volunteer_event = get_object_or_404(
            VolunteerEvent,
            event_id=event_id,
            volunteer_id=volunteer_id
        )
        
        # Update status if provided
        if 'status' in request.data:
            new_status = request.data['status']
            if new_status in ['Joined', 'Completed', 'Dropped']:
                volunteer_event.status = new_status
            else:
                return Response(
                    {"error": "Invalid status. Must be Joined, Completed, or Dropped"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update hours rendered if provided
        if 'hours_rendered' in request.data:
            try:
                hours = int(request.data['hours_rendered'])
                if hours < 0:
                    return Response(
                        {"error": "Hours rendered cannot be negative"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                volunteer_event.hours_rendered = hours
            except ValueError:
                return Response(
                    {"error": "Invalid hours_rendered value"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        volunteer_event.save()
        
        serializer = VolunteerEventSerializer(volunteer_event)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminCancelEventView(APIView):
    """
    Admin can cancel an event (soft delete or status change).
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        
        # Option 1: Delete the event
        # This will cascade delete all VolunteerEvent records if FK is set to CASCADE
        event.delete()
        
        return Response(
            {"message": "Event cancelled successfully"},
            status=status.HTTP_200_OK
        )


class AdminEventStatsView(APIView):
    """
    Admin can view statistics for a specific event.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        
        # Get volunteer counts by status
        stats = VolunteerEvent.objects.filter(event=event).aggregate(
            total_joined=Count('volunteer', filter=Q(status='Joined')),
            total_completed=Count('volunteer', filter=Q(status='Completed')),
            total_dropped=Count('volunteer', filter=Q(status='Dropped')),
            total_hours=Count('hours_rendered')
        )
        
        # Calculate available slots
        active_volunteers = stats['total_joined'] + stats['total_completed']
        available_slots = event.max_participants - active_volunteers
        
        return Response({
            'event_id': event.event_id,
            'event_name': event.event_name,
            'max_participants': event.max_participants,
            'volunteers_joined': stats['total_joined'],
            'volunteers_completed': stats['total_completed'],
            'volunteers_dropped': stats['total_dropped'],
            'available_slots': available_slots,
            'is_full': available_slots <= 0,
            'total_active': active_volunteers
        })

class AdminDeleteEventView(APIView):
    permission_classes = []  # Add IsAdmin in production

    def delete(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        event.is_deleted = True
        event.save()
        return Response({"message": "Event soft-deleted."})


class AdminRestoreEventView(APIView):
    permission_classes = []  # Add IsAdmin in production

    def post(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        event.is_deleted = False
        event.is_canceled = False
        event.save()
        return Response({"message": "Event restored."})
