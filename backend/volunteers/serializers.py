from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from core.models import (
    Volunteer, VolunteerContact, VolunteerAddress, VolunteerBackground,
    EmergencyContact, VolunteerAccount, ProgramInterest,
    StudentProfile, AlumniProfile, StaffProfile, FacultyProfile, RetireeProfile
)
from .models import ( VolunteerAffiliation)
from core.utils import generate_volunteer_identifier
from django.db import IntegrityError

class RegisterVolunteerSerializer(serializers.Serializer):
    # --------------- Volunteer Basic Info ----------------
    first_name = serializers.CharField()
    middle_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField()
    nickname = serializers.CharField(required=False, allow_blank=True)
    sex = serializers.CharField()
    birthdate = serializers.DateField()
    affiliation_type = serializers.CharField()  # student, alumni, etc.

    # --------------- Nested Data ----------------
    contact = serializers.DictField()
    address = serializers.DictField()
    account = serializers.DictField()
    background = serializers.DictField(required=False)
    emergency_contact = serializers.DictField(required=False)

    # Affiliation-specific
    student_profile = serializers.DictField(required=False)
    alumni_profile = serializers.DictField(required=False)
    staff_profile = serializers.DictField(required=False)
    faculty_profile = serializers.DictField(required=False)
    retiree_profile = serializers.DictField(required=False)

    # Programs & Extra Fields
    program_interests = serializers.ListField(child=serializers.CharField(), required=False)
    affirmative_action_subjects = serializers.ListField(child=serializers.CharField(), required=False)
    volunteer_status = serializers.CharField(required=False)
    tagapagUgnay = serializers.CharField(required=False)
    otherOrganization = serializers.CharField(required=False)
    organizationName = serializers.CharField(required=False)
    howDidYouHear = serializers.CharField(required=False)

    def create(self, validated_data):
        affiliation_raw = validated_data.get("affiliation_type", "")
        affiliation = affiliation_raw.lower().replace(" ", "")
        print("Validated data received:", validated_data)

        # ----------------- Create main volunteer -----------------
        volunteer = Volunteer.objects.create(
            first_name=validated_data.get("first_name", ""),
            middle_name=validated_data.get("middle_name", ""),
            last_name=validated_data.get("last_name", ""),
            nickname=validated_data.get("nickname", ""),
            sex=validated_data.get("sex", ""),
            birthdate=validated_data.get("birthdate"),
            volunteer_identifier=generate_volunteer_identifier(),
            affiliation_type=affiliation,
        )

        print("Volunteer created:", volunteer, volunteer.pk)

        # ----------------- Save affiliation -----------------
        if affiliation:
            VolunteerAffiliation.objects.create(
                volunteer=volunteer,
                affiliation=affiliation
            )

        # ----------------- Contact -----------------
        contact_data = validated_data.get("contact", {})
        if any(contact_data.values()):
            VolunteerContact.objects.create(volunteer=volunteer, **contact_data)

        # ----------------- Address -----------------
        address_data = validated_data.get("address", {})
        if any(address_data.values()):
            VolunteerAddress.objects.create(volunteer=volunteer, **address_data)

        # ----------------- Background -----------------
        bg_data = validated_data.get("background", {})
        if any(bg_data.values()):
            VolunteerBackground.objects.create(volunteer=volunteer, **bg_data)

        # ----------------- Emergency Contact -----------------
        emer_data = validated_data.get("emergency_contact", {})
        if any(emer_data.values()):
            EmergencyContact.objects.create(volunteer=volunteer, **emer_data)

        # ----------------- Account -----------------
        account_data = validated_data.get("account", {})
        if account_data:
            try:
                VolunteerAccount.objects.create(
                    volunteer=volunteer,
                    email=account_data.get("email", ""),
                    password=make_password(account_data.get("password", ""))
                )
            except IntegrityError:
                raise serializers.ValidationError({
                    "account": {"email": "This email is already registered."}
                })
        # ----------------- Program Interests -----------------
        for program in validated_data.get("program_interests", []):
            ProgramInterest.objects.create(volunteer=volunteer, program_name=program)

        # ----------------- Affiliation-specific profiles -----------------
        def create_profile_if_has_data(profile_class, profile_data):
            if profile_data and any(profile_data.values()):
                profile_class.objects.create(volunteer=volunteer, **profile_data)

        if affiliation == "student":
            create_profile_if_has_data(StudentProfile, validated_data.get("student_profile", {}))
        elif affiliation == "alumni":
            create_profile_if_has_data(AlumniProfile, validated_data.get("alumni_profile", {}))
        elif affiliation == "staff":
            create_profile_if_has_data(StaffProfile, validated_data.get("staff_profile", {}))
        elif affiliation == "faculty":
            create_profile_if_has_data(FacultyProfile, validated_data.get("faculty_profile", {}))
        elif affiliation == "retiree":
            create_profile_if_has_data(RetireeProfile, validated_data.get("retiree_profile", {}))

        return volunteer



# For Admin 
class VolunteerAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAccount
        fields = ['id', 'volunteer', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}
