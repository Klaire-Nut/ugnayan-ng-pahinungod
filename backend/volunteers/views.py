# volunteers/views.py
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction
from datetime import timezone, datetime
# Import the IsVolunteer permission from events app
from events.views.volunteer_views import IsVolunteer
from events.serializers import VolunteerEventSerializer
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

from .serializers import (
    VolunteerSerializer,
    VolunteerAccountSerializer,
    VolunteerContactSerializer,
    VolunteerAddressSerializer,
    VolunteerBackgroundSerializer,
    EmergencyContactSerializer
)
from events.serializers import VolunteerEventSerializer

# Your existing RegisterVolunteer class stays here
class RegisterVolunteer(APIView):
    # ... (keep your existing code)
    pass


# ============================================
# NEW VIEWS - Add below RegisterVolunteer
# ============================================

class VolunteerProfileView(APIView):
    """
    GET: Retrieve volunteer profile
    PATCH: Update volunteer profile
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    
    def get(self, request):
        volunteer = request.volunteer
        
        # Get related data
        account = volunteer.account if hasattr(volunteer, 'account') else None
        contact = volunteer.contact if hasattr(volunteer, 'contact') else None
        address = volunteer.address if hasattr(volunteer, 'address') else None
        background = volunteer.background if hasattr(volunteer, 'background') else None
        emergency = volunteer.emergency_contact if hasattr(volunteer, 'emergency_contact') else None
        
        # Get affiliation-specific data
        affiliation_data = {}
        affiliation_type = volunteer.affiliation_type.lower()
        
        if affiliation_type == 'student':
            profile = StudentProfile.objects.filter(volunteer=volunteer).first()
            if profile:
                affiliation_data = {
                    'degree_program': profile.degree_program,
                    'year_level': profile.year_level,
                    'college': profile.college,
                    'department': profile.department
                }
        elif affiliation_type == 'alumni':
            profile = AlumniProfile.objects.filter(volunteer=volunteer).first()
            if profile:
                affiliation_data = {
                    'constituent_unit': profile.constituent_unit,
                    'degree_program': profile.degree_program,
                    'year_graduated': profile.year_graduated
                }
        elif affiliation_type == 'staff':
            profile = StaffProfile.objects.filter(volunteer=volunteer).first()
            if profile:
                affiliation_data = {
                    'office_department': profile.office_department,
                    'designation': profile.designation
                }
        elif affiliation_type == 'faculty':
            profile = FacultyProfile.objects.filter(volunteer=volunteer).first()
            if profile:
                affiliation_data = {
                    'college': profile.college,
                    'department': profile.department
                }
        elif affiliation_type == 'retiree':
            profile = RetireeProfile.objects.filter(volunteer=volunteer).first()
            if profile:
                affiliation_data = {
                    'designation_while_in_up': profile.designation_while_in_up,
                    'office_college_department': profile.office_college_department
                }
        
        data = {
            # Basic Info
            'volunteer_id': volunteer.volunteer_id,
            'first_name': volunteer.first_name,
            'middle_name': volunteer.middle_name,
            'last_name': volunteer.last_name,
            'nickname': volunteer.nickname,
            'sex': volunteer.sex,
            'birthdate': volunteer.birthdate,
            'affiliation_type': volunteer.affiliation_type,
            
            # Account
            'email': account.email if account else None,
            
            # Contact
            'mobile_number': contact.mobile_number if contact else None,
            'facebook_link': contact.facebook_link if contact else None,
            
            # Address
            'street_address': address.street_address if address else None,
            'province': address.province if address else None,
            'region': address.region if address else None,
            
            # Background
            'occupation': background.occupation if background else None,
            'org_affiliation': background.org_affiliation if background else None,
            'hobbies_interests': background.hobbies_interests if background else None,
            
            # Emergency Contact (for students)
            'emergency_contact': {
                'name': emergency.name if emergency else None,
                'relationship': emergency.relationship if emergency else None,
                'contact_number': emergency.contact_number if emergency else None,
                'address': emergency.address if emergency else None,
            } if emergency else None,
            
            # Affiliation-specific data
            'affiliation_data': affiliation_data
        }
        
        return Response(data)
    
    def patch(self, request):
        volunteer = request.volunteer
        data = request.data
        
        try:
            with transaction.atomic():
                # Update basic info
                for field in ['first_name', 'middle_name', 'last_name', 'nickname', 'sex', 'birthdate']:
                    if field in data:
                        setattr(volunteer, field, data[field])
                volunteer.save()
                
                # Update contact
                if 'mobile_number' in data or 'facebook_link' in data:
                    contact, _ = VolunteerContact.objects.get_or_create(volunteer=volunteer)
                    if 'mobile_number' in data:
                        contact.mobile_number = data['mobile_number']
                    if 'facebook_link' in data:
                        contact.facebook_link = data['facebook_link']
                    contact.save()
                
                # Update address
                if any(k in data for k in ['street_address', 'province', 'region']):
                    address, _ = VolunteerAddress.objects.get_or_create(volunteer=volunteer)
                    if 'street_address' in data:
                        address.street_address = data['street_address']
                    if 'province' in data:
                        address.province = data['province']
                    if 'region' in data:
                        address.region = data['region']
                    address.save()
                
                # Update background
                if any(k in data for k in ['occupation', 'org_affiliation', 'hobbies_interests']):
                    background, _ = VolunteerBackground.objects.get_or_create(volunteer=volunteer)
                    if 'occupation' in data:
                        background.occupation = data['occupation']
                    if 'org_affiliation' in data:
                        background.org_affiliation = data['org_affiliation']
                    if 'hobbies_interests' in data:
                        background.hobbies_interests = data['hobbies_interests']
                    background.save()
                
                # Update emergency contact (for students)
                if 'emergency_contact' in data and volunteer.affiliation_type.lower() == 'student':
                    emer_data = data['emergency_contact']
                    emergency, _ = EmergencyContact.objects.get_or_create(volunteer=volunteer)
                    if 'name' in emer_data:
                        emergency.name = emer_data['name']
                    if 'relationship' in emer_data:
                        emergency.relationship = emer_data['relationship']
                    if 'contact_number' in emer_data:
                        emergency.contact_number = emer_data['contact_number']
                    if 'address' in emer_data:
                        emergency.address = emer_data['address']
                    emergency.save()
                
                # Update affiliation-specific profile
                if 'affiliation_data' in data:
                    affiliation_type = volunteer.affiliation_type.lower()
                    affil_data = data['affiliation_data']
                    
                    if affiliation_type == 'student':
                        profile, _ = StudentProfile.objects.get_or_create(volunteer=volunteer)
                        for field in ['degree_program', 'year_level', 'college', 'department']:
                            if field in affil_data:
                                setattr(profile, field, affil_data[field])
                        profile.save()
                    
                    elif affiliation_type == 'alumni':
                        profile, _ = AlumniProfile.objects.get_or_create(volunteer=volunteer)
                        for field in ['constituent_unit', 'degree_program', 'year_graduated']:
                            if field in affil_data:
                                setattr(profile, field, affil_data[field])
                        profile.save()
                    
                    elif affiliation_type == 'staff':
                        profile, _ = StaffProfile.objects.get_or_create(volunteer=volunteer)
                        for field in ['office_department', 'designation']:
                            if field in affil_data:
                                setattr(profile, field, affil_data[field])
                        profile.save()
                    
                    elif affiliation_type == 'faculty':
                        profile, _ = FacultyProfile.objects.get_or_create(volunteer=volunteer)
                        for field in ['college', 'department']:
                            if field in affil_data:
                                setattr(profile, field, affil_data[field])
                        profile.save()
                    
                    elif affiliation_type == 'retiree':
                        profile, _ = RetireeProfile.objects.get_or_create(volunteer=volunteer)
                        for field in ['designation_while_in_up', 'office_college_department']:
                            if field in affil_data:
                                setattr(profile, field, affil_data[field])
                        profile.save()
            
            return Response(
                {"message": "Profile updated successfully"},
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class VolunteerHistoryView(APIView):
    """
    GET: Retrieve volunteer's event history
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    
    def get(self, request):
        volunteer = request.volunteer
        
        # Get all volunteer events
        queryset = VolunteerEvent.objects.filter(
            volunteer=volunteer
        ).select_related('event').order_by('-signup_date')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(event__date_start__gte=date_from)
        if date_to:
            queryset = queryset.filter(event__date_end__lte=date_to)
        
        # Prepare history data
        history = []
        for ve in queryset:
            history.append({
                'event_id': ve.event.event_id,
                'event_name': ve.event.event_name,
                'date': ve.event.date_start,
                'time_in': ve.availability_time,
                'time_out': '5:30 PM',  # You might want to add this field to the model
                'time_allotted': f"{ve.hours_rendered or 0} hours {30} minutes",  # Calculate from actual times
                'status': ve.status,
                'signup_date': ve.signup_date
            })
        
        # Calculate statistics
        total_events = queryset.count()
        completed_events = queryset.filter(status='Completed').count()
        total_hours = sum([ve.hours_rendered or 0 for ve in queryset])
        
        return Response({
            'statistics': {
                'total_events': total_events,
                'completed_events': completed_events,
                'total_hours': total_hours,
            },
            'history': history
        })


