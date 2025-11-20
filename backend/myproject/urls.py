#myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # volunteer API routes
    path('api/volunteers/', include('volunteers.urls', namespace='volunteers')),

    # auth API
    path('api/auth/', include('accounts.urls')),
]
