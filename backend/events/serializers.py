from rest_framework import serializers
from core.models import (
    Event, EventSchedule, VolunteerEvent, VolunteerScheduleSelection, Volunteer,
)


# ---------------------------------------------------
# EVENT SCHEDULE SERIALIZER (WITH SLOTS)
# ---------------------------------------------------
class EventScheduleSerializer(serializers.ModelSerializer):
    slots_taken = serializers.SerializerMethodField()
    slots_remaining = serializers.SerializerMethodField()

    class Meta:
        model = EventSchedule
        fields = [
            "id",
            "date",
            "start_time",
            "end_time",
            "max_slots",
            "slots_taken",
            "slots_remaining",
        ]

    def get_slots_taken(self, obj):
        return obj.volunteers.count()

    def get_slots_remaining(self, obj):
        return max(obj.max_slots - obj.volunteers.count(), 0)

# ---------------------------------------------------
# EVENT SERIALIZER (VOLUNTEER VIEW)
# ---------------------------------------------------
class EventSerializer(serializers.ModelSerializer):
    schedules = EventScheduleSerializer(many=True, read_only=True)
    volunteer_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "location",
            "is_cancelled",
            "date_start",
            "date_end",
            "schedules",
            "volunteer_status",
        ]

    def get_volunteer_status(self, obj):
        user = self.context.get("request").user
        if not user or not hasattr(user, "volunteer"):
            return None

        volunteer = user.volunteer
        try:
            ve = VolunteerEvent.objects.get(volunteer=volunteer, event=obj)
            return {
                "is_joined": True,
                "status": ve.status,
                "hours_rendered": ve.hours_rendered,
            }
        except VolunteerEvent.DoesNotExist:
            return {"is_joined": False}

# ---------------------------------------------------
# EVENT LIST SERIALIZER (PUBLIC)
# ---------------------------------------------------
class EventListSerializer(serializers.ModelSerializer):
    schedules = EventScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "location",
            "date_start",
            "date_end",
            "schedules",
            "is_cancelled",
        ]

# ---------------------------------------------------
# ADMIN EVENT DETAIL
# ---------------------------------------------------
class EventDetailSerializer(serializers.ModelSerializer):
    schedules = EventScheduleSerializer(many=True, read_only=True)
    total_volunteers = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "location",
            "total_volunteers",
            "schedules",
        ]

    def get_total_volunteers(self, obj):
        return VolunteerEvent.objects.filter(event=obj).count()

# ---------------------------------------------------
# JOIN EVENT SERIALIZER
# ---------------------------------------------------
class JoinEventSerializer(serializers.Serializer):
    event = serializers.IntegerField()
    schedules = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)

    def validate(self, data):
        request = self.context["request"]
        volunteer = request.user.volunteer
        event_id = data["event"]

        # Already joined?
        if VolunteerEvent.objects.filter(volunteer=volunteer, event_id=event_id).exists():
            raise serializers.ValidationError("You already joined this event.")

        # Check each schedule’s capacity
        for sid in data["schedules"]:
            try:
                sched = EventSchedule.objects.get(id=sid)
            except EventSchedule.DoesNotExist:
                raise serializers.ValidationError(f"Invalid schedule ID: {sid}")

            if sched.volunteers.count() >= sched.max_slots:
                raise serializers.ValidationError(
                    f"Schedule on {sched.date} is FULL."
                )

        return data

    def create(self, validated_data):
        request = self.context["request"]
        volunteer = request.user.volunteer
        event_id = validated_data["event"]

        ve = VolunteerEvent.objects.create(
            volunteer=volunteer,
            event_id=event_id,
            status="Joined"
        )

        for sid in validated_data["schedules"]:
            VolunteerScheduleSelection.objects.create(
                volunteer=volunteer,
                schedule_id=sid
            )

        return ve

# ---------------------------------------------------
# EVENT VOLUNTEERS (ADMIN)
# ---------------------------------------------------
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

# ---------------------------------------------------
# BASE VOLUNTEER-EVENT SERIALIZER
# ---------------------------------------------------
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