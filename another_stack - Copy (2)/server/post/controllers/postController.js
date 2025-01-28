/*const Post = require('../models/Post');
//const User = require('../models/User');
//const Notification = require('../models/Notification');
const minioClient = require('../config/minio'); // Corrected path
const { v4: uuidv4 } = require('uuid');
const streamToString = require('stream-to-string'); // Ensure this is installed by running: npm install stream-to-string
const axios = require('axios');

exports.createPost = async (req, res) => {
  const { title, codeSnippet, language } = req.body;
  const file = req.file;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    let codeFileUrl = null;
    let uploadedFileUrl = null;

    // Ensure the token is available
    if (!req.headers.authorization) {
      console.error('Authorization header is missing');
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      console.error('Token is missing in the Authorization header');
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    // Use token to get the user profile
    const userResponse = await axios.get('http://localhost:8000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = userResponse.data;
    if (!user) {
      console.error('User not found with the provided token');
      return res.status(404).json({ message: 'User not found' });
    }

    if (codeSnippet) {
      const codeFileName = `${uuidv4()}.${language || 'txt'}`;
      await minioClient.putObject(
        process.env.MINIO_BUCKET,
        codeFileName,
        Buffer.from(codeSnippet),
        { 'Content-Type': 'text/plain' }
      );
      codeFileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${codeFileName}`;
    }

    if (file) {
      const uploadedFileName = `${uuidv4()}_${file.originalname}`;
      await minioClient.putObject(
        process.env.MINIO_BUCKET,
        uploadedFileName,
        file.buffer
      );
      uploadedFileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${uploadedFileName}`;
    }

    // Corrected axios request to get author data
    const authorResponse = await axios.get('http://localhost:8000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const author = authorResponse.data;
    if (!author) {
      console.error('Author not found with the provided token');
      return res.status(400).json({ error: 'Author not found' });
    }

    const post = new Post({
      title,
      language: language || null,
      codeFileUrl,
      uploadedFileUrl,
      author: user._id, // Use user._id from the response
    });
    console.log("Author:", author); // Log the author for debugging
    console.log("Post:", post); // Log the post for debugging
    await post.save();

    const otherUsersResponse = await axios.get('http://localhost:8000/api/users');
    const otherUsers = otherUsersResponse.data.filter(u => u._id !== user._id);
    const notifications = otherUsers.map((u) => ({
      userId: u._id,
      postId: post._id,
      read: false,
    }));

    await axios.post('http://localhost:8000/api/notifications', notifications);

    // Emit notification to clients
    const io = req.app.get('io'); // Ensure io is set in the app
    if (io) {
      io.emit('newPostNotification', {
        postId: post._id,
        title: post.title,
        authorUsername: author.username, // Use author.username from the response
      });
    } else {
      console.error('Socket.IO instance not found in app');
    }

    res.status(201).json(post);
  } catch (error) {
    console.error("Error in createPost:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    res.json(posts);
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Function to get a specific post by ID, including file content from MinIO
exports.getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate('author', 'username');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let codeContent = null;
    let uploadedFileContent = null;

    // Retrieve code file content if available
    if (post.codeFileUrl) {
      const codeFileName = post.codeFileUrl.split('/').pop();
      const codeFileStream = await minioClient.getObject(process.env.MINIO_BUCKET, codeFileName);
      codeContent = await streamToString(codeFileStream);
    }

    // Retrieve uploaded file content if available
    if (post.uploadedFileUrl) {
      const uploadedFileName = post.uploadedFileUrl.split('/').pop();
      const uploadedFileStream = await minioClient.getObject(process.env.MINIO_BUCKET, uploadedFileName);
      uploadedFileContent = await streamToString(uploadedFileStream);
    }

    res.json({
      post,
      codeContent,
      uploadedFileContent,
    });
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ error: error.message });
  }
};*/

const Post = require('../models/Post');
const minioClient = require('../config/minio');
const { v4: uuidv4 } = require('uuid');
const streamToString = require('stream-to-string');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');

