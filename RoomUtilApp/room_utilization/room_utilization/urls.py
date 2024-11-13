# room_utilization/urls.py

from django.urls import path, include
from rooms.views import RoomViewSet, home  # Import the home view
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('', home, name='home'),  # This will serve the home page
    path('api/', include('rooms.urls')),  # Reference to the app's urls.py
    # path('api/', include(router.urls)),  # This includes the API URLs
]
