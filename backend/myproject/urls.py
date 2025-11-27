from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Volunteer API routes
    path('api/volunteers/', include(('volunteers.urls', 'volunteers'), namespace='volunteers')),

    # Admin API routes
    path('api/admin/', include(('admin_api.urls', 'admin_api'), namespace='admin_api')),

    # Auth API
    path('api/auth/', include('accounts.urls')),
    path('api/', include('events.urls')),
]
