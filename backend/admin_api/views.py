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
#Implement this during production
# from rest_framework.permissions import IsAdminUser
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
    Event
)

# Serializers
from admin_api.serializers import (
    AdminVolunteerDetailSerializer,
    AdminVolunteerListSerializer
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
    # replace with [IsAdminUser] in production

    def get(self, request):
        # Recent Volunteers (show Name, Affiliation, Date Joined, Unique ID)
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
        
        # Recent Events
        events_qs = Event.objects.order_by('-event_id')[:5].values(
            'event_id', 'event_name', 'date_start', 'date_end'
        )
        recent_events = [
            {
                "id": e['event_id'],
                "title": e['event_name'],
                "start_date": e['date_start'],
                "end_date": e['date_end'],
            }
            for e in events_qs
        ]

        data = {
            "recent_volunteers": recent_volunteers,
            "recent_events": recent_events,  
        }
        return Response(data)

# Managing Volunteers - Admin for Viewing of the Volunteers Data only (Fetching data and searching Data)
class AdminVolunteerListView(ListAPIView):
    """
    GET /api/admin/volunteers/?page=1&search=&affiliation_type=student&year=2025&degree_program=BSCS&college=CCS
    Admin-only list of volunteers with pagination, search, and filters.
    """
    permission_classes = []
    #permission_classes = [IsAdminUser]
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
    GET: Fetch full volunteer details
    PUT/PATCH: Update all details including nested data
    DELETE: Delete volunteer
    """
    serializer_class = AdminVolunteerDetailSerializer
    queryset = Volunteer.objects.all()
    lookup_field = 'volunteer_id'
    permission_classes = []  # Replace with [IsAdminUser] when ready

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['volunteer_id'] = self.get_object().volunteer_id  
        return context
    
from .serializers import AdminProfileSerializer
class AdminProfileView(APIView):
    """
    GET: Fetch admin info
    PUT: Update email/password
    """
    permission_classes = []  # Replace with IsAdminUser if ready

    def get(self, request):
        serializer = AdminProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = AdminProfileSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Event - Admin View for the list of Registrations for an Event
class EventRegistrationsView(APIView):
    """
    GET /api/admin/events/<event_id>/registrations/
    Admin-only: list of registrations for a given event.
    """
    permission_classes = []  # replace with [IsAdminUser] in production

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        regs = VolunteerEvent.objects.filter(event=event).select_related('volunteer').order_by('-signup_date')
        serializer = VolunteerEventSerializer(regs, many=True)
        return Response(serializer.data)

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
    # replace with [IsAdminUser] in production

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