import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Updated import
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import './styles/Form.css'; 
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>  
        <Route path="/" element={<HomePage />} />  {/* Changed from component to element */}
        <Route path="/dashboard" element={<Dashboard />} />  {/* Changed from component to element */}
      </Routes>
    </Router>
  );
}

export default App;
