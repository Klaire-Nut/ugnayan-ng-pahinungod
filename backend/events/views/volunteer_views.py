# events/views/volunteer_views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from core.models import Event, VolunteerEvent
from events.serializers import (
    EventListSerializer,
    EventDetailSerializer,
    VolunteerEventJoinSerializer,
    VolunteerEventSerializer
)

# ===============================================================
#   SIMPLE PERMISSION — based on your session middleware
# ===============================================================
class IsVolunteer(BasePermission):
    """
    Checks if request.volunteer is attached via your session middleware.
    """
    def has_permission(self, request, view):
        return hasattr(request, "volunteer") and request.volunteer is not None


# ===============================================================
#   LIST EVENTS AVAILABLE TO VOLUNTEERS
# ===============================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerEventListView(generics.ListAPIView):
    permission_classes = [IsVolunteer]
    serializer_class = EventListSerializer

    def get_queryset(self):
        queryset = Event.objects.all().order_by('-date_start')

        # Optional filtering: available events
        available = self.request.query_params.get('available')
        if available == 'true':
            return [
                event for event in queryset
                if self.get_available_slots(event) > 0
            ]

        return queryset

    def get_available_slots(self, event):
        joined = VolunteerEvent.objects.filter(
            event=event,
            status__in=['Joined', 'Completed']
        ).count()
        return event.max_participants - joined


# ===============================================================
#   JOIN EVENT
# ===============================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerJoinEventView(generics.CreateAPIView):
    permission_classes = [IsVolunteer]
    serializer_class = VolunteerEventJoinSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['volunteer'] = self.request.volunteer
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        return Response(
            {"message": "Successfully joined the event!", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )


# ===============================================================
#   VOLUNTEER'S OWN EVENTS
# ===============================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerMyEventsView(generics.ListAPIView):
    permission_classes = [IsVolunteer]
    serializer_class = VolunteerEventSerializer

    def get_queryset(self):
        volunteer = self.request.volunteer

        queryset = VolunteerEvent.objects.filter(
            volunteer=volunteer
        ).select_related("event")

        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.order_by("-signup_date")


# ===============================================================
#   DROP EVENT
# ===============================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerDropEventView(APIView):
    permission_classes = [IsVolunteer]

    def post(self, request, event_id):
        volunteer = request.volunteer

        volunteer_event = get_object_or_404(
            VolunteerEvent,
            volunteer=volunteer,
            event_id=event_id
        )

        if volunteer_event.event.date_start < timezone.now():
            return Response(
                {"error": "Cannot drop — event already started"},
                status=400
            )

        if volunteer_event.status in ["Dropped", "Completed"]:
            return Response(
                {"error": f"Event is already {volunteer_event.status}"},
                status=400
            )

        volunteer_event.status = "Dropped"
        volunteer_event.save()

        return Response({"message": "Dropped from event"}, status=200)


# ===============================================================
#   EVENT DETAIL
# ===============================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerEventDetailView(generics.RetrieveAPIView):
    permission_classes = [IsVolunteer]
    serializer_class = EventDetailSerializer
    queryset = Event.objects.all()
    lookup_field = "event_id"

    def retrieve(self, request, *args, **kwargs):
        event = self.get_object()
        serializer = self.get_serializer(event)

        volunteer = request.volunteer
        volunteer_event = VolunteerEvent.objects.filter(
            volunteer=volunteer,
            event=event
        ).first()

        data = serializer.data
        data["volunteer_status"] = {
            "is_joined": volunteer_event is not None,
            "status": volunteer_event.status if volunteer_event else None,
            "hours_rendered": volunteer_event.hours_rendered if volunteer_event else 0,
            "signup_date": volunteer_event.signup_date if volunteer_event else None
        }

        return Response(data)


# ===============================================================
#   UPDATE AVAILABILITY
# ===============================================================
@method_decorator(csrf_exempt, name='dispatch')
class VolunteerUpdateAvailabilityView(APIView):
    permission_classes = [IsVolunteer]

    def patch(self, request, event_id):
        volunteer = request.volunteer

        volunteer_event = get_object_or_404(
            VolunteerEvent,
            volunteer=volunteer,
            event_id=event_id
        )

        if "availability_time" in request.data:
            volunteer_event.availability_time = request.data["availability_time"]

        if "availability_orientation" in request.data:
            volunteer_event.availability_orientation = request.data["availability_orientation"]

        volunteer_event.save()

        serializer = VolunteerEventSerializer(volunteer_event)
        return Response(serializer.data, status=200)


# ===============================================================
#   LEGACY REGISTER ENDPOINT (kept for compatibility)
# ===============================================================
@method_decorator(csrf_exempt, name='dispatch')
class RegisterEventAPIView(APIView):
    permission_classes = [IsVolunteer]

    def post(self, request, event_id):
        volunteer = request.volunteer
        availability_time = request.data.get("availability_time", "")
        availability_orientation = request.data.get("availability_orientation", False)

        event = get_object_or_404(Event, event_id=event_id)

        if VolunteerEvent.objects.filter(volunteer=volunteer, event=event).exists():
            return Response({"error": "Already registered"}, status=400)

        reg = VolunteerEvent.objects.create(
            volunteer=volunteer,
            event=event,
            availability_time=availability_time,
            availability_orientation=availability_orientation,
            status="Joined",
        )

        serializer = VolunteerEventSerializer(reg)
        return Response(serializer.data, status=201)
