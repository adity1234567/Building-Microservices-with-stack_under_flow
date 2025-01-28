const express = require('express');
const { createPost, getPosts, getPostById } = require('../controllers/postController'); // Ensure these functions exist and are imported correctly
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer'); // Ensure multer is imported
const upload = multer(); // Initialize multer
const router = express.Router();

router.post('/create', authMiddleware, upload.single('file'), createPost); 
router.get('/', authMiddleware, getPosts); 
router.get('/:postId', authMiddleware, getPostById); 

module.exports = router;
