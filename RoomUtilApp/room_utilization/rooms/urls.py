from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, update_room, CourseViewSet, get_courses_by_room, SectionViewSet

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'sections', SectionViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('rooms/<int:room_id>/', update_room, name='update_room'),  # Custom update endpoint for rooms
    path('get_courses_by_room/', get_courses_by_room, name='get_courses_by_room'),  # New endpoint for course prioritization
]
