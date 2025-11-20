# volunteers/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

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


# Register and send OTP
class RegisterStep1(APIView):
    def post(self, request):
        try:
            email = request.data.get("email")
            
            # Normalize email
            if isinstance(email, list) and len(email) > 0:
                email = email[0]
            email = str(email).strip() if email else ""
            
            print(f"Registration request for email: '{email}'")
            
            if not email:
                return Response({"error": "Email is required"}, status=400)
            
            # Check if email already registered
            if VolunteerAccount.objects.filter(email=email).exists():
                return Response(
                    {"error": "Email already registered"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete any existing unverified OTP records for this email
            OTPVerification.objects.filter(email=email, is_verified=False).delete()
            
            # Generate OTP and send via Gmail SMTP
            otp = send_otp_smtp(email)
            print(f"Generated OTP for {email}: {otp}")

            # Save OTP to DB
            otp_record = OTPVerification.objects.create(
                email=email,
                otp_code=str(otp),
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            print(f"Saved OTP record: email={otp_record.email}, code={otp_record.otp_code}, expires={otp_record.expires_at}")

            return Response(
                {"message": "OTP sent to your email."}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(f"Error in RegisterStep1: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Failed to send OTP: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Verify OTP
class VerifyOTP(APIView):
    """
    Endpoint to verify OTP.
    """
    def post(self, request):
        # Normalize values first
        email = request.data.get("email")
        otp_input = request.data.get("otp")
        
        # Debug print
        print(f"Received email: {email}, OTP: {otp_input}")
        print(f"Request data: {request.data}")
        
        # Handle if they come as arrays
        if isinstance(email, list) and len(email) > 0:
            email = email[0]
        if isinstance(otp_input, list) and len(otp_input) > 0:
            otp_input = otp_input[0]

        email = str(email).strip() if email else ""
        otp_input = str(otp_input).strip() if otp_input else ""

        print(f"Normalized email: '{email}', OTP: '{otp_input}'")

        if not email or not otp_input:
            return Response({"error": "Email and OTP are required."}, status=400)

        # Now use the serializer with normalized data
        serializer = VolunteerOTPSerializer(data={"email": email, "otp": otp_input})
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            print(f"Serializer validation error: {e.detail}")
            return Response({"error": e.detail}, status=400)

        email = serializer.validated_data["email"]
        otp_input = serializer.validated_data["otp"]

        print(f"Looking for OTP record with email: '{email}', otp: '{otp_input}'")

        # Check what OTP records exist
        all_otps = OTPVerification.objects.filter(email=email)
        print(f"All OTP records for {email}:")
        for otp_rec in all_otps:
            print(f"  - Code: '{otp_rec.otp_code}', Verified: {otp_rec.is_verified}, Expires: {otp_rec.expires_at}")

        try:
            otp_record = OTPVerification.objects.get(
                email=email, 
                otp_code=otp_input, 
                is_verified=False
            )
            print(f"Found OTP record: {otp_record}")
        except OTPVerification.DoesNotExist:
            print(f"No matching OTP record found")
            return Response({"error": "Invalid OTP."}, status=400)

        if otp_record.expires_at < timezone.now():
            print(f"OTP expired. Expires at: {otp_record.expires_at}, Now: {timezone.now()}")
            return Response({"error": "OTP expired."}, status=400)

        otp_record.is_verified = True
        otp_record.save()
        print(f"OTP verified successfully for {email}")

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

        # Normalize array fields
        for key in data:
            value = data.get(key)
            if isinstance(value, list) and len(value) > 0:
                data[key] = value[0]

        print("Volunteer payload before serializer:", data)

        try:
            with transaction.atomic():
                # 1. Volunteer core
                volunteer_serializer = VolunteerSerializer(data={
                    "first_name": data.get("first_name"),
                    "middle_name": data.get("middle_name", ""),
                    "last_name": data.get("last_name"),
                    "nickname": data.get("nickname", ""),
                    "sex": data.get("sex"),
                    "birthdate": data.get("birthdate")
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
                    "mobile_number": data.get("mobile_number", ""),
                    "facebook_link": data.get("facebook_link", ""),
                })
                contact_serializer.is_valid(raise_exception=True)
                contact_serializer.save(volunteer=volunteer)

                # 4. Address
                address_serializer = VolunteerAddressSerializer(data={
                    "street_address": data.get("street_address", ""),
                    "province": data.get("province", ""),
                    "region": data.get("region", ""),
                })
                address_serializer.is_valid(raise_exception=True)
                address_serializer.save(volunteer=volunteer)

                # 5. Education
                education_serializer = VolunteerEducationSerializer(data={
                    "degree_program": data.get("degree_program", ""),
                    "year_level": data.get("year_level", ""),
                    "college": data.get("college", ""),
                    "department": data.get("department", ""),
                    "year_graduated": data.get("year_graduated", ""),
                })
                education_serializer.is_valid(raise_exception=True)
                education_serializer.save(volunteer=volunteer)

                # 6. Emergency contact
                emer_serializer = EmergencyContactSerializer(data={
                    "name": data.get("emer_name", ""),
                    "relationship": data.get("emer_relation", ""),
                    "contact_number": data.get("emer_contact", ""),
                    "address": data.get("emer_address", ""),
                })
                emer_serializer.is_valid(raise_exception=True)
                emer_serializer.save(volunteer=volunteer)

                # 7. Background
                background_serializer = VolunteerBackgroundSerializer(data={
                    "occupation": data.get("occupation", ""),
                    "org_affiliation": data.get("org_affiliation", ""),
                    "hobbies_interests": data.get("hobbies_interests", ""),
                })
                background_serializer.is_valid(raise_exception=True)
                background_serializer.save(volunteer=volunteer)

                # 8. Affiliation
                affiliation_serializer = VolunteerAffiliationSerializer(data={
                    "affiliation": data.get("affiliation", ""),
                })
                affiliation_serializer.is_valid(raise_exception=True)
                affiliation_serializer.save(volunteer=volunteer)

            # Remove OTP after successful registration
            otp_record.delete()

            return Response({"message": "Registration successful!"}, status=201)
            
        except serializers.ValidationError as e:
            print("Validation Error:", e.detail)
            return Response({"error": e.detail}, status=400)
        except Exception as e:
            print("Unexpected Error:", str(e))
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


@volunteer_required
def volunteer_dashboard(request):
    try:
        volunteer_id = request.session["volunteer_id"]
        volunteer = Volunteer.objects.get(volunteer_id=volunteer_id)

        return JsonResponse({
            "message": "Dashboard loaded",
            "volunteer": {
                "id": volunteer.volunteer_id,
                "name": f"{volunteer.first_name} {volunteer.last_name}",
                "status": "Active",
            }
        })
    except Volunteer.DoesNotExist:
        return JsonResponse(
            {"error": "Volunteer not found"}, 
            status=404
        )