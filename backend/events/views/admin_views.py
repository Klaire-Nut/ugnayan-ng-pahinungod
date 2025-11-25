from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import models
from ..models import Event, VolunteerEvent, Admin
from ..serializers import (
    EventCreateUpdateSerializer, 
    EventDetailSerializer,
    EventVolunteersSerializer
)

# You'll need to create a custom permission class
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        # You'll need to implement your admin authentication logic here
        # This is a placeholder - adjust based on your auth system
        return hasattr(request.user, 'admin_id') or request.user.is_staff

class AdminEventListCreateView(generics.ListCreateAPIView):
    """
    Admin endpoint to list all events and create new events.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = EventCreateUpdateSerializer
    queryset = Event.objects.all().order_by('-date_start')
    
    def perform_create(self, serializer):
        # Assuming you have admin info in request.user or session
        # Adjust based on your authentication system
        admin = Admin.objects.get(username=self.request.user.username)
        serializer.save(created_by=admin)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventDetailSerializer
        return EventCreateUpdateSerializer

class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin endpoint to retrieve, update, or delete a specific event.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Event.objects.all()
    lookup_field = 'event_id'
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventDetailSerializer
        return EventCreateUpdateSerializer
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete event and all related volunteer-event relationships.
        """
        instance = self.get_object()
        event_name = instance.event_name
        self.perform_destroy(instance)
        return Response(
            {"message": f"Event '{event_name}' has been deleted successfully."},
            status=status.HTTP_200_OK
        )

class AdminEventVolunteersView(generics.ListAPIView):
    """
    Admin endpoint to view all volunteers for a specific event.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = EventVolunteersSerializer
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return VolunteerEvent.objects.filter(event_id=event_id).select_related('volunteer')

class AdminUpdateVolunteerEventView(APIView):
    """
    Admin endpoint to update volunteer-event details (hours, status).
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def patch(self, request, event_id, volunteer_id):
        volunteer_event = get_object_or_404(
            VolunteerEvent,
            event_id=event_id,
            volunteer_id=volunteer_id
        )
        
        # Update hours rendered
        if 'hours_rendered' in request.data:
            hours = request.data['hours_rendered']
            if hours < 0:
                return Response(
                    {"error": "Hours cannot be negative"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            volunteer_event.hours_rendered = hours
        
        # Update status
        if 'status' in request.data:
            new_status = request.data['status']
            if new_status not in ['Joined', 'Completed', 'Dropped']:
                return Response(
                    {"error": "Invalid status"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            volunteer_event.status = new_status
            
            # Update volunteer total hours if status is Completed
            if new_status == 'Completed':
                volunteer = volunteer_event.volunteer
                volunteer.total_hours += volunteer_event.hours_rendered
                volunteer.save()
        
        volunteer_event.save()
        
        serializer = EventVolunteersSerializer(volunteer_event)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminCancelEventView(APIView):
    """
    Admin endpoint to cancel an event (soft delete - change status).
    You might want to add a status field to Event model for this.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        
        # Update all volunteer events to 'Dropped'
        VolunteerEvent.objects.filter(event=event, status='Joined').update(status='Dropped')
        
        return Response(
            {
                "message": f"Event '{event.event_name}' has been cancelled. All volunteers have been notified.",
                "event_id": event.event_id
            },
            status=status.HTTP_200_OK
        )

class AdminEventStatsView(APIView):
    """
    Admin endpoint to get statistics for an event.
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        
        volunteer_events = VolunteerEvent.objects.filter(event=event)
        
        stats = {
            'event_name': event.event_name,
            'total_slots': event.max_participants,
            'joined': volunteer_events.filter(status='Joined').count(),
            'completed': volunteer_events.filter(status='Completed').count(),
            'dropped': volunteer_events.filter(status='Dropped').count(),
            'available_slots': event.max_participants - volunteer_events.filter(
                status__in=['Joined', 'Completed']
            ).count(),
            'total_hours_rendered': sum(ve.hours_rendered for ve in volunteer_events),
            'average_hours': volunteer_events.filter(
                hours_rendered__gt=0
            ).aggregate(avg=models.Avg('hours_rendered'))['avg'] or 0
        }
        
        return Response(stats, status=status.HTTP_200_OK)