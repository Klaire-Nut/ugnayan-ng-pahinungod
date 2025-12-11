from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin
from core.models import (
    Volunteer,
    VolunteerAccount,
    VolunteerEvent,
    Event,
    EventSchedule,
)

from .serializers import (
    AdminVolunteerDetailSerializer,
    AdminVolunteerListSerializer,
    AdminProfileSerializer,
)

from events.serializers import EventVolunteersSerializer

# ========================================================================
# ADMIN DASHBOARD
# ========================================================================
class AdminDashboardAPI(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        total_volunteers = Volunteer.objects.count()

        # Recent volunteers
        recent_qs = Volunteer.objects.order_by("-volunteer_id")[:8].values(
            "first_name", "last_name", "affiliation_type", "date_joined"
        )

        recent_volunteers = [
            {
                "name": f"{v['first_name']} {v['last_name']}".strip(),
                "affiliation": v["affiliation_type"],
                "date_joined": v["date_joined"],
            }
            for v in recent_qs
        ]

        # Volunteer status summary
        status_summary = {
            "active": Volunteer.objects.filter(status="Active").count(),
            "inactive": Volunteer.objects.filter(status="Inactive").count(),
            "suspended": Volunteer.objects.filter(status="Suspended").count(),
        }

        # Recent events
        events_qs = Event.objects.order_by("-event_id")[:5].values(
            "event_id", "event_name", "date_start", "date_end", "is_cancelled"
        )

        recent_events = [
            {
                "id": e["event_id"],
                "title": e["event_name"],
                "start_date": e["date_start"],
                "end_date": e["date_end"],
                "is_cancelled": e["is_cancelled"],
            }
            for e in events_qs
        ]

        return Response(
            {
                "total_volunteers": total_volunteers,
                "recent_volunteers": recent_volunteers,
                "status_summary": status_summary,
                "recent_events": recent_events,
            }
        )


# ========================================================================
# VOLUNTEER LIST (ADMIN)
# ========================================================================
class AdminVolunteerListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminVolunteerListSerializer
    queryset = Volunteer.objects.all().order_by("-volunteer_id")

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("search")

        if q:
            qs = qs.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(nickname__icontains=q)
                | Q(accounts__email__icontains=q)
            ).distinct()

        return qs


# ========================================================================
# VOLUNTEER FULL DETAIL VIEW (ADMIN)
# ========================================================================
class AdminVolunteerFullView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminVolunteerDetailSerializer
    queryset = Volunteer.objects.all()
    lookup_field = "volunteer_id"


