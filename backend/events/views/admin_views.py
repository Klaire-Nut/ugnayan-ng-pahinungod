# -------------------------------------------------------
# CLEAN EVENTS ADMIN VIEWS
# -------------------------------------------------------
# IMPORTANT:
# This file NO LONGER handles:
#   - Creating events
#   - Updating events
#   - Deleting events
#   - Managing schedules
#   - Managing admin-side volunteers
#
# All of those now live in:
#   admin_api/views.py
#
# This file only keeps the logic that is genuinely needed
# by the events app structure (if any).
# -------------------------------------------------------

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.shortcuts import get_object_or_404

from core.models import Event, VolunteerEvent, EventSchedule, VolunteerScheduleSelection, Volunteer
from django.db.models import Count, Q


# =======================================================
# ADMIN PERMISSION (for future reuse if needed)
# =======================================================
class IsAdmin(BasePermission):
    """
    Allows access only to admin users.
    You can remove this if admin checking is moved to admin_api only.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_admin", False)
        )


# =======================================================
# OPTIONAL: EVENT STATS (if used by volunteer/public views)
# =======================================================
class AdminEventStatsView(APIView):
    """
    Provides event statistics.
    This endpoint is OPTIONAL.
    If your frontend does not use it, you can delete this class entirely.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)

        schedules = EventSchedule.objects.filter(event=event)

        return Response({
            "event_id": event.event_id,
            "event_name": event.event_name,
            "total_schedules": schedules.count(),
            "total_slots": sum(s.max_slots for s in schedules),
            "total_taken": sum(s.volunteers.count() for s in schedules),
        })


# =======================================================
# OPTIONAL: CANCEL EVENT (if used by volunteer/public views)
# =======================================================
class AdminCancelEventView(APIView):
    """
    Cancels an event (sets is_cancelled=True).
    This endpoint can stay here OR be moved to admin_api.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        event.is_cancelled = True
        event.save()
        return Response({"message": "Event cancelled successfully"})
    
class AdminScheduleVolunteersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, schedule_id):
        schedule = get_object_or_404(EventSchedule, id=schedule_id)

        volunteers = VolunteerScheduleSelection.objects.filter(schedule=schedule)

        data = [
            {
                "volunteer_id": vs.volunteer.volunteer_id,
                "name": f"{vs.volunteer.first_name} {vs.volunteer.last_name}",
                "email": vs.volunteer.accounts.first().email 
                    if vs.volunteer.accounts.exists() else None,
            }
            for vs in volunteers
        ]

        return Response({
            "schedule_id": schedule_id,
            "date": schedule.date,
            "start_time": schedule.start_time,
            "end_time": schedule.end_time,
            "max_slots": schedule.max_slots,
            "slots_taken": volunteers.count(),
            "slots_remaining": schedule.max_slots - volunteers.count(),
            "volunteers": data,
        })

class AdminUpdateScheduleSlotsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, schedule_id):
        schedule = get_object_or_404(EventSchedule, id=schedule_id)
        
        new_slots = request.data.get("max_slots")

        if new_slots is None or int(new_slots) < 0:
            return Response({"error": "max_slots must be a positive number"}, status=400)

        schedule.max_slots = int(new_slots)
        schedule.save()

        return Response({
            "message": "Schedule max slots updated",
            "max_slots": schedule.max_slots
        })

class AdminEventScheduleOverviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        schedules = EventSchedule.objects.filter(event=event).order_by("date")

        data = []

        for s in schedules:
            taken = s.volunteers.count()
            data.append({
                "schedule_id": s.id,
                "date": s.date,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "max_slots": s.max_slots,
                "slots_taken": taken,
                "slots_remaining": s.max_slots - taken
            })

        return Response({
            "event_id": event.event_id,
            "event_name": event.event_name,
            "schedules": data
        })