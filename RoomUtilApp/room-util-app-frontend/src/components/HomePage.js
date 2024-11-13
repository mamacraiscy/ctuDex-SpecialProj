import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const handleSearch = () => {
        navigate('/search');
    };

    const handleUpdate = () => {
        navigate('/update');
    };

    const handleCreate = () => {
        navigate('/create');
    };


    return (
        <div className="homepage">
            <h1>Welcome to Room Utilization</h1>
            <div className="actions">
                <button onClick={handleSearch}>Search Room</button>
                <button onClick={handleUpdate}>Update Room</button>
                <button onClick={handleCreate}>Create Room Util</button>
            </div>
        </div>
    );
};

export default HomePage;