# ========================================================================
# ADMIN PROFILE
# ========================================================================
class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        serializer = AdminProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = AdminProfileSerializer(
            instance=request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# ========================================================================
# EVENT LIST + CREATE
# ========================================================================
class AdminEventListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        events = Event.objects.all().order_by("-event_id")
        return Response([
            {
                "event_id": e.event_id,
                "event_name": e.event_name,
                "description": e.description,
                "location": e.location,
                "date_start": e.date_start,
                "date_end": e.date_end,
                "is_cancelled": e.is_cancelled,
                "schedules": [
                    {
                        "date": s.date,
                        "start_time": s.start_time,
                        "end_time": s.end_time,
                        "max_slots": s.max_slots,
                        "filled_slots": s.volunteers.count(),
                    }
                    for s in e.schedules.all().order_by("date")
                ]
            }
            for e in events
        ])

    def post(self, request):
        data = request.data
        schedules = data.get("schedules", [])

        if not schedules:
            return Response({"error": "At least one schedule is required"}, status=400)

        # Create event
        e = Event.objects.create(
            event_name=data.get("event_name"),
            description=data.get("description"),
            location=data.get("location"),
            date_start=schedules[0]["date"],   # earliest date
            date_end=schedules[-1]["date"],    # latest date
        )

        # Create schedules
        for sched in schedules:
            EventSchedule.objects.create(
                event=e,
                date=sched["date"],
                start_time=sched["start_time"],
                end_time=sched["end_time"],
                max_slots=sched.get("max_slots", 10),
            )

        return Response({"event_id": e.event_id}, status=201)


# ========================================================================
# EVENT DETAIL
# ========================================================================
class AdminEventDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        schedules = EventSchedule.objects.filter(event=event).order_by("date")

        return Response({
            "event_id": event.event_id,
            "event_name": event.event_name,
            "description": event.description,
            "location": event.location,
            "date_start": event.date_start,
            "date_end": event.date_end,
            "is_cancelled": event.is_cancelled,
            "schedules": [
                {
                    "date": s.date,
                    "start_time": s.start_time,
                    "end_time": s.end_time,
                    "max_slots": s.max_slots,
                    "filled_slots": s.volunteers.count(),
                }
                for s in schedules
            ]
        })


# ========================================================================
# EVENT UPDATE + DELETE
# ========================================================================
class AdminEventUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        schedules = EventSchedule.objects.filter(event=event).order_by("date")

        return Response({
            "event_id": event.event_id,
            "event_name": event.event_name,
            "description": event.description,
            "location": event.location,
            "date_start": event.date_start,
            "date_end": event.date_end,
            "is_cancelled": event.is_cancelled,
            "schedules": [
                {
                    "date": s.date,
                    "start_time": s.start_time,
                    "end_time": s.end_time,
                    "max_slots": s.max_slots,
                    "filled_slots": s.volunteers.count(),
                }
                for s in schedules
            ]
        })

    def put(self, request, event_id):
        e = get_object_or_404(Event, event_id=event_id)
        e.event_name = request.data.get("event_name", e.event_name)
        e.description = request.data.get("description", e.description)
        e.location = request.data.get("location", e.location)
        e.save()
        return Response({"message": "Event updated"})

    def delete(self, request, event_id):
        e = get_object_or_404(Event, event_id=event_id)
        e.delete()
        return Response({"message": "Event deleted"})

# ========================================================================
# EVENT CANCEL
# ========================================================================
class AdminEventCancelView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, event_id):
        print("🔥 CANCEL endpoint HIT for event:", event_id)

        event = get_object_or_404(Event, event_id=event_id)
        event.is_cancelled = True
        event.save()

        return Response({
            "message": "Event cancelled successfully",
            "event_id": event_id,
            "is_cancelled": True
        }, status=200)

        
# ========================================================================
# EVENT UNDO CANCEL
# ========================================================================
class AdminEventUndoCancelView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, event_id):
        print("♻ Undo cancel endpoint HIT for event:", event_id)

        event = get_object_or_404(Event, event_id=event_id)
        event.is_cancelled = False
        event.save()

        return Response({
            "message": "Event restored",
            "event_id": event_id,
            "is_cancelled": False
        }, status=200)

# ========================================================================
# EVENT SCHEDULES
# ========================================================================
class AdminEventScheduleView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        schedules = EventSchedule.objects.filter(event=event).order_by("date")

        return Response([
            {
                "date": s.date,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "max_slots": s.max_slots,
                "filled_slots": s.volunteers.count(),
            }
            for s in schedules
        ])

    def post(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)

        schedule = EventSchedule.objects.create(
            event=event,
            date=request.data.get("date"),
            start_time=request.data.get("start_time"),
            end_time=request.data.get("end_time"),
            max_slots=request.data.get("max_slots", 0),
        )

        return Response({"id": schedule.id}, status=201)

    def delete(self, request, event_id):
        count, _ = EventSchedule.objects.filter(event_id=event_id).delete()
        return Response({"deleted": count})


# ========================================================================
# EVENT VOLUNTEERS
# ========================================================================
class AdminEventVolunteersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, event_id):
        queryset = VolunteerEvent.objects.filter(event_id=event_id).select_related(
            "volunteer"
        ).prefetch_related("schedule_selections__schedule")

        serializer = EventVolunteersSerializer(queryset, many=True)
        return Response(serializer.data)

# ========================================================================
# ADMIN VOLUNTEER UPDATE (e.g., hours rendered) 
# ========================================================================

class AdminVolunteerUpdateView(APIView):
    permission_classes = [IsAuthenticated]  # add admin check as needed

    def patch(self, request, event_id, volunteer_event_id):
        ve = get_object_or_404(VolunteerEvent, id=volunteer_event_id, event_id=event_id)
        hours = request.data.get("hours_rendered")
        if hours is None:
            return Response({"error": "hours_rendered is required"}, status=400)
        try:
            hours = int(hours)
            if hours < 0:
                raise ValueError()
        except Exception:
            return Response({"error": "hours_rendered must be a non-negative integer"}, status=400)

        ve.hours_rendered = hours
        ve.save()
        return Response({"message": "Hours updated", "hours_rendered": ve.hours_rendered})