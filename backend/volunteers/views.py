# volunteers/views.py
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAccount,
    StudentProfile,
    AlumniProfile,
    StaffProfile,
    FacultyProfile,
    RetireeProfile
)

from .serializers import (
    VolunteerSerializer,
    VolunteerAccountSerializer,
    VolunteerContactSerializer,
    VolunteerAddressSerializer,
    VolunteerBackgroundSerializer,
    EmergencyContactSerializer
)

class RegisterVolunteer(APIView):
    def post(self, request):
        data = request.data.get("volunteerData") or request.data
        email = data.get("email")
        password = data.get("password")
        affiliation_type = (data.get("affiliation_type") or "").lower()  # Safe

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=400)

        if VolunteerAccount.objects.filter(email=email).exists():
            return Response({"error": "Email already registered."}, status=400)

        try:
            with transaction.atomic():
                # Core volunteer
                volunteer_serializer = VolunteerSerializer(data={
                    "first_name": data.get("first_name"),
                    "middle_name": data.get("middle_name"),
                    "last_name": data.get("last_name"),
                    "nickname": data.get("nickname"),
                    "sex": data.get("sex"),
                    "birthdate": data.get("birthdate"),
                    "affiliation_type": data.get("affiliation_type"),
                })
                volunteer_serializer.is_valid(raise_exception=True)
                volunteer = volunteer_serializer.save()

                # Account
                account_serializer = VolunteerAccountSerializer(data={
                    "email": email,
                    "password": password
                })
                account_serializer.is_valid(raise_exception=True)
                account_serializer.save(volunteer=volunteer)

                # Contact
                contact_serializer = VolunteerContactSerializer(data={
                    "mobile_number": data.get("mobile_number"),
                    "facebook_link": data.get("facebook_link")
                })
                contact_serializer.is_valid(raise_exception=True)
                contact_serializer.save(volunteer=volunteer)

                # Address
                address_serializer = VolunteerAddressSerializer(data={
                    "street_address": data.get("street_address"),
                    "province": data.get("province"),
                    "region": data.get("region")
                })
                address_serializer.is_valid(raise_exception=True)
                address_serializer.save(volunteer=volunteer)

                # Emergency Contact (students only)
                if affiliation_type == 'student':
                    emer_name = data.get("emer_name")
                    emer_relation = data.get("emer_relation")
                    emer_contact = data.get("emer_contact")
                    emer_address = data.get("emer_address")

                    if not (emer_name and emer_relation and emer_contact and emer_address):
                        return Response(
                            {"error": "Emergency contact fields are required for students."},
                            status=400
                        )

                    emergency_serializer = EmergencyContactSerializer(data={
                        "name": emer_name,
                        "relationship": emer_relation,
                        "contact_number": emer_contact,
                        "address": emer_address,
                    })
                    emergency_serializer.is_valid(raise_exception=True)
                    emergency_serializer.save(volunteer=volunteer)

                # Background (all volunteers)
                background_serializer = VolunteerBackgroundSerializer(data={
                    "occupation": data.get("occupation"),
                    "org_affiliation": data.get("org_affiliation"),
                    "hobbies_interests": data.get("hobbies_interests")
                })
                background_serializer.is_valid(raise_exception=True)
                background_serializer.save(volunteer=volunteer)

                # Affiliation-specific profile
                if affiliation_type == 'student':
                    StudentProfile.objects.create(
                        volunteer=volunteer,
                        degree_program=data.get('degree_program'),
                        year_level=data.get('year_level'),
                        college=data.get('college'),
                        department=data.get('department')
                    )
                elif affiliation_type == 'alumni':
                    AlumniProfile.objects.create(
                        volunteer=volunteer,
                        constituent_unit=data.get('constituent_unit'),
                        degree_program=data.get('degree_program'),
                        year_graduated=data.get('year_graduated')
                    )
                elif affiliation_type == 'staff':
                    StaffProfile.objects.create(
                        volunteer=volunteer,
                        office_department=data.get('office_department'),
                        designation=data.get('designation')
                    )
                elif affiliation_type == 'faculty':
                    FacultyProfile.objects.create(
                        volunteer=volunteer,
                        college=data.get('college'),
                        department=data.get('department')
                    )
                elif affiliation_type == 'retiree':
                    RetireeProfile.objects.create(
                        volunteer=volunteer,
                        designation_while_in_up=data.get('designation_while_in_up'),
                        office_college_department=data.get('office_college_department')
                    )

            return Response({"message": "Registration successful!"}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)
