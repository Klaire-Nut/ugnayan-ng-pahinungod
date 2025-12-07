from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # 1️⃣ Volunteer API (PUT FIRST)
    path('api/volunteers/', include(('volunteers.urls', 'volunteers'), namespace='volunteers')),

    # 2️⃣ Admin API
    path('api/admin/', include(('admin_api.urls', 'admin_api'), namespace='admin_api')),

    # 3️⃣ Auth API
    path('api/auth/', include('accounts.urls')),

    # 4️⃣ Events API (PUT LAST - catch-all)
    path('api/', include('events.urls')),

    # Admin Events (Creating, Deleting, Editing)
    path('api/', include('events.urls')),
]
