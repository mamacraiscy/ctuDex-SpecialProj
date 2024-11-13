from django.db import models

class Campus(models.Model):
    campus_id = models.IntegerField(primary_key=True)
    campus_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)

    class Meta:
        db_table = 'campus'

    def __str__(self):
        return self.campus_name


class Building(models.Model):
    building_id = models.IntegerField(primary_key=True)
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)  # Link to the Campus model
    building_name = models.CharField(max_length=255)

    class Meta:
        db_table = 'building'

    def __str__(self):
        return self.building_name


class Room(models.Model):
    room_id = models.IntegerField(primary_key=True)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)  # Room is linked to Building, which links to Campus
    room_number = models.CharField(max_length=255)
    room_type = models.CharField(max_length=255)
    availability_days = models.JSONField()
    availability_times = models.JSONField()

    class Meta:
        db_table = 'room'

    def __str__(self):
        return f'Room {self.room_number} ({self.room_type})'

class Course(models.Model):
    course_id = models.AutoField(primary_key=True)  # Auto-incrementing ID
    instructor_id = models.IntegerField()  # Integer field for instructor ID
    program_id = models.IntegerField()  # Integer field for program ID
    course_code = models.CharField(max_length=255)
    course_name = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    credit_hours = models.IntegerField()
    prerequisites = models.JSONField()  # Using JSONField for storing prerequisites
    school_year = models.CharField(max_length=255)
    semester = models.IntegerField()

    def __str__(self):
        return f'{self.course_name} ({self.course_code})'

    class Meta:
        db_table = 'course'

# rooms/models.py

from django.db import models

class Section(models.Model):
    section_id = models.AutoField(primary_key=True)
    program = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='sections')  # Linking to Course model via program_id
    program_code = models.CharField(max_length=255)
    year_level = models.IntegerField()
    section_name = models.CharField(max_length=255)
    shift = models.IntegerField()  # For example, 1 for AM, 2 for PM, etc.

    def __str__(self):
        return f"{self.section_name} - {self.year_level} ({self.program_code})"
    
    class Meta:
        db_table = 'section'  # Explicitly set the table name
