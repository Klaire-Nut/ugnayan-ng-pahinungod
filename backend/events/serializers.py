from rest_framework import serializers
from core.models import (
    Event, EventSchedule, VolunteerEvent, VolunteerScheduleSelection, Volunteer,  VolunteerAccount
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
    has_joined = serializers.SerializerMethodField()
    volunteer_event_id = serializers.SerializerMethodField()

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
            "has_joined",
            "volunteer_event_id",
        ]

    def get_has_joined(self, obj):
        request = self.context.get("request")
        if not request:
            return False
        
        # get logged in volunteer
        user = request.user
        email = getattr(user, "email", None)
        if not email:
            return False

        try:
            acc = VolunteerAccount.objects.get(email=email)
            volunteer = acc.volunteer
        except VolunteerAccount.DoesNotExist:
            return False

        return VolunteerEvent.objects.filter(event=obj, volunteer=volunteer).exists()

    def get_volunteer_event_id(self, obj):
        request = self.context.get("request")
        if not request:
            return None

        user = request.user
        email = getattr(user, "email", None)
        if not email:
            return None

        try:
            acc = VolunteerAccount.objects.get(email=email)
            volunteer = acc.volunteer
        except VolunteerAccount.DoesNotExist:
            return None

        ve = VolunteerEvent.objects.filter(event=obj, volunteer=volunteer).first()
        return ve.id if ve else None

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
        # Prefer volunteer passed via context
        volunteer = self.context.get("volunteer", None)
        request = self.context.get("request", None)

        # fallback: try request.user.volunteer (keep compatibility)
        if not volunteer and request is not None:
            volunteer = getattr(request.user, "volunteer", None)

        if not volunteer:
            raise serializers.ValidationError("Volunteer account not found for the current user.")

        data["volunteer_obj"] = volunteer
        event_id = data["event"]

        # Already joined?
        if VolunteerEvent.objects.filter(volunteer=volunteer, event_id=event_id).exists():
            raise serializers.ValidationError("You already joined this event.")

        # Check each schedule’s capacity and that schedule belongs to the event
        for sid in data["schedules"]:
            try:
                sched = EventSchedule.objects.get(id=sid)
            except EventSchedule.DoesNotExist:
                raise serializers.ValidationError(f"Invalid schedule ID: {sid}")

            if sched.event_id != event_id:
                raise serializers.ValidationError(f"Schedule {sid} does not belong to event {event_id}.")

            if (sched.max_slots or 0) <= 0:
                raise serializers.ValidationError(f"Schedule on {sched.date} has no available slots configured.")

            # sched.volunteers is related_name to VolunteerScheduleSelection
            if sched.volunteers.count() >= (sched.max_slots or 0):
                raise serializers.ValidationError(f"Schedule on {sched.date} is FULL.")

        return data

    def create(self, validated_data):
        volunteer = validated_data.get("volunteer_obj")
        event_id = validated_data["event"]

        # create VolunteerEvent parent record
        ve = VolunteerEvent.objects.create(
            volunteer=volunteer,
            event_id=event_id,
            status="Joined"
        )

        # create selections that reference the volunteer_event (ve)
        schedule_ids = validated_data["schedules"]
        for sid in schedule_ids:
            VolunteerScheduleSelection.objects.create(
                volunteer_event=ve,
                schedule_id=sid
            )

        return ve

# ---------------------------------------------------
# EVENT VOLUNTEERS (ADMIN)
# ---------------------------------------------------
class EventVolunteersSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    volunteer_info = serializers.SerializerMethodField()
    schedules = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerEvent
        fields = [
            "id",                      # volunteer_event id -> use this as identifier in frontend
            "volunteer",
            "volunteer_info",
            "schedules",               # chosen schedules
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
            "first_name": v.first_name,
            "last_name": v.last_name,
            "name": f"{v.first_name} {v.last_name}",
            "email": v.accounts.first().email if v.accounts.exists() else None,
            "mobile": v.contacts.first().mobile_number if v.contacts.exists() else None,
            "affiliation": getattr(v, "affiliation_type", None),
        }

    def get_schedules(self, obj):
        event_schedules = list(
            EventSchedule.objects.filter(event=obj.event).order_by("date")
        )
        selections = obj.schedule_selections.select_related("schedule").all()

        result = []
        for sel in selections:
            schedule = sel.schedule

            # safer day finder
            try:
                day_index = next(i for i, s in enumerate(event_schedules) if s.id == schedule.id)
            except StopIteration:
                day_index = None

            result.append({
                "schedule_id": schedule.id,
                "day": f"Day {day_index + 1}" if day_index is not None else None,
            })

        return result

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