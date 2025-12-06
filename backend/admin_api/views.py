from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from .pagination import VolunteerListPagination
from django.db.models import Count
from datetime import date
from datetime import datetime
from django.utils import timezone
from django.contrib.auth import get_user_model
User = get_user_model()

# Models
from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    VolunteerEvent,
    StudentProfile,
    AlumniProfile,
    StaffProfile,
    FacultyProfile,
    RetireeProfile,
    Event,
    Admin,
    EventSchedule
)

# Serializers
from admin_api.serializers import (
    AdminVolunteerDetailSerializer,
    AdminVolunteerListSerializer,
    AdminProfileSerializer,
    VolunteerEventHistorySerializer
)
from volunteers.serializers import VolunteerAccountSerializer
from events.serializers import VolunteerEventSerializer


# For the Admin Dashboard
class AdminDashboardAPI(APIView):
    """
    GET /api/admin/dashboard/
    Admin-only endpoint returning:
      - recent_volunteers 
      - recent events
    """
    permission_classes = []
    

    def get(self, request):
    # Recent volunteers
        recent_qs = Volunteer.objects.order_by('-volunteer_id')[:8].values(
            'first_name',
            'last_name',
            'affiliation_type',
            'date_joined',
            'volunteer_identifier'
        )

        recent_volunteers = [
            {
                "name": f"{r['first_name']} {r['last_name']}".strip(),
                "affiliation": (r.get('affiliation_type') or ""),
                "date_joined": r.get('date_joined'),
                "identifier": r.get('volunteer_identifier'),
            }
            for r in recent_qs
        ]

        # Recent events (FIXED)
        events_qs = Event.objects.filter(is_deleted=False).order_by('-event_id')[:5]

        recent_events = []
        now = timezone.now().date()

        for event in events_qs:
            volunteers_joined = VolunteerEvent.objects.filter(
                event=event, status="Joined"
            ).count()

            # Get schedules from EventSchedule if exists
            schedule_qs = event.schedules.all().order_by("day")
            if schedule_qs.exists():
                schedules = [
                    {
                        "date": s.day.strftime("%Y-%m-%d"),
                        "start_time": s.start_time.strftime("%I:%M %p"),
                        "end_time": s.end_time.strftime("%I:%M %p"),
                    }
                    for s in schedule_qs
                ]
            else:
                schedules = [
                    {
                        "date": event.date_start.strftime("%Y-%m-%d"),
                        "start_time": event.date_start.strftime("%I:%M %p"),
                        "end_time": event.date_end.strftime("%I:%M %p"),
                    }
                ]
            # Determine status
            if event.is_canceled:
                status = "CANCELLED"
            else:
                first = datetime.strptime(schedules[0]["date"], "%Y-%m-%d").date()
                last = datetime.strptime(schedules[-1]["date"], "%Y-%m-%d").date()

                if now < first:
                    status = "UPCOMING"
                elif first <= now <= last:
                    status = "HAPPENING"
                else:
                    status = "DONE"

            recent_events.append({
                "id": event.event_id,
                "event_name": event.event_name,
                "location": event.location,
                "description": event.description,
                "max_participants": event.max_participants,
                "volunteers_needed": event.max_participants,
                "volunteered": volunteers_joined,
                "schedules": schedules,
                "status": status,
            })

        return Response({
            "recent_volunteers": recent_volunteers,
            "recent_events": recent_events,
        })

# Managing Volunteers - Admin for Viewing of the Volunteers Data only (Fetching data and searching Data)
class AdminVolunteerListView(ListAPIView):
    """
    GET /api/admin/volunteers/?page=1&search=&affiliation_type=student&year=2025&degree_program=BSCS&college=CCS
    Admin-only list of volunteers with pagination, search, and filters.
    """
    permission_classes = []
    serializer_class = AdminVolunteerListSerializer
    pagination_class = VolunteerListPagination
    queryset = Volunteer.objects.all().order_by('-volunteer_id')

    def get_queryset(self):
        qs = super().get_queryset()
        request = self.request
        q = request.query_params

        # Search by name or email
        search = q.get('search')
        if search:
            # search against first/last/nickname and email via related VolunteerAccount
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(nickname__icontains=search) |
                Q(volunteer_identifier__icontains=search) |
                Q(accounts__email__icontains=search)
            ).distinct()

        # affiliation_type filter (student/alumni/staff/faculty/retiree)
        affiliation = q.get('affiliation_type')
        if affiliation:
            qs = qs.filter(affiliation_type__iexact=affiliation)

        # year joined - 'year' param
        year = q.get('year')
        if year and year.isdigit():
            qs = qs.filter(date_joined__year=int(year))

        # degree_program filter (students)
        degree_program = q.get('degree_program')
        if degree_program:
            qs = qs.filter(student_profile__degree_program__icontains=degree_program)

        # college filter (student or faculty)
        college = q.get('college')
        if college:
            qs = qs.filter(
                Q(student_profile__college__icontains=college) |
                Q(faculty_profile__college__icontains=college)
            ).distinct()

        # status filter
        status = q.get('status')
        if status:
            qs = qs.filter(status__iexact=status)

        return qs

