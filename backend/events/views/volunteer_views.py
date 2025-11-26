from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone

from core.models import Event, VolunteerEvent, Volunteer, VolunteerAccount
from events.serializers import (
    EventListSerializer,
    EventDetailSerializer,
    VolunteerEventJoinSerializer,
    VolunteerEventSerializer
)


class IsVolunteer(BasePermission):
    """
    Custom permission to only allow volunteer users.
    Checks if the authenticated user has an associated VolunteerAccount.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has an associated volunteer account
        try:
            volunteer_account = VolunteerAccount.objects.select_related('volunteer').get(
                email=request.user.email
            )
            # Attach volunteer to request for easy access in views
            request.volunteer = volunteer_account.volunteer
            return True
        except VolunteerAccount.DoesNotExist:
            return False


class VolunteerEventListView(generics.ListAPIView):
    """
    Authenticated volunteer can view all available events.
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    serializer_class = EventListSerializer
    
    def get_queryset(self):
        queryset = Event.objects.all().order_by('-date_start')
        
        # Filter options
        available = self.request.query_params.get('available', None)
        if available == 'true':
            # Only show events that are not full
            queryset = [event for event in queryset if self.get_available_slots(event) > 0]
        
        return queryset
    
    def get_available_slots(self, event):
        joined_count = VolunteerEvent.objects.filter(
            event=event,
            status__in=['Joined', 'Completed']
        ).count()
        return event.max_participants - joined_count


class VolunteerJoinEventView(generics.CreateAPIView):
    """
    Authenticated volunteer can join an event.
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    serializer_class = VolunteerEventJoinSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Use the volunteer attached by IsVolunteer permission
        context['volunteer'] = self.request.volunteer
        return context
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(
            {
                "message": "Successfully joined the event!",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class VolunteerMyEventsView(generics.ListAPIView):
    """
    Volunteer can view their joined events.
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    serializer_class = VolunteerEventSerializer
    
    def get_queryset(self):
        # Use the volunteer attached by IsVolunteer permission
        volunteer = self.request.volunteer
        
        queryset = VolunteerEvent.objects.filter(volunteer=volunteer).select_related('event')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-signup_date')


class VolunteerDropEventView(APIView):
    """
    Volunteer can drop out of an event (before it starts).
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    
    def post(self, request, event_id):
        # Use the volunteer attached by IsVolunteer permission
        volunteer = request.volunteer
        
        volunteer_event = get_object_or_404(
            VolunteerEvent,
            volunteer=volunteer,
            event_id=event_id
        )
        
        # Check if event hasn't started yet
        if volunteer_event.event.date_start < timezone.now():
            return Response(
                {"error": "Cannot drop from an event that has already started"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already dropped or completed
        if volunteer_event.status in ['Dropped', 'Completed']:
            return Response(
                {"error": f"Event is already {volunteer_event.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        volunteer_event.status = 'Dropped'
        volunteer_event.save()
        
        return Response(
            {"message": "Successfully dropped from the event"},
            status=status.HTTP_200_OK
        )


class VolunteerEventDetailView(generics.RetrieveAPIView):
    """
    Volunteer can view detailed information about a specific event.
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    serializer_class = EventDetailSerializer
    queryset = Event.objects.all()
    lookup_field = 'event_id'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Use the volunteer attached by IsVolunteer permission
        volunteer = request.volunteer
        volunteer_event = VolunteerEvent.objects.filter(
            volunteer=volunteer,
            event=instance
        ).first()
        
        data = serializer.data
        data['volunteer_status'] = {
            'is_joined': volunteer_event is not None,
            'status': volunteer_event.status if volunteer_event else None,
            'hours_rendered': volunteer_event.hours_rendered if volunteer_event else 0,
            'signup_date': volunteer_event.signup_date if volunteer_event else None
        }
        
        return Response(data)


class VolunteerUpdateAvailabilityView(APIView):
    """
    Volunteer can update their availability for an event they've joined.
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    
    def patch(self, request, event_id):
        # Use the volunteer attached by IsVolunteer permission
        volunteer = request.volunteer
        
        volunteer_event = get_object_or_404(
            VolunteerEvent,
            volunteer=volunteer,
            event_id=event_id
        )
        
        if 'availability_time' in request.data:
            volunteer_event.availability_time = request.data['availability_time']
        
        if 'availability_orientation' in request.data:
            volunteer_event.availability_orientation = request.data['availability_orientation']
        
        volunteer_event.save()
        
        serializer = VolunteerEventSerializer(volunteer_event)
        return Response(serializer.data, status=status.HTTP_200_OK)