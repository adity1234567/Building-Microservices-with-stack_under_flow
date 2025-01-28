// src/components/PostDetailsModal.js
import React from 'react';

const PostDetailsModal = ({ post, codeContent, fileContent, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{post.title}</h2>
        <p><strong>Posted by:</strong> {post.author?.username || "Anonymous"}</p>
        {post.language && <p><strong>Language:</strong> {post.language}</p>}
        {codeContent && (
          <div>
            <h4>Code Snippet:</h4>
            <pre>{codeContent}</pre>
          </div>
        )}
        {fileContent && (
          <div>
            <h4>Uploaded File Content:</h4>
            <pre>{fileContent}</pre>
          </div>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PostDetailsModal;
