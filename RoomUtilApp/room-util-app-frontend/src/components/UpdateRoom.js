import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';
import './UpdateRoom.css';

const UpdateRoom = ({ room, onUpdateComplete }) => {
    const [roomData, setRoomData] = useState({
        room_id: '',
        room_number: '',
        room_type: '',
        building_name: '',
        campus_name: '',
    });
    const [availabilityDays, setAvailabilityDays] = useState([]);
    const [message, setMessage] = useState('');

    const campusOptions = [
        { id: 1, name: "CTU Dumanjug Extension" },
        { id: 2, name: "CTU Bitoon" },
    ];
    const buildingOptions = [
        { id: 1, name: "COED" },
        { id: 2, name: "COE" },
        { id: 3, name: "COT" },
        { id: 4, name: "COMGENT" },
    ];

    useEffect(() => {
        if (room) {
            setRoomData({
                room_id: room.room_id,
                room_number: room.room_number,
                room_type: room.room_type,
                building_name: room.building.building_name,
                campus_name: room.building.campus.campus_name,
            });
            const initialDays = room.availability_days.map((day, index) => ({
                date: new Date(day),
                times: Array.isArray(room.availability_times[index]) ? room.availability_times[index] : [{ start: '', end: '' }]
            }));
            setAvailabilityDays(initialDays.length ? initialDays : [{ date: null, times: [{ start: '', end: '' }] }]);
        }
    }, [room]);

    const handleRoomDataChange = (field, value) => {
        setRoomData((prevData) => ({ ...prevData, [field]: value }));
    };

    const handleDateChange = (date, index) => {
        const updatedDays = [...availabilityDays];
        updatedDays[index].date = date;
        setAvailabilityDays(updatedDays);
    };

    const handleTimeChange = (time, index, timeIndex, field) => {
        const updatedDays = [...availabilityDays];
        updatedDays[index].times[timeIndex][field] = time;
        setAvailabilityDays(updatedDays);
    };

    const addAvailabilitySlot = (index) => {
        const updatedDays = [...availabilityDays];
        updatedDays[index].times.push({ start: '', end: '' });
        setAvailabilityDays(updatedDays);
    };

    const deleteTimeSlot = (index, timeIndex) => {
        const updatedDays = [...availabilityDays];
        updatedDays[index].times.splice(timeIndex, 1);
        setAvailabilityDays(updatedDays);
    };

    const addDateSlot = () => {
        setAvailabilityDays([...availabilityDays, { date: null, times: [{ start: '', end: '' }] }]);
    };

    const deleteDateSlot = (index) => {
        const updatedDays = [...availabilityDays];
        updatedDays.splice(index, 1);
        setAvailabilityDays(updatedDays);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.put(`http://localhost:8000/api/rooms/${roomData.room_id}/`, {
                ...roomData,
                availability_days: availabilityDays.map(day => day.date),
                availability_times: availabilityDays.map(day => day.times),
                building: {
                    building_name: roomData.building_name,
                    campus: { campus_name: roomData.campus_name },
                },
            });
            setMessage('Room updated successfully!');
            onUpdateComplete();
        } catch (error) {
            console.error('Error updating room:', error);
            setMessage('Error updating room. Please try again.');
        }
    };

    return (
        <form className="update-room-form" onSubmit={handleSubmit}>
            <h2>Update Room</h2>
        
            <div className="form-row">
                <label>Room Number</label>
                <input
                    type="text"
                    value={roomData.room_number || ''}
                    onChange={(e) => handleRoomDataChange('room_number', e.target.value)}
                    required
                />
            </div>
        
            <div className="form-row">
                <label>Room Type</label>
                <input
                    type="text"
                    value={roomData.room_type || ''}
                    onChange={(e) => handleRoomDataChange('room_type', e.target.value)}
                    required
                />
            </div>
        
            <div className="form-row">
                <label>Building Name</label>
                <select
                    value={roomData.building_name || ''}
                    onChange={(e) => handleRoomDataChange('building_name', e.target.value)}
                    required
                >
                    <option value="">Select Building</option>
                    {buildingOptions.map((building) => (
                        <option key={building.id} value={building.name}>{building.name}</option>
                    ))}
                </select>
            </div>
        
            <div className="form-row">
                <label>Campus Name (Optional)</label>
                <select
                    value={roomData.campus_name || ''}
                    onChange={(e) => handleRoomDataChange('campus_name', e.target.value)}
                >
                    <option value="">Select Campus</option>
                    {campusOptions.map((campus) => (
                        <option key={campus.id} value={campus.name}>{campus.name}</option>
                    ))}
                </select>
            </div>
        
            <h3>Availability Schedule</h3>
            {availabilityDays.map((day, index) => (
                <div key={index} className="availability-section">
                    <label>Availability Date:</label>
                    <DatePicker
                        selected={day.date}
                        onChange={(date) => handleDateChange(date, index)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select a date"
                    />
                    {day.times.map((time, timeIndex) => (
                        <div key={timeIndex} className="time-slot">
                            <label>Start Time:</label>
                            <TimePicker
                                onChange={(time) => handleTimeChange(time, index, timeIndex, 'start')}
                                value={time.start}
                                disableClock
                                clearIcon={null}
                                format="h:mm a"
                            />
                            <label>End Time:</label>
                            <TimePicker
                                onChange={(time) => handleTimeChange(time, index, timeIndex, 'end')}
                                value={time.end}
                                disableClock
                                clearIcon={null}
                                format="h:mm a"
                            />
                            <button 
                                type="button" 
                                onClick={() => deleteTimeSlot(index, timeIndex)} 
                                className="delete-time-slot-btn"
                            >
                                Delete Time Slot
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addAvailabilitySlot(index)} className="add-time-slot-btn">Add Time Slot</button>
                    <button 
                        type="button" 
                        onClick={() => deleteDateSlot(index)} 
                        className="delete-date-btn"
                    >
                        Delete Date
                    </button>
                </div>
            ))}
            <button type="button" onClick={addDateSlot} className="add-date-btn">Add Date Slot</button>
        
            <div className="submit-button-container">
                <button type="submit" className="submit-btn">Update Room</button>
            </div>
        
            {message && <p className="message">{message}</p>}
        </form>
    );
};

export default UpdateRoom;
