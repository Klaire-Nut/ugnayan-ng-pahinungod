import importlib
import importlib.util
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from core.models import (
    Volunteer, VolunteerContact, VolunteerAddress, VolunteerBackground,
    EmergencyContact, VolunteerAccount, ProgramInterest,
    StudentProfile, AlumniProfile, StaffProfile, FacultyProfile, RetireeProfile,
    Event, VolunteerEvent, Admin
)

# ---------------------------------------------------------------------
#  PROFILE SERIALIZERS (Affiliation-dependent)
# ---------------------------------------------------------------------

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            "degree_program",
            "year_level",
            "college",
            "department",
        ]


class AlumniProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniProfile
        fields = [
            "constituent_unit",
            "degree_program",
            "year_graduated",
        ]


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = [
            "office_department",
            "designation",
        ]


class FacultyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = [
            "college",
            "department",
        ]


class RetireeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetireeProfile
        fields = [
            "designation_while_in_up",
            "office_college_department",
        ]


# ---------------------------------------------------------------------
#  VOLUNTEER SERIALIZER (includes dynamic profile data)
# ---------------------------------------------------------------------

class VolunteerSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    alumni_profile = AlumniProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    faculty_profile = FacultyProfileSerializer(read_only=True)
    retiree_profile = RetireeProfileSerializer(read_only=True)

    class Meta:
        model = Volunteer
        fields = [
            "volunteer_id",
            "first_name",
            "middle_name",
            "last_name",
            "nickname",
            "sex",
            "birthdate",
            "affiliation_type",
            "status",
            "total_hours",

            # profile attachments
            "student_profile",
            "alumni_profile",
            "staff_profile",
            "faculty_profile",
            "retiree_profile",
        ]


# ---------------------------------------------------------------------
#  VOLUNTEER ACCOUNT SERIALIZER
# ---------------------------------------------------------------------

class VolunteerAccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = VolunteerAccount
        fields = ["email", "password"]

    def validate_email(self, value):
        if VolunteerAccount.objects.filter(email=value).exists():
            raise serializers.ValidationError("A volunteer with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return VolunteerAccount.objects.create(**validated_data)


# ---------------------------------------------------------------------
#  BASIC SUB-PROFILE SERIALIZERS
# ---------------------------------------------------------------------

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
        fields = ["occupation", "org_affiliation", "hobbies_interests"]


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ["name", "relationship", "contact_number", "address"]

    def validate(self, attrs):
        volunteer = self.context.get("volunteer")

        if volunteer and volunteer.affiliation_type == "student":
            required = ["name", "relationship", "contact_number", "address"]
            missing = [f for f in required if not attrs.get(f)]

            if missing:
                raise serializers.ValidationError(
                    {field: "This field is required for students." for field in missing}
                )

        return attrs


# ---------------------------------------------------------------------
#  ADMIN SERIALIZER
# ---------------------------------------------------------------------

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ["admin_id", "username"]
        read_only_fields = ["admin_id"]


# ---------------------------------------------------------------------
#  EVENT SERIALIZERS
# ---------------------------------------------------------------------

class EventListSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "date_start",
            "date_end",
            "max_participants",
            "location",
            "available_slots",
            "is_full",
        ]

    def get_available_slots(self, obj):
        joined_count = VolunteerEvent.objects.filter(
            event=obj, status__in=["Joined", "Completed"]
        ).count()
        return obj.max_participants - joined_count

    def get_is_full(self, obj):
        return self.get_available_slots(obj) <= 0


class EventDetailSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    total_volunteers = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "date_start",
            "date_end",
            "max_participants",
            "location",
            "available_slots",
            "is_full",
            "total_volunteers",
        ]

    def get_total_volunteers(self, obj):
        return VolunteerEvent.objects.filter(
            event=obj, status__in=["Joined", "Completed"]
        ).count()

    def get_available_slots(self, obj):
        return obj.max_participants - self.get_total_volunteers(obj)

    def get_is_full(self, obj):
        return self.get_available_slots(obj) <= 0


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "date_start",
            "date_end",
            "max_participants",
            "location",
        ]
        read_only_fields = ["event_id"]

    def validate(self, data):
        if (
            data.get("date_start")
            and data.get("date_end")
            and data["date_end"] <= data["date_start"]
        ):
            raise serializers.ValidationError("End date must be after start date")

        if data.get("max_participants", 0) <= 0:
            raise serializers.ValidationError(
                "Maximum participants must be greater than 0"
            )

        return data


# ---------------------------------------------------------------------
#  VOLUNTEER-EVENT SERIALIZERS
# ---------------------------------------------------------------------

class VolunteerEventBaseSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.SerializerMethodField()
    event_name = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerEvent
        fields = [
            "id",
            "volunteer",
            "volunteer_name",
            "event",
            "event_name",
            "availability_time",
            "availability_orientation",
            "status",
            "hours_rendered",
            "signup_date",
        ]

    def get_volunteer_name(self, obj):
        return f"{obj.volunteer.first_name} {obj.volunteer.last_name}"

    def get_event_name(self, obj):
        return obj.event.event_name


class VolunteerEventJoinSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerEvent
        fields = ["event", "availability_time", "availability_orientation"]

    def validate(self, data):
        volunteer = self.context["volunteer"]
        event = data["event"]

        # Prevent double join
        if VolunteerEvent.objects.filter(volunteer=volunteer, event=event).exists():
            raise serializers.ValidationError("You have already joined this event")

        # Check if full
        total = VolunteerEvent.objects.filter(
            event=event, status__in=["Joined", "Completed"]
        ).count()

        if total >= event.max_participants:
            raise serializers.ValidationError("This event is already full")
        
        

        return data

    def create(self, validated_data):
        validated_data["volunteer"] = self.context["volunteer"]
        validated_data["status"] = "Joined"
        return super().create(validated_data)


class EventVolunteersSerializer(serializers.ModelSerializer):
    volunteer_info = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerEvent
        fields = [
            "volunteer",
            "volunteer_info",
            "hours_rendered",
            "status",
            "availability_time",
            "availability_orientation",
            "signup_date",
        ]

    def get_volunteer_info(self, obj):
        v = obj.volunteer
        return {
            "volunteer_id": v.volunteer_id,
            "name": f"{v.first_name} {v.last_name}",
            "email": v.accounts.first().email if v.accounts.exists() else None,
            "mobile": v.contacts.first().mobile_number if v.contacts.exists() else None,
        }