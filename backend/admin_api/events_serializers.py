from rest_framework import serializers
from core.models import Event, EventSchedule

# Serializer for Event in the Admin Side
class EventScheduleSerializer(serializers.ModelSerializer):
    day = serializers.DateField()
    class Meta:
        model = EventSchedule
        fields = ["day", "start_time", "end_time"]

# Admin Event Serializer
class AdminEventSerializer(serializers.ModelSerializer):
    schedules = EventScheduleSerializer(many=True)
    is_canceled = serializers.BooleanField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "event_id",
            "event_name",
            "description",
            "location",
            "date_start",
            "date_end",
            "max_participants",
            "schedules",
            "is_canceled",
            "is_deleted",
            "status",
        ]
        read_only_fields = ["event_id"]

    def create(self, validated_data):
        schedules_data = validated_data.pop("schedules", [])

        # Default max_participants
        if validated_data.get("max_participants") is None:
            validated_data["max_participants"] = 0

        from core.models import Admin
        validated_data["created_by"] = Admin.objects.get(pk=4)

        # Create the event
        event = Event.objects.create(**validated_data)

        # Create schedules correctly
        for sched in schedules_data:
            EventSchedule.objects.create(
                event=event,
                day=sched["day"],            
                start_time=sched["start_time"],
                end_time=sched["end_time"]
            )

        # Fallback if no schedules provided
        if not schedules_data:
            EventSchedule.objects.create(
                event=event,
                day=validated_data["date_start"].date(),
                start_time=validated_data["date_start"].time(),
                end_time=validated_data["date_end"].time(),
            )

        return event



    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Ensure schedules are never empty
        if not data["schedules"]:
            data["schedules"] = [{
                "day": instance.date_start.strftime("%Y-%m-%d"),
                "start_time": instance.date_start.strftime("%H:%M"),
                "end_time": instance.date_end.strftime("%H:%M")
            }]
        else:
            for s in data["schedules"]:
                if not isinstance(s["day"], str):
                    s["day"] = s["day"].strftime("%Y-%m-%d")

        # Ensure status is always set
        data["status"] = self.get_status(instance)
        return data

    def get_status(self, obj):
        from django.utils import timezone
        now = timezone.now()
        if obj.is_canceled:
            return "CANCELLED"
        elif obj.date_start <= now <= obj.date_end:
            return "HAPPENING"
        elif obj.date_end < now:
            return "DONE"
        else:
            return "UPCOMING"


    def update(self, instance, validated_data):
        """
        Update an Event instance with new data.
        Handles schedules safely.
        """
        # Extract schedules if provided
        schedules_data = validated_data.pop("schedules", None)

        # Update simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace schedules if provided
        if schedules_data is not None:
            # Delete old schedules
            instance.schedules.all().delete()
            # Create new ones
            for sched in schedules_data:
                EventSchedule.objects.create(
                    event=instance,
                    day=sched["day"],           
                    start_time=sched["start_time"],
                    end_time=sched["end_time"]
                )

        return instance

    # Cancel an event
    def cancel_event(self, instance):
        instance.is_canceled = True
        instance.save()
        return instance

    # Restore a canceled event
    def restore_event(self, instance):
        instance.is_canceled = False
        instance.save()
        return instance

    # Permanently delete
    def delete_event(self, instance):
        instance.is_deleted = True   # or instance.delete() if you want hard delete
        instance.save()
        return instance
