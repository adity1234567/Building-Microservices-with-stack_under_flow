import React, { useState } from 'react';
import API from '../api';

const Login = ({ closeForm }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear previous error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', formData); // Debugging log

      const { data } = await API.post('/auth/login', {
        username: formData.username,
        password: formData.password,
      });

      console.log('Login successful, received token:', data.token);

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', formData.username);
      alert('Login successful');
      window.location.href = '/dashboard';
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Invalid username or password');
      } else {
        setError('Server error. Please try again later.');
      }
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={formData.username}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Login</button>
          <button type="button" className="close-btn" onClick={closeForm}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
