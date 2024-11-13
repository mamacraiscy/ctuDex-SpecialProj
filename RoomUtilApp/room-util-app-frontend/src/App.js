import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchRoom from './components/SearchRoom';
import UpdateRoom from './components/UpdateRoom';
import './App.css';
import CreateRoomUtil from './components/CreateRoomUtil';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Room Utilization</h1>
                </header>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchRoom />} />
                    <Route path="/update" element={<UpdateRoom />} />
                    <Route path="/create" element={<CreateRoomUtil />} /> {/* Route for CreateRoom */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
