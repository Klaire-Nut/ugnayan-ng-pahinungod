# backend/events/views/volunteer_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import date

from core.models import Event, EventSchedule, VolunteerEvent, VolunteerScheduleSelection, VolunteerAccount
from events.serializers import (
    EventListSerializer,
    EventDetailSerializer,
    JoinEventSerializer,
)
from django.db.models import Q
import traceback

# helper
def get_logged_in_volunteer(request):
    email = getattr(request.user, "email", None)
    if not email:
        return None
    try:
        acc = VolunteerAccount.objects.select_related("volunteer").get(email=email)
        return acc.volunteer
    except VolunteerAccount.DoesNotExist:
        return None

# ======================================================
class VolunteerEventListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            events = (Event.objects.filter(schedules__date__gte=date.today()).distinct().prefetch_related("schedules"))
            serializer = EventListSerializer(events, many=True, context={"request": request})
            return Response(serializer.data)
        except Exception:
            print("VolunteerEventListView.get error:", traceback.format_exc())
            return Response({"error": "Server error"}, status=500)


# Join
class VolunteerJoinEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            volunteer = get_logged_in_volunteer(request)
            if not volunteer:
                return Response({"error": "Volunteer not found for current user"}, status=403)

            serializer = JoinEventSerializer(
                data=request.data,
                context={"request": request, "volunteer": volunteer}
            )

            if serializer.is_valid():
                ve = serializer.save()
                return Response({
                    "message": "Successfully joined the event.",
                    "volunteer_event_id": ve.id
                }, status=status.HTTP_201_CREATED)

            # helpful: print serializer errors to server log so you can see why it 400s
            print("JoinEventSerializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception:
            print("VolunteerJoinEventView.post error:", traceback.format_exc())
            return Response({"error": "Server error"}, status=500)


# Drop
class VolunteerDropEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        volunteer = get_logged_in_volunteer(request)
        if not volunteer:
            return Response({"error": "Volunteer not found for current user"}, status=403)
        event = get_object_or_404(Event, event_id=event_id)
        ve = VolunteerEvent.objects.filter(event=event, volunteer=volunteer).first()
        if not ve:
            return Response({"error": "You have not joined this event."}, status=400)
        ve.status = "Dropped"
        ve.save()
        return Response({"message": "Successfully dropped event."}, status=200)


# My events
class VolunteerMyEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        volunteer = get_logged_in_volunteer(request)
        if not volunteer:
            return Response({"error": "Volunteer not found for current user"}, status=403)

        events = VolunteerEvent.objects.filter(volunteer=volunteer).select_related("event")
        data = [{"event_id": ve.event.event_id, "event_name": ve.event.event_name, "status": ve.status} for ve in events]
        return Response(data)


# Update availability (legacy)
class VolunteerUpdateAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        volunteer = get_logged_in_volunteer(request)
        if not volunteer:
            return Response({"error": "Volunteer not found for current user"}, status=403)

        event = get_object_or_404(Event, event_id=event_id)
        ve = VolunteerEvent.objects.filter(event=event, volunteer=volunteer).first()
        if not ve:
            return Response({"error": "Not joined to this event."}, status=400)
        ve.availability_time = request.data.get("availability_time", "")
        ve.save()
        return Response({"message": "Availability updated."})


# Event detail
class VolunteerEventDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        volunteer = get_logged_in_volunteer(request)
        if not volunteer:
            return Response({"error": "Volunteer not found for current user"}, status=403)

        try:
            event = get_object_or_404(Event, event_id=event_id)
            serializer = EventDetailSerializer(event, context={"request": request})
            data = serializer.data

            # schedules and correct slot counts
            schedules = EventSchedule.objects.filter(event=event).order_by("date")
            schedule_list = []
            for s in schedules:
                slots_taken = VolunteerScheduleSelection.objects.filter(schedule=s).count()
                schedule_list.append({
                    "id": s.id,
                    "date": s.date,
                    "start_time": getattr(s, "start_time", None),
                    "end_time": getattr(s, "end_time", None),
                    "max_slots": getattr(s, "max_slots", 0),
                    "slots_taken": slots_taken,
                    "slots_remaining": max((getattr(s, "max_slots", 0) or 0) - slots_taken, 0)
                })
            data["schedules"] = schedule_list

            ve = VolunteerEvent.objects.filter(event=event, volunteer=volunteer).first()
            data["is_joined"] = ve is not None
            data["has_joined"] = ve is not None
            data["status"] = ve.status if ve else None

            if ve:
                selected = VolunteerScheduleSelection.objects.filter(
                    volunteer_event=ve
                ).values_list("schedule_id", flat=True)
                data["selected_schedules"] = list(selected)

            return Response(data)
        except Exception:
            print("VolunteerEventDetailView.get error:", traceback.format_exc())
            return Response({"error": "Server error"}, status=500)
