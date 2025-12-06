from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Event, VolunteerEvent, EventSchedule
from django.utils import timezone
from datetime import datetime
from .events_serializers import AdminEventSerializer,  EventVolunteerSerializer
from django.db.models import Case, When, Value, IntegerField
from rest_framework.permissions import AllowAny
from rest_framework import status

class AdminAllEventsAPI(APIView):
    permission_classes = []  

    def get(self, request):
        now = timezone.now()
        today = timezone.now().date()
        events_qs = Event.objects.filter(is_deleted=False).annotate(
            sort_order=Case(
                When(is_canceled=True, then=Value(3)),
                When(date_end__lt=now, then=Value(2)),       
                When(date_start__lte=now, date_end__gte=now, then=Value(1)), 
                default=Value(0),                            
                output_field=IntegerField()
            )
        ).order_by('sort_order', 'date_start')

        all_events = []
        
        for event in events_qs:
            # Schedules
            schedule_qs = event.schedules.all().order_by("day")
            # Count volunteers
            volunteers_joined = VolunteerEvent.objects.filter(
                event=event, status="Joined"
            ).count()

            

            if schedule_qs.exists():
                schedules = [
                    {
                        "date": s.day.strftime("%Y-%m-%d"),
                        "start_time": s.start_time.strftime("%I:%M %p"),
                        "end_time": s.end_time.strftime("%I:%M %p"),
                    }
                    for s in schedule_qs
                ]
            else:
                schedules = [
                    {
                        "date": event.date_start.strftime("%Y-%m-%d"),
                        "start_time": event.date_start.strftime("%I:%M %p"),
                        "end_time": event.date_end.strftime("%I:%M %p"),
                    }
                ]

            # Status
            if event.is_canceled:
                status = "CANCELLED"
            else:
                first = datetime.strptime(schedules[0]["date"], "%Y-%m-%d").date()
                last = datetime.strptime(schedules[-1]["date"], "%Y-%m-%d").date()

                if today < first:
                    status = "UPCOMING"
                elif first <= today <= last:
                    status = "HAPPENING"
                else:
                    status = "DONE"

            all_events.append({
                "id": event.event_id,
                "event_name": event.event_name,
                "location": event.location,
                "description": event.description,
                "max_participants": event.max_participants,
                "volunteers_needed": event.max_participants,
                "volunteered": volunteers_joined,
                "schedules": schedules,
                "status": status,
            })

        def sort_key(event_dict):
            first_date = datetime.strptime(event_dict["schedules"][0]["date"], "%Y-%m-%d").date()
            last_date = datetime.strptime(event_dict["schedules"][-1]["date"], "%Y-%m-%d").date()
            
            status = event_dict["status"]
            # upcoming < happening < done < cancelled
            status_order = {"UPCOMING": 0, "HAPPENING": 1, "DONE": 2, "CANCELLED": 3}
            
            return (status_order.get(status, 4), first_date)

        all_events.sort(key=sort_key)

        return Response({"all_events": all_events})


# Admin Create an Event
class AdminCreateEventAPI(APIView):
    permission_classes = []

    def post(self, request):
        serializer = AdminEventSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("ERRORS:", serializer.errors)   
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin Cancel an Event
class AdminCancelEventView(APIView):
    permission_classes = []

    def post(self, request, event_id):
        event = Event.objects.get(event_id=event_id)
        event.is_canceled = True
        event.save()
        return Response({"message": "Event canceled successfully."})

# Admin Delete an Event
class AdminDeleteEventView(APIView):
    permission_classes = []

    def delete(self, request, event_id):
        event = Event.objects.get(event_id=event_id)
        event.is_deleted = True
        event.save()
        return Response({"message": "Event soft-deleted."})

# Admin Restore an Event
class AdminRestoreEventView(APIView):
    permission_classes = []

    def post(self, request, event_id):
        event = Event.objects.get(event_id=event_id)
        event.is_deleted = False
        event.is_canceled = False
        event.save()
        return Response({"message": "Event restored."})


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = AdminEventSerializer
    lookup_field = "event_id"
    permission_classes = []
    authentication_classes = []


# Fetching Volunteers who Joined In the Event for the Event Card
class AdminEventVolunteersAPI(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = [] 

    def get(self, request, event_id):
        try:
            event = Event.objects.get(event_id=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        volunteers = VolunteerEvent.objects.filter(event=event)
        serializer = EventVolunteerSerializer(volunteers, many=True)
        return Response({"volunteers": serializer.data})