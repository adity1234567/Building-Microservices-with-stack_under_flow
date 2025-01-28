// src/components/PostList.js
import React, { useState } from 'react';
import API from '../api';
import '../styles/PostList.css';

const PostList = ({ posts }) => {
  const [expandedPost, setExpandedPost] = useState(null);

  const handleViewPost = async (post) => {
    try {
      if (expandedPost && expandedPost._id === post._id) {
        // If the clicked post is already expanded, collapse it
        setExpandedPost(null);
      } else {
        // Fetch post details from backend and expand the post
        const { data } = await API.get(`/posts/${post._id}`);
        alert("data", data);
        setExpandedPost(data);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  return (
    <div>
      <h2>Recent Posts</h2>
      {posts.map(post => (
        <div key={post._id} className="post-container">
          <h3>{post.title}</h3>
          <p>Posted by: {post.author?.author || "Anonymous"}</p>
          <button
            className="view-post-button"
            onClick={() => handleViewPost(post)}
          >
            {expandedPost && expandedPost.post._id === post._id ? "Hide Post" : "View Post"}
          </button>

          {/* Display expanded post details if this post is selected */}
          {expandedPost && expandedPost.post._id === post._id && (
            <div className="post-details">
              <h4>Post Details</h4>
              <p><strong>Language:</strong> {expandedPost.post.language || 'N/A'}</p>
              
              {/* Display code snippet content if available */}
              {expandedPost.codeContent && (
                <div>
                  <strong>Code Snippet:</strong>
                  <pre>{expandedPost.codeContent}</pre>
                </div>
              )}

              {/* Display uploaded file content if available */}
              {expandedPost.uploadedFileContent && (
                <div>
                  <strong>Uploaded File Content:</strong>
                  <pre>{expandedPost.uploadedFileContent}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostList;