import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateRoomUtil.css';

const CreateRoomUtil = () => {
  // Define state variables
  const [selectedRoom, setSelectedRoom] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [collegeDepartment, setCollegeDepartment] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [section, setSection] = useState('');
  const [appointmentDuration, setAppointmentDuration] = useState('30 minutes');
  const [availabilityOption, setAvailabilityOption] = useState('doesNotRepeat');
  const [customDuration, setCustomDuration] = useState('');
  const [customDurationUnit, setCustomDurationUnit] = useState('minutes');
  const [customAvailability, setCustomAvailability] = useState('');
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  // Data options
  const [roomOptions, setRoomOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [yearLevelOptions, setYearLevelOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState({ rooms: false, departments: false, sections: false, courses: false });
  const [error, setError] = useState(null);

  // Generic fetch function
  const fetchData = async (url, setData, loadingKey) => {
    setLoading((prev) => ({ ...prev, [loadingKey]: true }));
    setError(null);
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      console.error(`Error fetching ${loadingKey}:`, err);
      setError(`Failed to load ${loadingKey}`);
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData('http://localhost:8000/api/rooms', setRoomOptions, 'rooms');
    fetchData('http://localhost:8000/api/courses', (data) =>
      setDepartmentOptions([...new Set(data.map(course => course.department))]), 'departments'
    );
    fetchData('http://localhost:8000/api/sections', (data) => {
      setYearLevelOptions([...new Set(data.map(section => section.year_level))]);
      setSectionOptions(data);
    }, 'sections');
  }, []);

  // Fetch courses based on room number, year level, and department
  useEffect(() => {
    if (selectedRoom && yearLevel && collegeDepartment) {
      const fetchCourses = async () => {
        setLoading((prev) => ({ ...prev, courses: true }));
        try {
          const response = await axios.get('http://localhost:8000/api/get_courses_by_room/', {
            params: { room_number: selectedRoom, year_level: yearLevel, college_department: collegeDepartment },
          });
          setSubjectOptions(response.data);
        } catch (err) {
          console.error('Error fetching course data:', err);
          setError('Failed to load courses');
        } finally {
          setLoading((prev) => ({ ...prev, courses: false }));
        }
      };
      fetchCourses();
    } else {
      setSubjectOptions([]);
    }
  }, [selectedRoom, yearLevel, collegeDepartment]);

  const handleDropdownChange = (setter) => (event) => {
    setter(event.target.value);
    setSubjectOptions([]);
    setSubjectName('');
  };

  const handleCustomSave = (setter, input, validationMsg, closeModal) => {
    if (input.trim()) {
      setter(input);
      closeModal();
    } else {
      alert(validationMsg);
    }
  };

  return (
    <div className="room-utilization">
      <div className="sidebar">
        <h3>Room Utilization Settings</h3>

        {/* Dropdown Sections */}
        {[
          { label: 'Room Name', value: selectedRoom, options: roomOptions, onChange: handleDropdownChange(setSelectedRoom) },
          { label: 'Department', value: collegeDepartment, options: departmentOptions, onChange: handleDropdownChange(setCollegeDepartment) },
          { label: 'Year Level', value: yearLevel, options: yearLevelOptions, onChange: handleDropdownChange(setYearLevel) },
          { label: 'Section Name', value: section, options: sectionOptions, onChange: handleDropdownChange(setSection) },
        ].map(({ label, value, options, onChange }, index) => (
          <div className="section" key={index}>
            <label>{label}:</label>
            <select value={value} onChange={onChange}>
              <option value="">Select {label}</option>
              {options.map((option, i) => (
                <option key={i} value={option.room_number || option.year_level || option.name || option}>
                  {option.room_number ? `${option.room_number} - ${option.room_type}` : option.name || option}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Subject (Course) Name Section */}
        <div className="section">
          <label>Subject (Course) Name:</label>
          <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)}>
            <option value="">Select a course</option>
            {subjectOptions.map((course) => (
              <option key={course.course_id} value={course.course_name}>{course.course_name}</option>
            ))}
          </select>
        </div>

        {/* Appointment Duration Section */}
        <div className="section">
          <label>Appointment Duration:</label>
          <select value={appointmentDuration} onChange={(e) => e.target.value === 'custom' ? setIsDurationModalOpen(true) : setAppointmentDuration(e.target.value)}>
            <option value="15 minutes">15 minutes</option>
            <option value="30 minutes">30 minutes</option>
            <option value="1 hour">1 hour</option>
            <option value="1.5 hours">1.5 hours</option>
            <option value="2 hours">2 hours</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* General Availability Section */}
        <div className="section">
          <label>General Availability:</label>
          <select value={availabilityOption} onChange={(e) => e.target.value === 'custom' ? setIsAvailabilityModalOpen(true) : setAvailabilityOption(e.target.value)}>
            <option value="doesNotRepeat">Does not repeat</option>
            <option value="repeatWeekly">Repeat weekly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Custom Duration Modal */}
      {isDurationModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Select Custom Appointment Duration</h4>
            <input type="number" value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} placeholder="Enter duration" min="1" />
            <select value={customDurationUnit} onChange={(e) => setCustomDurationUnit(e.target.value)}>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
            <button onClick={() => handleCustomSave(setAppointmentDuration, `${customDuration} ${customDurationUnit}`, "Please enter a valid custom duration.", () => setIsDurationModalOpen(false))}>Save Duration</button>
          </div>
        </div>
      )}

      {/* Custom Availability Modal */}
      {isAvailabilityModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Enter Custom Availability</h4>
            <input type="text" value={customAvailability} onChange={(e) => setCustomAvailability(e.target.value)} placeholder="Enter custom availability" />
            <button onClick={() => handleCustomSave(setAvailabilityOption, customAvailability, "Please enter valid availability.", () => setIsAvailabilityModalOpen(false))}>Save Availability</button>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CreateRoomUtil;
