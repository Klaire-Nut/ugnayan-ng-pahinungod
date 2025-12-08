from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from core.models import Event, EventSchedule
from events.serializers import (
    EventListSerializer,
    EventDetailSerializer,
)


# ======================================================================
# PUBLIC: LIST ALL EVENTS (no login required)
# ======================================================================
class PublicEventListView(APIView):
    """
    Returns all public events.
    These are visible to ANY user (homepage or public page).
    """

    def get(self, request):
        events = Event.objects.filter(is_cancelled=False).order_by("-event_id")
        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)


# ======================================================================
# PUBLIC: EVENT DETAIL (no login required)
# ======================================================================
class PublicEventDetailView(APIView):
    """
    Public event detail + schedules.
    Does NOT include volunteer-specific info.
    """

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        schedules = EventSchedule.objects.filter(event=event).order_by("date")

        serializer = EventDetailSerializer(event)
        data = serializer.data

        # Attach schedules
        data["schedules"] = [
            {
                "date": s.date,
                "start_time": s.time_start,
                "end_time": s.time_end,
            }
            for s in schedules
        ]

        return Response(data)
