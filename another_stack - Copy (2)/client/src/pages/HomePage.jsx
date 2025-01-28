// src/pages/HomePage.js
import React, { useState } from 'react';
import Register from '../components/Register';
import Login from '../components/Login';

const HomePage = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const toggleRegister = () => {
    setShowRegister(true);
    setShowSignIn(false);
  };

  const toggleSignIn = () => {
    setShowSignIn(true);
    setShowRegister(false);
  };

  const closeForm = () => {
    setShowRegister(false);
    setShowSignIn(false);
  };

  return (
    <div className="homepage">
      <h1>Welcome to Stack Overflow</h1>
      <div className="button-group">
        <button onClick={toggleRegister}>Register</button>
        <button onClick={toggleSignIn}>Sign In</button>
      </div>
      {showRegister && <Register closeForm={closeForm} />}
      {showSignIn && <Login closeForm={closeForm} />}
    </div>
  );
};

export default HomePage;
