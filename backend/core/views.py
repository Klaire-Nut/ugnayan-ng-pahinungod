from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import VolunteerSerializer

@api_view(['POST'])
def register_volunteer(request):
    serializer = VolunteerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Registration successful!'}, status=201)
    # Print errors to console so you know exactly what is missing/invalid
    print(serializer.errors)
    return Response(serializer.errors, status=400)