# Mananging Volunteers - Admin for Managing Volunteers for Viewing and Editing of the Volunteers Data 
class AdminVolunteerFullView(RetrieveUpdateDestroyAPIView):
    """
    GET: Fetch full volunteer details including all nested data
    PUT/PATCH: Update all details
    DELETE: Delete volunteer
    """
    serializer_class = AdminVolunteerDetailSerializer
    lookup_field = 'volunteer_id'
    permission_classes = []  

    def get_queryset(self):
        # Prefetch related objects to reduce DB queries
        return Volunteer.objects.all().select_related(
            'student_profile', 'alumni_profile', 'staff_profile', 
            'faculty_profile', 'retiree_profile'
        ).prefetch_related(
            'contacts', 'addresses', 'backgrounds', 'emergency_contacts', 'accounts'
        )

    def get_serializer_context(self):
        # Keep context if needed for serializer
        context = super().get_serializer_context()
        context['volunteer_id'] = self.kwargs.get('volunteer_id')
        return context

# Fetch all the Volunteers who Registered for that Event 
class EventVolunteersView(APIView):

    def get(self, request, event_id):
        volunteers = (
            VolunteerEvent.objects
            .filter(event_id=event_id)
            .select_related('volunteer', 'schedule')
        )

        data = [
            {
                "volunteer_id": ve.volunteer.volunteer_id,
                "name": f"{ve.volunteer.first_name} {ve.volunteer.last_name}",
                "hours_rendered": ve.hours_rendered,
                "status": ve.status,
                "schedule_day": ve.schedule.day if ve.schedule else None,
            }
            for ve in volunteers
        ]

        return Response(data)

# Event - Admin View for the list of Registrations for an Event
class EventRegistrationsView(APIView):
    """
    GET /api/admin/events/<event_id>/registrations/
    Admin-only: list of registrations for a given event.
    """
    permission_classes = []  

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        regs = VolunteerEvent.objects.filter(event=event).select_related('volunteer').order_by('-signup_date')
        serializer = VolunteerEventSerializer(regs, many=True)
        return Response(serializer.data)


# Fecth all Volunteering History 
class VolunteerHistoryAPIView(APIView):
    permission_classes = []  # optional

    def get(self, request, volunteer_id):
        try:
            history = VolunteerEvent.objects.filter(volunteer__volunteer_id=volunteer_id)
            data = []

            for ve in history:
                data.append({
                    "event": {
                        "event_name": ve.event.event_name if ve.event else "Unknown Event",
                        "date_start": ve.event.date_start if ve.event else None,
                        "date_end": ve.event.date_end if ve.event else None
                    },
                    "schedule": {
                        "day": ve.schedule.day if ve.schedule else None,
                        "start_time": ve.schedule.start_time if ve.schedule else None,
                        "end_time": ve.schedule.end_time if ve.schedule else None
                    },
                    "hours_rendered": ve.hours_rendered or 0
                })

            return Response(data)

        except Exception as e:
            print(f"Error fetching volunteer history: {e}")
            return Response({"error": "Internal server error"}, status=500)



# Admin Data Statistics 
class AdminDataStatisticsAPI(APIView):
    """
    GET /api/admin/data-statistics/
    Returns:
      - total_volunteers
      - total_events
      - total_active_volunteers
      - volunteer_growth_percentage (compared to previous year)
      - volunteers_by_affiliation
    """
    permission_classes = []

    def get(self, request):
        # Total volunteers
        total_volunteers = Volunteer.objects.count()

        # Total active volunteers
        total_active = Volunteer.objects.filter(status="Active").count()

        # Total events
        total_events = Event.objects.count()

        # Volunteer growth %
        current_year = date.today().year
        previous_year_count = Volunteer.objects.filter(date_joined__year=current_year - 1).count()
        current_year_count = Volunteer.objects.filter(date_joined__year=current_year).count()
        growth_percentage = 0
        if previous_year_count > 0:
            growth_percentage = ((current_year_count - previous_year_count) / previous_year_count) * 100

        # Volunteers by affiliation
        affiliation_data = Volunteer.objects.values('affiliation_type').annotate(count=Count('affiliation_type'))

        data = {
            "total_volunteers": total_volunteers,
            "total_active_volunteers": total_active,
            "total_events": total_events,
            "volunteer_growth_percentage": round(growth_percentage, 2),
            "volunteers_by_affiliation": list(affiliation_data),
        }

        return Response(data)
    

# Admin - Privacy Settings  
class AdminProfileView(APIView):
    """
    PUT: Update password for custom Admin model (plain text)
    """

    permission_classes = []

    def put(self, request):
        try:
            # Get your ONLY admin account (username = upmin_pahinungod_admin)
            admin = Admin.objects.get(username="upmin_pahinungod_admin")
        except Admin.DoesNotExist:
            return Response({"error": "Admin account not found."}, status=404)

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"error": "Both old and new password are required."}, status=400)

        # Compare plain text password
        if admin.password != old_password:
            return Response({"error": "Old password is incorrect."}, status=400)

        # Update to new plain text password
        admin.password = new_password
        admin.save()

        return Response({"success": "Password updated successfully!"})

