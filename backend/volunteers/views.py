# volunteers/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# For debug endpoint
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.db import transaction
from django.utils import timezone
from datetime import timedelta
#Add for token auth
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from django.http import JsonResponse
from accounts.decorators import volunteer_required
from core.models import Volunteer


# SMTP OTP function
from .utils import send_otp_smtp

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
from .models import OTPVerification 


from .serializers import (
    VolunteerSerializer, VolunteerAccountSerializer, VolunteerContactSerializer,
    VolunteerAddressSerializer, VolunteerEducationSerializer, VolunteerBackgroundSerializer,
    EmergencyContactSerializer, VolunteerAffiliationSerializer, VolunteerOTPSerializer
)

# Add this new class to your views.py
class VolunteerLogin(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_200_OK)
    
# Register and send OTP
class RegisterStep1(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)
        
        # Generate OTP and send via Gmail SMTP
        otp = send_otp_smtp(email)

        # Save OTP in session
        request.session['otp'] = otp

        # Save OTP to DB
        OTPVerification.objects.create(
            email=email,
            otp_code=otp,
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        return Response({"message": "OTP sent to your email."}, status=200)


# Verify OTP
class VerifyOTP(APIView):
    """
    Endpoint to verify OTP.
    """
    def post(self, request):
         # Normalize values first
        email = request.data.get("email")
        otp_input = request.data.get("otp")

        if isinstance(email, list) and len(email) > 0:
            email = email[0]
        if isinstance(otp_input, list) and len(otp_input) > 0:
            otp_input = otp_input[0]

        email = str(email) if email else ""
        otp_input = str(otp_input) if otp_input else ""

        if not email or not otp_input:
            return Response({"error": "Email and OTP are required."}, status=400)

        # Now use the serializer with normalized data
        serializer = VolunteerOTPSerializer(data={"email": email, "otp": otp_input})
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp_input = serializer.validated_data["otp"]

        try:
            otp_record = OTPVerification.objects.get(email=email, otp_code=otp_input, is_verified=False)
        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid OTP."}, status=400)

        if otp_record.expires_at < timezone.now():
            return Response({"error": "OTP expired."}, status=400)

        otp_record.is_verified = True
        otp_record.save()

        return Response({"message": "OTP verified successfully."}, status=200)


# FinalRegistration 
class FinalRegistration(APIView):
    def post(self, request):
        otp_input = request.data.get("otp")
        email = request.data.get("email")

        if not email or not otp_input:
            return Response({"error": "Email and OTP are required."}, status=400)

        # Check OTP
        try:
            otp_record = OTPVerification.objects.get(
                email=email, otp_code=otp_input, is_verified=True
            )
        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid or unverified OTP."}, status=400)

        # Check duplicate registration
        if VolunteerAccount.objects.filter(email=email).exists():
            return Response({"error": "Volunteer already registered."}, status=400)

        # Accept nested 'volunteerData' payload
        data = request.data.get("volunteerData") or {}
        if not data:
            return Response({"error": "Volunteer data is required."}, status=400)

        # Normalize any fields that might come as arrays
        for key in [
            "birthdate", "first_name", "middle_name", "last_name", "nickname",
            "sex", "degree_program", "year_level", "college", "department",
            "year_graduated", "emer_name", "emer_relation", "emer_contact",
            "emer_address", "occupation", "org_affiliation", "hobbies_interests",
            "affiliation", "mobile_number", "facebook_link", "street_address",
            "province", "region", "username", "password", "email"
        ]:
            value = data.get(key)
            if isinstance(value, list) and len(value) > 0:
                data[key] = value[0]

        # Debug prints (optional)
        print("Volunteer payload before serializer:", data)

        with transaction.atomic():
            # 1. Volunteer core
            volunteer_serializer = VolunteerSerializer(data={
                k: data.get(k) for k in [
                    "first_name", "middle_name", "last_name", "nickname",
                    "sex", "birthdate"
                ]
            })
            volunteer_serializer.is_valid(raise_exception=True)
            volunteer = volunteer_serializer.save()

            # 2. Account
            account_serializer = VolunteerAccountSerializer(data={
                "email": email,
                "username": data.get("username"),
                "password": data.get("password")
            })
            account_serializer.is_valid(raise_exception=True)
            account_serializer.save(volunteer=volunteer)

            # 3. Contact
            contact_serializer = VolunteerContactSerializer(data={
                "mobile_number": data.get("mobile_number"),
                "facebook_link": data.get("facebook_link"),
            })
            contact_serializer.is_valid(raise_exception=True)
            contact_serializer.save(volunteer=volunteer)

            # 4. Address
            address_serializer = VolunteerAddressSerializer(data={
                "street_address": data.get("street_address"),
                "province": data.get("province"),
                "region": data.get("region"),
            })
            address_serializer.is_valid(raise_exception=True)
            address_serializer.save(volunteer=volunteer)

            # 5. Education
            department = data.get("department")
            if isinstance(department, list) and len(department) > 0:
                    data["department"] = department[0]

            education_serializer = VolunteerEducationSerializer(data={
                    "degree_program": data.get("degree_program"),
                    "year_level": data.get("year_level"),
                    "college": data.get("college"),
                    "department": data.get("department"),
                    "year_graduated": data.get("year_graduated"),
                })
            education_serializer.is_valid(raise_exception=True)
            education_serializer.save(volunteer=volunteer)

            # 6. Emergency contact
            emer_serializer = EmergencyContactSerializer(data={
                "name": data.get("emer_name"),
                "relationship": data.get("emer_relation"),
                "contact_number": data.get("emer_contact"),
                "address": data.get("emer_address"),
            })
            emer_serializer.is_valid(raise_exception=True)
            emer_serializer.save(volunteer=volunteer)

            # 7. Background
            background_serializer = VolunteerBackgroundSerializer(data={
                "occupation": data.get("occupation"),
                "org_affiliation": data.get("org_affiliation"),
                "hobbies_interests": data.get("hobbies_interests"),
            })
            background_serializer.is_valid(raise_exception=True)
            background_serializer.save(volunteer=volunteer)

            # 8. Affiliation
            affiliation_serializer = VolunteerAffiliationSerializer(data={
                "affiliation": data.get("affiliation"),
            })
            affiliation_serializer.is_valid(raise_exception=True)
            affiliation_serializer.save(volunteer=volunteer)

        # Remove OTP
        otp_record.delete()

        return Response({"message": "Registration successful!"}, status=201)


@volunteer_required
def volunteer_dashboard(request):
    volunteer_id = request.session["volunteer_id"]
    volunteer = Volunteer.objects.get(volunteer_id=volunteer_id)

    return JsonResponse({
        "message": "Dashboard loaded",
        "volunteer": {
            "id": volunteer.volunteer_id,
            "name": f"{volunteer.first_name} {volunteer.last_name}",
            "status": "Active",  # or volunteer.status if added
        }
    })

# Debug endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_user(request):
    """
    Debug endpoint to check if user is properly linked to a volunteer account.
    """
    try:
        volunteer_account = VolunteerAccount.objects.select_related('volunteer').get(
            email=request.user.email
        )
        return Response({
            "success": True,
            "user": request.user.username,
            "email": request.user.email,
            "has_volunteer_account": True,
            "volunteer_id": volunteer_account.volunteer.volunteer_id,
            "volunteer_name": f"{volunteer_account.volunteer.first_name} {volunteer_account.volunteer.last_name}"
        })
    except VolunteerAccount.DoesNotExist:
        return Response({
            "success": False,
            "user": request.user.username,
            "email": request.user.email,
            "has_volunteer_account": False,
            "error": "No VolunteerAccount found for this user. Please link this user to a volunteer account."
        })
