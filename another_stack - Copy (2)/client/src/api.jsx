import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost/api',
  withCredentials: true,
});

// Attach token from local storage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || JSON.stringify(error.response.data);
      console.error(`API Error: ${error.response.status} - ${message}`);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
