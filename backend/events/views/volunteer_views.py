from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import date

from core.models import Event, EventSchedule, VolunteerEvent, Volunteer, VolunteerScheduleSelection
from events.serializers import (
    EventListSerializer,
    EventDetailSerializer,
    VolunteerEventBaseSerializer,
    JoinEventSerializer,
)

from django.db.models import Q


# ======================================================================
# VOLUNTEER: EVENT LIST
# ======================================================================
class VolunteerEventListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        events = (
        Event.objects.filter(
            schedules__date__gte=date.today(),
        )
        .distinct()
        .prefetch_related("schedules")
    )

        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)


# ======================================================================
# VOLUNTEER: JOIN EVENT WITH SCHEDULE SELECTION
# ======================================================================
class VolunteerJoinEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = JoinEventSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Successfully joined the event."},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ======================================================================
# VOLUNTEER: DROP AN EVENT
# ======================================================================
class VolunteerDropEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        volunteer = request.user.volunteer
        event = get_object_or_404(Event, event_id=event_id)

        ve = VolunteerEvent.objects.filter(event=event, volunteer=volunteer).first()

        if not ve:
            return Response({"error": "You have not joined this event."}, status=400)

        ve.status = "Dropped"
        ve.save()

        return Response({"message": "Successfully dropped event."}, status=200)


# ======================================================================
# VOLUNTEER: MY EVENTS
# ======================================================================
class VolunteerMyEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        volunteer = request.user.volunteer

        events = (
            VolunteerEvent.objects.filter(volunteer=volunteer)
            .select_related("event")
        )

        data = [
            {
                "event_id": ve.event.event_id,
                "event_name": ve.event.event_name,
                "status": ve.status,
            }
            for ve in events
        ]

        return Response(data)


# ======================================================================
# VOLUNTEER: UPDATE AVAILABILITY (optional legacy)
# ======================================================================
class VolunteerUpdateAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        volunteer = request.user.volunteer
        event = get_object_or_404(Event, event_id=event_id)

        ve = VolunteerEvent.objects.filter(event=event, volunteer=volunteer).first()

        if not ve:
            return Response({"error": "Not joined to this event."}, status=400)

        ve.availability_time = request.data.get("availability_time", "")
        ve.save()

        return Response({"message": "Availability updated."})


# ======================================================================
# VOLUNTEER: EVENT DETAIL
# ======================================================================
class VolunteerEventDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)

        serializer = EventDetailSerializer(event)
        data = serializer.data

        # Fix schedule output (correct field names)
        schedules = EventSchedule.objects.filter(event=event).order_by("date")
        data["schedules"] = [
            {
                "schedule_id": s.id,
                "date": s.date,
                "start_time": s.start_time,   # correct
                "end_time": s.end_time,       # correct
                "max_slots": s.max_slots,
                "slots_taken": s.volunteers.count(),
                "slots_remaining": max(s.max_slots - s.volunteers.count(), 0)
            }
            for s in schedules
        ]

        # Joined Status
        ve = VolunteerEvent.objects.filter(
            event=event,
            volunteer=request.user.volunteer
        ).first()

        data["is_joined"] = ve is not None
        data["status"] = ve.status if ve else None

        # Get schedule selections if joined
        if ve:
            selected = VolunteerScheduleSelection.objects.filter(
                volunteer=request.user.volunteer,
                schedule__event=event
            ).values_list("schedule_id", flat=True)

            data["selected_schedules"] = list(selected)

        return Response(data)