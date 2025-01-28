import React, { useState } from 'react';
import API from '../api';

const Register = ({ closeForm }) => {


  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      const { username, email, password } = formData;

      // Sending registration data to the backend
      const response = await API.post('/auth/register', { username, email, password });
      const { token } = response.data;

      if (token) {
        // Store token and username locally
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Registration succeeded but no token received. Please log in.');
      }
    } catch (error) {
      console.error('Error in registration:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="text"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <button type="submit">Sign Up</button>
          <button type="button" className="close-btn" onClick={closeForm}>Close</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
