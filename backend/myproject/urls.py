from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Volunteer API 
    path('api/volunteers/', include(('volunteers.urls', 'volunteers'), namespace='volunteers')),

    # Admin API
    path('api/admin/', include(('admin_api.urls', 'admin_api'), namespace='admin_api')),

    # Auth API
    path('api/auth/', include('accounts.urls')),

    # Admin Events (Creating, Deleting, Editing)
    path('api/', include('events.urls')),
]