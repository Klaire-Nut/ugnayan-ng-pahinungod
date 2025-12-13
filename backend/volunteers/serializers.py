# backend/volunteers/serializers.py

from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from core.utils import generate_volunteer_identifier
from core.models import (
    Volunteer, VolunteerContact, VolunteerAddress, VolunteerBackground,
    EmergencyContact, VolunteerAccount, ProgramInterest,
    StudentProfile, AlumniProfile, StaffProfile, FacultyProfile, RetireeProfile,
    VolunteerMeta,
)

# -------------------------------------------------------
# BASIC NESTED SERIALIZERS
# -------------------------------------------------------
class VolunteerAccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True)

    class Meta:
        model = VolunteerAccount
        fields = ["email", "password"]

    def validate_email(self, value):
        if self.instance is None and VolunteerAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError("A volunteer with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return VolunteerAccount.objects.create(**validated_data)


class VolunteerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerContact
        fields = ["mobile_number", "facebook_link"]


class VolunteerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAddress
        fields = ["street_address", "province", "region"]


class VolunteerBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerBackground
        fields = ["org_affiliation", "hobbies_interests"]


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ["name", "relationship", "contact_number", "address"]


# -------------------------------------------------------
# AFFILIATION PROFILE SERIALIZERS
# -------------------------------------------------------
class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["degree_program", "year_level", "college"]


class AlumniProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniProfile
        fields = ["constituent_unit", "degree_program", "year_graduated"]


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ["office_department", "designation"]


class FacultyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = ["college", "department"]


class RetireeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetireeProfile
        fields = ["designation_while_in_up", "office_college_department"]


class VolunteerMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerMeta
        fields = [
            "volunteer_status",
            "tagapag_ugnay",
            "other_organization",
            "organization_name",
            "affirmative_action_subjects",
            "how_did_you_hear",
        ]

# -------------------------------------------------------
# VOLUNTEER REGISTRATION
# -------------------------------------------------------
class VolunteerRegistrationSerializer(serializers.Serializer):
    # Main fields
    first_name = serializers.CharField()
    middle_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField()
    nickname = serializers.CharField(required=False, allow_blank=True)
    sex = serializers.CharField()
    birthdate = serializers.DateField()
    affiliation_type = serializers.CharField()

    # Related models
    account = VolunteerAccountSerializer()
    contact = VolunteerContactSerializer()
    address = VolunteerAddressSerializer()
    background = VolunteerBackgroundSerializer()
    emergency_contact = EmergencyContactSerializer()

    # Step 2
    affiliation_data = serializers.DictField(required=False)

    # Step 3
    program_interests = serializers.ListField(child=serializers.CharField(), required=False)
    meta = VolunteerMetaSerializer(required=False)

    def create(self, validated_data):

        # Pop nested data
        account_data = validated_data.pop("account")
        contact_data = validated_data.pop("contact")
        address_data = validated_data.pop("address")
        background_data = validated_data.pop("background")
        emergency_data = validated_data.pop("emergency_contact")

        program_interests = validated_data.pop("program_interests", [])
        meta_data = validated_data.pop("meta", None)

        # Step 2 raw affiliation fields
        aff_raw = validated_data.pop("affiliation_data", {})
        aff_type = validated_data["affiliation_type"].strip().lower()

        # Normalize UP STAFF naming
        if aff_type in ["up staff", "upstaff"]:
            aff_type = "staff"

        # Add volunteer ID
        validated_data["volunteer_identifier"] = generate_volunteer_identifier()

        with transaction.atomic():

            # Create main volunteer row
            volunteer = Volunteer.objects.create(**validated_data)

            # Related tables
            VolunteerAccount.objects.create(
                volunteer=volunteer,
                email=account_data["email"],
                password=make_password(account_data["password"])
            )

            VolunteerContact.objects.create(volunteer=volunteer, **contact_data)
            VolunteerAddress.objects.create(volunteer=volunteer, **address_data)
            VolunteerBackground.objects.create(volunteer=volunteer, **background_data)
            EmergencyContact.objects.create(volunteer=volunteer, **emergency_data)

            # Create affiliation-specific profile
            if isinstance(aff_raw, dict):
                if aff_type == "student":
                    StudentProfile.objects.create(
                        volunteer=volunteer,
                        degree_program=aff_raw.get("degree_program", ""),
                        year_level=aff_raw.get("year_level", ""),
                        college=aff_raw.get("college", "")
                    )

                elif aff_type == "alumni":
                    AlumniProfile.objects.create(
                        volunteer=volunteer,
                        constituent_unit=aff_raw.get("constituent_unit", ""),
                        degree_program=aff_raw.get("degree_program", ""),
                        year_graduated=aff_raw.get("year_graduated", "")
                    )

                elif aff_type == "staff":
                    StaffProfile.objects.create(
                        volunteer=volunteer,
                        office_department=aff_raw.get("office_department", ""),
                        designation=aff_raw.get("designation", "")
                    )

                elif aff_type == "faculty":
                    FacultyProfile.objects.create(
                        volunteer=volunteer,
                        college=aff_raw.get("college", ""),
                        department=aff_raw.get("department", "")
                    )

                elif aff_type == "retiree":
                    RetireeProfile.objects.create(
                        volunteer=volunteer,
                        designation_while_in_up=aff_raw.get("designation", ""),
                        office_college_department=aff_raw.get("office", "")
                    )

            # Save program interests
            for p in program_interests:
                ProgramInterest.objects.create(volunteer=volunteer, program_name=p)

            # Save meta fields
            if meta_data:
                VolunteerMeta.objects.create(volunteer=volunteer, **meta_data)

        return volunteer

# -------------------------------------------------------
# VOLUNTEER GET PROFILE SERIALIZER
# -------------------------------------------------------
class VolunteerSerializer(serializers.ModelSerializer):

    volunteer = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    background = serializers.SerializerMethodField()
    emergency_contact = serializers.SerializerMethodField()
    program_interests = serializers.SerializerMethodField()
    affiliation_data = serializers.SerializerMethodField()
    meta = serializers.SerializerMethodField()

    class Meta:
        model = Volunteer
        fields = [
            "volunteer_id",
            "volunteer_identifier",
            "volunteer",
            "contact",
            "address",
            "background",
            "emergency_contact",
            "program_interests",
            "affiliation_data",
            "meta",
        ]

    # ---------------------------
    def get_volunteer(self, obj):
        return {
            "first_name": obj.first_name,
            "middle_name": obj.middle_name,
            "last_name": obj.last_name,
            "nickname": obj.nickname,
            "sex": obj.sex,
            "birthdate": obj.birthdate,
            "email": obj.accounts.first().email if obj.accounts.exists() else None,
            "affiliation_type": obj.affiliation_type,
            "volunteer_identifier": obj.volunteer_identifier,
        }

    def get_contact(self, obj):
        c = obj.contacts.first()
        return {
            "mobile_number": c.mobile_number,
            "facebook_link": c.facebook_link,
        } if c else {}

    def get_address(self, obj):
        a = obj.addresses.first()
        return {
            "street_address": a.street_address,
            "province": a.province,
            "region": a.region,
        } if a else {}

    def get_background(self, obj):
        b = obj.backgrounds.first()
        return {
            "org_affiliation": b.org_affiliation,
            "hobbies_interests": b.hobbies_interests,
        } if b else {}

    def get_emergency_contact(self, obj):
        e = obj.emergency_contacts.first()
        return {
            "name": e.name,
            "relationship": e.relationship,
            "contact_number": e.contact_number,
            "address": e.address,
        } if e else {}

    def get_program_interests(self, obj):
        return [p.program_name for p in obj.program_interests.all()]

    def get_affiliation_data(self, obj):
        result = []

        student = getattr(obj, "student_profile", None)
        if student:
            result.append({
                "type": "student",
                "degree_program": student.degree_program,
                "year_level": student.year_level,
                "college": student.college,
            })

        alumni = getattr(obj, "alumni_profile", None)
        if alumni:
            result.append({
                "type": "alumni",
                "constituent_unit": alumni.constituent_unit,
                "degree_program": alumni.degree_program,
                "year_graduated": alumni.year_graduated,
            })

        staff = getattr(obj, "staff_profile", None)
        if staff:
            result.append({
                "type": "staff",
                "office_department": staff.office_department,
                "designation": staff.designation,
            })

        faculty = getattr(obj, "faculty_profile", None)
        if faculty:
            result.append({
                "type": "faculty",
                "college": faculty.college,
                "department": faculty.department,
            })

        retiree = getattr(obj, "retiree_profile", None)
        if retiree:
            result.append({
                "type": "retiree",
                "designation_while_in_up": retiree.designation_while_in_up,
                "office_college_department": retiree.office_college_department,
            })

        return result

    def get_meta(self, obj):
        m = getattr(obj, "meta", None)
        if not m:
            return {}

        return {
            "volunteer_status": m.volunteer_status,
            "tagapag_ugnay": m.tagapag_ugnay,
            "other_organization": m.other_organization,
            "organization_name": m.organization_name,
            "affirmative_action_subjects": m.affirmative_action_subjects,
            "how_did_you_hear": m.how_did_you_hear,
        }
