# views.py - Django Backend OTP Implementation

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    # Help static type checkers and editors resolve the symbol without requiring Django at runtime
    from django.core.cache import cache  # type: ignore

try:
    import importlib
    cache_module = importlib.import_module('django.core.cache')
    cache = getattr(cache_module, 'cache')
except Exception:
    # Fallback simple in-memory cache for environments without Django installed
    import time

    class SimpleCache:
        def __init__(self):
            self._store = {}

        def set(self, key, value, timeout=None):
            expires_at = None
            if timeout is not None:
                expires_at = time.time() + timeout
            self._store[key] = (value, expires_at)

        def get(self, key, default=None):
            item = self._store.get(key)
            if not item:
                return default
            value, expires_at = item
            if expires_at is not None and time.time() > expires_at:
                # expired
                try:
                    del self._store[key]
                except KeyError:
                    pass
                return default
            return value

        def delete(self, key):
            try:
                del self._store[key]
            except KeyError:
                pass

    cache = SimpleCache()

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import random
import string

def generate_otp(length=6):
    """Generate a random numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))

@api_view(['POST'])
def send_otp(request):
    """
    Generate OTP and store in cache (no email required)
    Returns the OTP in response for development/testing
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP in cache with 5-minute expiration
    cache_key = f'otp_{email}'
    cache.set(cache_key, otp, timeout=300)  # 5 minutes
    
    # For development: return OTP in response
    # For production: remove this and implement email sending
    return Response({
        'message': 'OTP generated successfully',
        'otp': otp,  # Remove this line in production
        'email': email
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def verify_otp(request):
    """
    Verify OTP against cached value
    """
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not email or not otp:
        return Response(
            {'error': 'Email and OTP are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get stored OTP from cache
    cache_key = f'otp_{email}'
    stored_otp = cache.get(cache_key)
    
    if not stored_otp:
        return Response(
            {'error': 'OTP expired or not found'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if stored_otp != otp:
        return Response(
            {'error': 'Invalid OTP'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # OTP is valid, delete it from cache
    cache.delete(cache_key)
    
    return Response({
        'message': 'OTP verified successfully',
        'verified': True
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def register_volunteer_with_otp(request):
    """
    Register volunteer after OTP verification
    """
    from .models import Volunteer
    from .serializers import VolunteerSerializer
    
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    # First verify OTP
    cache_key = f'otp_{email}'
    stored_otp = cache.get(cache_key)
    
    if not stored_otp or stored_otp != otp:
        return Response(
            {'error': 'Invalid or expired OTP'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # OTP is valid, proceed with registration
    cache.delete(cache_key)
    
    # Create volunteer
    serializer = VolunteerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'Registration successful', 'data': serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