class ChangePasswordView(APIView):
    """
    POST: Change user password
    """
    permission_classes = [IsAuthenticated, IsVolunteer]
    
    def post(self, request):
        volunteer = request.volunteer
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        # Validate inputs
        if not all([current_password, new_password, confirm_password]):
            return Response(
                {"error": "All password fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get volunteer account
        try:
            account = volunteer.account
        except VolunteerAccount.DoesNotExist:
            return Response(
                {"error": "Account not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check current password (assuming you're using Django's make_password)
        from django.contrib.auth.hashers import check_password
        if not check_password(current_password, account.password):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check password match
        if new_password != confirm_password:
            return Response(
                {"error": "New passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password strength
        try:
            validate_password(new_password)
        except DjangoValidationError as e:
            return Response(
                {"error": list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Change password
        from django.contrib.auth.hashers import make_password
        account.password = make_password(new_password)
        account.save()
        
        return Response(
            {"message": "Password changed successfully"},
            status=status.HTTP_200_OK
        )

class RegisterEventAPIView(APIView):
    """
    POST /api/events/<event_id>/register/
    Body: { "volunteer_id": <int>, "availability_time": "9AM - 12PM", "availability_orientation": true }
    """
    permission_classes = []  # or [IsVolunteer] IsAuthenticated

    def post(self, request, event_id):
        volunteer_id = request.data.get("volunteer_id") or request.data.get("volunteer")
        availability_time = request.data.get("availability_time", "")
        availability_orientation = bool(request.data.get("availability_orientation", False))

        if not volunteer_id:
            return Response({"error": "volunteer_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        volunteer = get_object_or_404(Volunteer, volunteer_id=volunteer_id)
        event = get_object_or_404(Event, event_id=event_id)

        # Prevent joining past events if you want:
        if event.date_end and event.date_end < timezone.now():
            return Response({"error": "Cannot register for past events."}, status=status.HTTP_400_BAD_REQUEST)

        # Create registration, but prevent duplicates using unique_together
        try:
            with transaction.atomic():
                if VolunteerEvent.objects.filter(volunteer=volunteer, event=event).exists():
                    return Response({"error": "Volunteer already registered for this event."}, status=status.HTTP_400_BAD_REQUEST)

                reg = VolunteerEvent.objects.create(
                    volunteer=volunteer,
                    event=event,
                    availability_time=availability_time,
                    availability_orientation=availability_orientation,
                    status="Joined",
                )
        except IntegrityError:
            return Response({"error": "Registration failed (possible duplicate)."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = VolunteerEventSerializer(reg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Let a volunteer see events they joined
class VolunteerJoinedEventsView(ListAPIView):
    """
    GET /api/volunteers/<volunteer_id>/events/
    Lists events the given volunteer joined.
    """
    serializer_class = VolunteerEventSerializer
    permission_classes = [IsAuthenticated]  # or custom IsVolunteer

    def get_queryset(self):
        vol_id = self.kwargs.get("volunteer_id")
        return VolunteerEvent.objects.filter(volunteer__volunteer_id=vol_id).order_by('-signup_date')


