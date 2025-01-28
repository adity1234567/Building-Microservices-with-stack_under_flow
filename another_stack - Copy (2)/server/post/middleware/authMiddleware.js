const jwt = require('jsonwebtoken');
const axios = require('axios'); // Make HTTP requests to the user microservice

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
// console.log("Token from Header:", token); // Debugging

  if (!token) {
    console.warn("No token provided in Authorization header");
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the JWT token
    //console.log("Verifying Token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    //console.log("Decoded Token:", decoded);
   
    // Request the user service to validate the user
    const response = await axios.get(`http://localhost:8000/api/auth/users/${req.userId}`);
    
    // Check if the user exists
    if (!response.data || !response.data.user) {
      console.error("User not found:", req.userId);
      return res.status(401).json({ message: 'User not found' });
    }

   // console.log("User found in post");
    req.user = response.data.user; // Attach the user object to the request
    next(); // Pass control to the next middleware

  } catch (err) {
    console.error("Token verification failed:", {
      error: err.message,
      token,
    });
    res.status(401).json({ message: 'Invalid or expired token, please login again' });
  }
};
