const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connect = require('./db/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

//const router = express.Router();
// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to the database
connect();

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173', // Set this to match your frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Routes
//auth/
app.use('/', authRoutes);

//router.get('/profile', authMiddleware, profile); // Add authMiddleware to protect the profile route


module.exports = app;