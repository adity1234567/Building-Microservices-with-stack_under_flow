import React, { useState } from 'react';
import API from '../api';
import '../styles/PostForm.css';

const PostForm = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    codeSnippet: '',
    language: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  // Handle text input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title.trim());
    if (formData.codeSnippet) formDataObj.append('codeSnippet', formData.codeSnippet);
    if (formData.language) formDataObj.append('language', formData.language);
    if (file) formDataObj.append('file', file);

    try {
      const response = await API.post('/posts/create', formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 || response.status === 200) {
        // Reset form after successful submission
        setFormData({
          title: '',
          codeSnippet: '',
          language: '',
        });
        setFile(null);
        e.target.reset(); // Reset form including file input
        alert('Post created successfully');
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
      } else {
        setError(error.response?.data?.message || 'An error occurred while creating the post.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <h2>Create Post</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Post Title</label>
        <input
          id="title"
          name="title"
          placeholder="Post Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="codeSnippet">Code Snippet</label>
        <textarea
          id="codeSnippet"
          name="codeSnippet"
          placeholder="Code Snippet"
          value={formData.codeSnippet}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="language">Language</label>
        <select 
          id="language"
          name="language" 
          value={formData.language} 
          onChange={handleChange}
        >
          <option value="">Select Language</option>
          <option value="javascript">JavaScript</option>
          <option value="dart">Dart</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="file">File</label>
        <input 
          id="file"
          type="file" 
          onChange={handleFileChange} 
        />
      </div>

      <div className="button-group">
        <button type="submit">Post</button>
        <button type="button" onClick={onPostCreated}>Back</button>
      </div>
    </form>
  );
};

export default PostForm;
