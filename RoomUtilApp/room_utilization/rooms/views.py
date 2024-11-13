from rest_framework import viewsets
from .models import Room, Course, Building, Campus, Section
from .serializers import RoomSerializer, CourseSerializer, SectionSerializer
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
import json
from django.forms.models import model_to_dict

# Home view
def home(request):
    return HttpResponse("<h1>Welcome to the Room Utilization API</h1><p>Visit <a href='/api/rooms/'>/api/rooms/</a> to access the rooms API.</p>")

# Room ViewSet
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        building_name = self.request.query_params.get('building_name', None)
        room_number = self.request.query_params.get('room_number', None)
        room_type = self.request.query_params.get('room_type', None)

        if building_name:
            queryset = queryset.filter(building__building_name__icontains=building_name)
        if room_number:
            queryset = queryset.filter(room_number__icontains=room_number)
        if room_type:
            queryset = queryset.filter(room_type__icontains=room_type)
        return queryset

# Course ViewSet
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        program_id = self.request.query_params.get('program_id', None)
        course_name = self.request.query_params.get('course_name', None)

        if program_id:
            program_ids = [int(pid) for pid in program_id.split(',')]
            queryset = queryset.filter(program_id__in=program_ids).order_by('course_name')

        if course_name:
            queryset = queryset.filter(course_name__icontains=course_name)

        return queryset

# Section ViewSet
class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        program_id = self.request.query_params.get('program_id', None)
        year_level = self.request.query_params.get('year_level', None)

        if program_id:
            program_ids = [int(pid) for pid in program_id.split(',')]
            queryset = queryset.filter(program_id__in=program_ids)

        if year_level:
            queryset = queryset.filter(year_level=year_level)

        return queryset

@require_http_methods(["PUT"])
def update_room(request, room_id):
    room = get_object_or_404(Room, pk=room_id)
    data = json.loads(request.body.decode('utf-8'))

    room.room_number = data.get('room_number', room.room_number)
    room.room_type = data.get('room_type', room.room_type)
    room.availability_days = data.get('availability_days', room.availability_days)
    room.availability_times = data.get('availability_times', room.availability_times)

    building_data = data.get('building', {})
    campus_data = building_data.get('campus', {})

    if 'building_name' in building_data:
        building_name = building_data['building_name']
        building = get_object_or_404(Building, building_name=building_name)
        room.building = building

    if 'campus_name' in campus_data:
        campus_name = campus_data['campus_name']
        campus = get_object_or_404(Campus, campus_name=campus_name)
        room.building.campus = campus

    room.save()

    return JsonResponse({'status': 'success', 'room': model_to_dict(room)})


# Function to retrieve courses based on room number and year level
def get_courses_by_room(request):
    room_number = request.GET.get('room_number')

    try:
        # Step 1: Get the room and its building ID
        room = Room.objects.get(room_number=room_number)
        building_id = room.building.building_id  # Get building_id from the room's building

        print("Room:", room)  # Debugging step
        print("Building ID:", building_id)

        # Step 2: Map building_id to program_ids (your prioritization logic)
        if building_id == 1:
            program_ids = [1, 2]
        elif building_id == 2:
            program_ids = [3, 4, 5]
        elif building_id == 3:
            program_ids = [6, 7]
        elif building_id == 4:
            program_ids = [8]
        else:
            return JsonResponse({"error": "Building ID not recognized"}, status=400)

        print("Program IDs:", program_ids)

        # Step 3: Retrieve courses based on the program_ids
        courses = Course.objects.filter(
            program_id__in=program_ids
        ).order_by('course_name')  # Prioritize courses by course_name

        print("Courses:", courses)  # Debugging step

        # Step 4: Serialize and return the courses
        courses_data = list(courses.values())
        return JsonResponse(courses_data, safe=False)
    
    except Room.DoesNotExist:
        return JsonResponse({"error": "Room not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
