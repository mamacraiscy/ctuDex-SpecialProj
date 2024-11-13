import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateRoom from './UpdateRoom'; // Import UpdateRoom
import './SearchRoom.css'; // Import the CSS file

const buildingNameMapping = {
    COED: 'Education Building',
    COE: 'Engineering Building',
    COT: 'Technology Building',
    COMGENT: 'HM Building',
};

const SearchRoom = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('roomNumber');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchClicked, setSearchClicked] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedDays, setSelectedDays] = useState(''); // State for selected days
    const [selectedTimes, setSelectedTimes] = useState(''); // State for selected times

    useEffect(() => {
        axios.get('http://localhost:8000/api/rooms/')
            .then(response => {
                console.log(response.data);
                setRooms(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the room data!', error);
            });
    }, []);
    
    const handleFilterChange = (e) => {
        setSelectedFilter(e.target.value);
        setSearchClicked(false);
        setMessage('');
        // Clear selection states when filter changes
        setSelectedDays('');
        setSelectedTimes('');
    };

    const handleClear = () => {
        setSearchTerm('');
        setSearchClicked(false);
        setMessage('');
        setSelectedRoom(null);
        // Clear selection states on clear
        setSelectedDays('');
        setSelectedTimes('');
    };

    const handleSearch = () => {
        // Logic to handle search based on selected filter
        // If using availabilityDays or availabilityTimes, no need for searchTerm
        if (selectedFilter === 'availabilityDays' || selectedFilter === 'availabilityTimes') {
            // Use selectedDays or selectedTimes in your filtering logic
            setSearchClicked(true);
            setMessage('');
        } else {
            if (searchTerm.trim() !== '') {
                setSearchClicked(true);
                setMessage('');
            } else {
                setSearchClicked(false);
                setMessage('Please enter a search term.');
            }
        }
    };

    const getFullBuildingName = (abbreviation) => {
        return buildingNameMapping[abbreviation] || abbreviation;
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12; // Convert to 12-hour format
        return `${formattedHour}:${minutes} ${period}`;
    };

    const formatAvailabilityTimes = (availability) => {
        if (!Array.isArray(availability)) return '';
        return availability.map(slot => 
            slot.map(time => `${formatTime(time.start)} to ${formatTime(time.end)}`).join(', ')
        ).join(' | '); // Join different slots with ' | '
    };

    const formatDayWithDate = (dateString) => {
        const date = new Date(dateString);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
        return `${dayName} (${formattedDate})`;
    };

    const filteredRooms = searchClicked && (searchTerm.trim() || selectedDays || selectedTimes) ? rooms.filter(room => {
        const fullBuildingName = getFullBuildingName(room.building.building_name).toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        switch (selectedFilter) {
            case 'roomNumber':
                return room.room_number.toLowerCase().includes(searchLower);
            case 'roomType':
                return room.room_type.toLowerCase().includes(searchLower);
            case 'buildingName':
                return room.building.building_name.toLowerCase().includes(searchLower) || fullBuildingName.includes(searchLower);
            case 'availabilityTimes':
                return Array.isArray(room.availability_times) && room.availability_times.some(slot =>
                    slot.some(time => time.start.includes(selectedTimes) || time.end.includes(selectedTimes)) // Match against the selected time
                );
            case 'availabilityDays':
                return Array.isArray(room.availability_days) && room.availability_days.some(day =>
                    typeof day === 'string' && day.toLowerCase().includes(selectedDays.toLowerCase())
                );
            default:
                return false;
        }
    }) : [];

    const handleEditClick = (room) => {
        setSelectedRoom(room);
    };

    return (
        <div className="room-search">
            <h1>Room Search</h1>
            <div className="filter-container">
                <select className="dropdown" onChange={handleFilterChange} value={selectedFilter}>
                    <option value="roomNumber">Filter by Room Number</option>
                    <option value="roomType">Filter by Room Type</option>
                    <option value="buildingName">Filter by Building Name</option>
                    <option value="availabilityTimes">Filter by Times Available</option>
                    <option value="availabilityDays">Filter by Days Available</option>
                </select>
                
                {(selectedFilter === 'roomNumber' || selectedFilter === 'roomType' || selectedFilter === 'buildingName') && (
                    <input
                        className="search-input"
                        type="text"
                        placeholder={`Search by ${selectedFilter.replace(/([A-Z])/g, ' $1')}`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyPress={e => { if (e.key === 'Enter') handleSearch(); }}
                    />
                )}

                {/* Date and Time Pickers for Available Days and Times */}
                {selectedFilter === 'availabilityDays' && (
                    <input
                        type="date"
                        value={selectedDays}
                        onChange={e => setSelectedDays(e.target.value)}
                    />
                )}
                {selectedFilter === 'availabilityTimes' && (
                    <input
                        type="time"
                        value={selectedTimes}
                        onChange={e => setSelectedTimes(e.target.value)}
                    />
                )}
                
                <button className="search-button" onClick={handleSearch}>Search</button>
                <button className="clear-button" onClick={handleClear}>Clear</button>
            </div>
            {message && (
                <div className="message">
                    <p>{message}</p>
                </div>
            )}
            {searchClicked && (searchTerm.trim() || selectedDays || selectedTimes) && filteredRooms.length > 0 && (
                <div className="results-container">
                    <table className="room-table">
                        <thead>
                            <tr>
                                <th>Campus Name</th>
                                <th>Building Name</th>
                                <th>Room Number</th>
                                <th>Room Type</th>
                                <th>Availability Days</th>
                                <th>Availability Times</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.map(room => (
                                <tr key={room.room_id}>
                                    <td>{room.building.campus ? room.building.campus.campus_name : 'N/A'}</td>
                                    <td>{getFullBuildingName(room.building.building_name)}</td>
                                    <td>{room.room_number}</td>
                                    <td>{room.room_type}</td>
                                    <td>
                                        {Array.isArray(room.availability_days) ? 
                                            room.availability_days.map(formatDayWithDate).join(', ') 
                                            : 'N/A'}
                                    </td> {/* Updated */}
                                    <td>{formatAvailabilityTimes(room.availability_times)}</td>
                                    <td>
                                        <button onClick={() => handleEditClick(room)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedRoom && (
                <UpdateRoom room={selectedRoom} onUpdateComplete={() => setSelectedRoom(null)} />
            )}
            {searchClicked && (searchTerm.trim() || selectedDays || selectedTimes) && filteredRooms.length === 0 && (
                <div className="results-container">
                    <p>No results found</p>
                </div>
            )}
        </div>
    );
};

export default SearchRoom;
