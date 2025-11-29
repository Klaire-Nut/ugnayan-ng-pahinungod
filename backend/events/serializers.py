import importlib
import importlib.util
from rest_framework import serializers
from core.models import Event, VolunteerEvent, Admin, Volunteer, EventSchedule
# Try to import rest_framework.serializers at runtime only if it's available
if importlib.util.find_spec('rest_framework.serializers') is not None:
    serializers = importlib.import_module('rest_framework.serializers')
else:
    # Fallback stubs for static analysis
    class SerializerMethodField:
        def __init__(self, *args, **kwargs):
            pass

    class StringRelatedField:
        def __init__(self, *args, **kwargs):
            pass

    class ValidationError(Exception):
        pass

    class ModelSerializer:
        pass

    class _serializers_stub:
        ModelSerializer = ModelSerializer
        SerializerMethodField = SerializerMethodField
        StringRelatedField = StringRelatedField
        ValidationError = ValidationError

    serializers = _serializers_stub()




class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['admin_id', 'username']
        read_only_fields = ['admin_id']


class EventListSerializer(serializers.ModelSerializer):
    """Serializer for listing events (public view)"""
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'event_id', 'event_name', 'description', 
            'date_start', 'date_end', 'max_participants',
            'location', 'available_slots', 'is_full'
        ]
    
    def get_available_slots(self, obj):
        joined_count = VolunteerEvent.objects.filter(
            event=obj, 
            status__in=['Joined', 'Completed']
        ).count()
        return obj.max_participants - joined_count
    
    def get_is_full(self, obj):
        return self.get_available_slots(obj) <= 0


class EventDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed event view"""
    available_slots = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    total_volunteers = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'event_id', 'event_name', 'description',
            'date_start', 'date_end', 'max_participants',
            'location', 'available_slots', 
            'is_full', 'total_volunteers'
        ]
    
    def get_available_slots(self, obj):
        joined_count = VolunteerEvent.objects.filter(
            event=obj,
            status__in=['Joined', 'Completed']
        ).count()
        return obj.max_participants - joined_count
    
    def get_is_full(self, obj):
        return self.get_available_slots(obj) <= 0
    
    def get_total_volunteers(self, obj):
        return VolunteerEvent.objects.filter(
            event=obj,
            status__in=['Joined', 'Completed']
        ).count()


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating events (admin only)"""
    
    class Meta:
        model = Event
        fields = [
            'event_id', 'event_name', 'description',
            'date_start', 'date_end', 'max_participants',
            'location'
        ]
        read_only_fields = ['event_id']
    
    def validate(self, data):
        if data.get('date_start') and data.get('date_end'):
            if data['date_end'] <= data['date_start']:
                raise serializers.ValidationError(
                    "End date must be after start date"
                )
        
        if data.get('max_participants', 0) <= 0:
            raise serializers.ValidationError(
                "Maximum participants must be greater than 0"
            )
        
        return data


class VolunteerEventSerializer(serializers.ModelSerializer):
    """Serializer for volunteer-event relationship"""
    volunteer_name = serializers.SerializerMethodField()
    event_name = serializers.StringRelatedField(source='event')
    
    class Meta:
        model = VolunteerEvent
        fields = [
            'volunteer', 'event', 'volunteer_name', 'event_name',
            'hours_rendered', 'status', 'availability_time',
            'availability_orientation', 'signup_date'
        ]
        read_only_fields = ['signup_date']
    
    def get_volunteer_name(self, obj):
        return f"{obj.volunteer.first_name} {obj.volunteer.last_name}"


class VolunteerEventJoinSerializer(serializers.ModelSerializer):
    """Serializer for volunteers joining events"""
    
    class Meta:
        model = VolunteerEvent
        fields = [
            'event', 'availability_time', 'availability_orientation'
        ]
    
    def validate(self, data):
        volunteer = self.context['volunteer']
        event = data['event']
        
        # Check if already joined
        if VolunteerEvent.objects.filter(volunteer=volunteer, event=event).exists():
            raise serializers.ValidationError("You have already joined this event")
        
        # Check if event is full
        joined_count = VolunteerEvent.objects.filter(
            event=event,
            status__in=['Joined', 'Completed']
        ).count()
        
        if joined_count >= event.max_participants:
            raise serializers.ValidationError("This event is already full")
        
        return data
    
    def create(self, validated_data):
        validated_data['volunteer'] = self.context['volunteer']
        validated_data['status'] = 'Joined'
        return super().create(validated_data)


class EventVolunteersSerializer(serializers.ModelSerializer):
    """Serializer for listing volunteers in an event (admin view)"""
    volunteer_info = serializers.SerializerMethodField()
    
    class Meta:
        model = VolunteerEvent
        fields = [
            'volunteer', 'volunteer_info', 'hours_rendered',
            'status', 'availability_time', 'availability_orientation',
            'signup_date'
        ]
    
    def get_volunteer_info(self, obj):
        volunteer = obj.volunteer
        return {
            'volunteer_id': volunteer.volunteer_id,
            'name': f"{volunteer.first_name} {volunteer.last_name}",
            'email': volunteer.accounts.first().email if volunteer.accounts.exists() else None,
            'mobile': volunteer.contacts.first().mobile_number if volunteer.contacts.exists() else None,
        }

# Serializer For Event Registration
class VolunteerEventSerializer(serializers.ModelSerializer):
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
        read_only_fields = ["id", "status", "hours_rendered", "signup_date"]

    def get_volunteer_name(self, obj):
        return f"{obj.volunteer.first_name} {obj.volunteer.last_name}"

    def get_event_name(self, obj):
        return obj.event.event_name

# Serializer for Event in the Admin Side
class EventScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSchedule
        fields = ["schedule_id", "day", "start_time", "end_time"]

class AdminEventSerializer(serializers.ModelSerializer):
    schedules = EventScheduleSerializer(many=True, required=False)
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
            "created_by",
            "schedules",
            "is_canceled",
            "is_deleted",
            "status",
        ]
        read_only_fields = ["event_id"]

    def get_status(self, obj):
        from django.utils import timezone
        now = timezone.now()
        if obj.is_canceled:
            return "Canceled"
        elif obj.date_start <= now <= obj.date_end:
            return "Ongoing"
        elif obj.date_end < now:
            return "Done"
        else:
            return "Upcoming"

    def create(self, validated_data):
        schedules_data = validated_data.pop("schedules", [])
        event = Event.objects.create(**validated_data)
        for sched in schedules_data:
            EventSchedule.objects.create(event=event, **sched)
        return event

    def update(self, instance, validated_data):
        schedules_data = validated_data.pop("schedules", None)

        # update simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # if schedules provided, replace them
        if schedules_data is not None:
            instance.schedules.all().delete()
            for sched in schedules_data:
                EventSchedule.objects.create(event=instance, **sched)

        return instance