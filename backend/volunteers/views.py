from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Affiliation
from rest_framework import status
from django.db import transaction

from core.models import (
    Volunteer,
    VolunteerContact,
    VolunteerAddress,
    VolunteerEducation,
    VolunteerBackground,
    EmergencyContact,
    VolunteerAffiliation,
    VolunteerAccount
)

from .serializers import (
    VolunteerSerializer, VolunteerAccountSerializer, VolunteerContactSerializer,
    VolunteerAddressSerializer, VolunteerEducationSerializer, VolunteerBackgroundSerializer,
    EmergencyContactSerializer, VolunteerAffiliationSerializer
)

class RegisterVolunteer(APIView):
    def post(self, request):
        data = request.data.get("volunteerData") or request.data

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=400)

        if VolunteerAccount.objects.filter(email=email).exists():
            return Response({"error": "Email already registered."}, status=400)

        try:
            with transaction.atomic():

                # 1. Create the core volunteer info
                volunteer_serializer = VolunteerSerializer(data={
                    "first_name": data.get("first_name"),
                    "middle_name": data.get("middle_name"),
                    "last_name": data.get("last_name"),
                    "nickname": data.get("nickname"),
                    "sex": data.get("sex"),
                    "birthdate": data.get("birthdate"),
                })
                volunteer_serializer.is_valid(raise_exception=True)
                volunteer = volunteer_serializer.save()

                # 2. Create account
                account_serializer = VolunteerAccountSerializer(data={
                    "email": email,
                    "password": password
                })
                account_serializer.is_valid(raise_exception=True)
                account_serializer.save(volunteer=volunteer)

                # 3. Contact
                contact_serializer = VolunteerContactSerializer(data={
                    "mobile_number": data.get("mobile_number"),
                    "facebook_link": data.get("facebook_link")
                })
                contact_serializer.is_valid(raise_exception=True)
                contact_serializer.save(volunteer=volunteer)

                # 4. Address
                address_serializer = VolunteerAddressSerializer(data={
                    "street_address": data.get("street_address"),
                    "province": data.get("province"),
                    "region": data.get("region")
                })
                address_serializer.is_valid(raise_exception=True)
                address_serializer.save(volunteer=volunteer)

                # 5. Education
                education_serializer = VolunteerEducationSerializer(data={
                    "degree_program": data.get("degree_program"),
                    "year_level": data.get("year_level"),
                    "college": data.get("college"),
                    "department": data.get("department"),
                    "year_graduated": data.get("year_graduated"),
                })
                education_serializer.is_valid(raise_exception=True)
                education_serializer.save(volunteer=volunteer)

                # 6. Emergency Contact
                emergency_serializer = EmergencyContactSerializer(data={
                    "name": data.get("emer_name"),
                    "relationship": data.get("emer_relation"),
                    "contact_number": data.get("emer_contact"),
                    "address": data.get("emer_address"),
                })
                emergency_serializer.is_valid(raise_exception=True)
                emergency_serializer.save(volunteer=volunteer)

                # 7. Background
                background_serializer = VolunteerBackgroundSerializer(data={
                    "occupation": data.get("occupation"),
                    "org_affiliation": data.get("org_affiliation"),
                    "hobbies_interests": data.get("hobbies_interests")
                })
                background_serializer.is_valid(raise_exception=True)
                background_serializer.save(volunteer=volunteer)

                # 8. Affiliation
                affiliations_list = data.get("org_affiliation", [])  # expect an array of names
                for aff_name in affiliations_list:
                    # Get existing Affiliation or create new
                    affiliation_obj, _ = Affiliation.objects.get_or_create(affiliation_name=aff_name)
                    
                    # Link to volunteer
                    VolunteerAffiliation.objects.create(volunteer=volunteer, affiliation=affiliation_obj)


            return Response({"message": "Registration successful!"}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)
