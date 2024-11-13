from rest_framework import serializers
from .models import Room, Building, Campus, Course, Section

class CampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campus
        fields = ['campus_id', 'campus_name', 'address']
        extra_kwargs = {
            'campus_id': {'required': False},  # Make campus_id optional
            'campus_name': {'required': False},  # Make campus_name optional
            'address': {'required': False},  # Make address optional
        }

class BuildingSerializer(serializers.ModelSerializer):
    campus = CampusSerializer()  # Allow campus to be updated as well

    class Meta:
        model = Building
        fields = ['building_id', 'building_name', 'campus']
        extra_kwargs = {
            'building_id': {'required': False},  # Make building_id optional
            'building_name': {'required': True},  # Make building_name required
        }

    def update(self, instance, validated_data):
        campus_data = validated_data.pop('campus', None)
        instance.building_name = validated_data.get('building_name', instance.building_name)
        instance.save()

        if campus_data:
            campus_serializer = CampusSerializer(instance.campus, data=campus_data)
            if campus_serializer.is_valid():
                campus_serializer.save()
            else:
                raise serializers.ValidationError(campus_serializer.errors)

        return instance

class RoomSerializer(serializers.ModelSerializer):
    building = BuildingSerializer()  # Allow building to be updated as well

    class Meta:
        model = Room
        fields = ['room_id', 'room_number', 'room_type', 'availability_days', 'availability_times', 'building']
        extra_kwargs = {
            'room_id': {'required': False},  # Make room_id optional
            'room_number': {'required': True},  # Make room_number required
            'room_type': {'required': True},  # Make room_type required
            'availability_days': {'required': False},  # Make availability_days optional
            'availability_times': {'required': False},  # Make availability_times optional
        }

    def update(self, instance, validated_data):
        building_data = validated_data.pop('building', None)
        instance.room_number = validated_data.get('room_number', instance.room_number)
        instance.room_type = validated_data.get('room_type', instance.room_type)
        instance.availability_days = validated_data.get('availability_days', instance.availability_days)
        instance.availability_times = validated_data.get('availability_times', instance.availability_times)

        if building_data:
            building_serializer = BuildingSerializer(instance.building, data=building_data)
            if building_serializer.is_valid():
                building_serializer.save()
            else:
                raise serializers.ValidationError(building_serializer.errors)

        instance.save()
        return instance

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'  # or specify specific fields you want

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['section_id', 'program', 'program_code', 'year_level', 'section_name', 'shift']  # Include the new fields