exports.createPost = async (req, res) => {
  try {
    const { title, codeSnippet, language } = req.body;
    const file = req.file;

    // Validate title
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validate authorization
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    // Fetch user profile and other users in parallel
    const [userResponse, otherUsersResponse] = await Promise.all([
      axios.get(`http://localhost:8000/api/auth/users/${req.userId}`),
      axios.get(`http://localhost:8000/api/auth/otherUsers/${req.userId}`)
    ]);

    const user = userResponse.data;
    const otherUsers = otherUsersResponse.data.users;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle file uploads
    let codeFileUrl = null;
    let uploadedFileUrl = null;

    // Upload code snippet if provided
    if (codeSnippet) {
      try {
        const codeFileName = `${uuidv4()}.${language || 'txt'}`;
        await minioClient.putObject(
          process.env.MINIO_BUCKET,
          codeFileName,
          Buffer.from(codeSnippet),
          { 'Content-Type': 'text/plain' }
        );
        codeFileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${codeFileName}`;
        console.log("✅ Successfully uploaded:",  codeFileUrl);
        console.log("✅ Successfully uploaded:", codeFileName);
      } catch (error) {
        console.error("❌ MinIO code upload failed:", error);
        // Continue execution - non-critical error
      }
    }

    // Upload file if provided
    if (file) {
      try {
        const uploadedFileName = `${uuidv4()}_${file.originalname}`;
        await minioClient.putObject(
          process.env.MINIO_BUCKET,
          uploadedFileName,
          file.buffer
        );
        uploadedFileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${uploadedFileName}`;
        console.log("✅ Successfully uploaded:",  uploadedFileUrl);
        console.log("✅ Successfully uploaded file:", uploadedFileName);
      } catch (error) {
        console.error("❌ MinIO file upload failed:", error);
        // Continue execution - non-critical error
      }
    }

    // Get author details
    const authorResponse = await axios.get('http://localhost:8000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const author = authorResponse.data;

    if (!author) {
      return res.status(400).json({ message: 'Author not found' });
    }
    console.log("👤 Author:", author.username);

    // Create and save post
    const post = new Post({
      title,
      language: language || null,
      codeFileUrl,
      uploadedFileUrl,
      author: author._id,//author.username ekta string return kore tai error..ekhane object lagbe
    });

    await post.save();

    // Create notifications
    if (otherUsers && otherUsers.length > 0) {
      const notifications = otherUsers.map((u) => ({
        userId: u._id,
        postId: post._id.toString(),
        read: false,
      }));

      /** */
     // console.log("📩 Sending notifications:", notifications);
    /*  
      console.log("token", token);
     const response1= await axios.post('http://localhost:8000/api/notifications/create', {
        notifications
      });
      localStorage.setItem('token', response1.data.token);
    }

*/
//console.log("token", token);
//const token1 = localStorage.getItem('token');
//console.log("token1", token1);
const response = await axios.post(
  'http://localhost:8000/api/notifications/create',
  { notifications },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
    }
    // Send success response
    return res.status(201).json(post);

  } catch (error) {
    console.error("Error in createPost:", error.response?.data || error.message);
    // Ensure we haven't already sent a response
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: 'An error occurred while creating the post',
        error: error.message 
      });
    }
  }
};

// Keep getPosts and getPostById as they are, but add error handling
exports.getPosts = async (req, res) => {
 // console.log("🔍 Fetching posts...");
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    const postsWithAuthor = await Promise.all(posts.map(async (post) => {
      try {
        const userResponse = await axios.get(`http://localhost:8000/api/auth/users/${post.author}`);
        const username = userResponse.data.username;
        return { ...post.toObject(), author: { username } };
      } catch (error) {
        console.error("Error fetching user:", error);
        return { ...post.toObject(), author: { username: 'Unknown' } };
      }
    }));

  //  console.log("✅ Fetched posts:", postsWithAuthor.length);
    return res.json(postsWithAuthor);
  } catch (error) {
    console.error("Error in getPosts:", error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching posts',
      error: error.message 
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let author = { username: 'Unknown' };
    try {
      const userResponse = await axios.get(`http://localhost:8000/api/auth/users/${post.author}`);
      author = userResponse.data || { username: 'Unknown' };
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    let codeContent = null;
    let uploadedFileContent = null;

    if (post.codeFileUrl) {
      try {
        const codeFileName = post.codeFileUrl.split('/').pop();
        const codeFileStream = await minioClient.getObject(process.env.MINIO_BUCKET, codeFileName);
        codeContent = await streamToString(codeFileStream);
      } catch (error) {
        console.error("Error fetching code content:", error);
      }
    }

    if (post.uploadedFileUrl) {
      try {
        const uploadedFileName = post.uploadedFileUrl.split('/').pop();
        const uploadedFileStream = await minioClient.getObject(process.env.MINIO_BUCKET, uploadedFileName);
        uploadedFileContent = await streamToString(uploadedFileStream);
      } catch (error) {
        console.error("Error fetching uploaded file content:", error);
      }
    }

    return res.json({
      post: { ...post.toObject(), author },
      codeContent,
      uploadedFileContent,
    });
  } catch (error) {
    console.error("Error in getPostById:", error);
    return res.status(500).json({ 
      message: 'An error occurred while fetching the post',
      error: error.message 
    });
  }
};