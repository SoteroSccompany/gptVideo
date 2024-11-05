import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import VideoChat from './components/VideoChat';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/${uuidv4()}`} />} />
        <Route path="/:roomId" element={<VideoChat />} />
      </Routes>
    </Router>
  );
}

export default App;
