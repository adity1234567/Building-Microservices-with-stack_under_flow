const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  //console.log("Token from Header:", token);

  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    //console.log("Verifying Token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   // console.log("Decoded Token:", decoded);
    

   console.log("ok decoded")
    req.userId = decoded.userId;
    const user = await User.findById(req.userId);
    if (!user) {
      console.error("User not found in DB:", req.userId);
      return res.status(401).json({ message: 'User not found' });
    }
   // console.log("User found:", user);
   console.log("ok found user");
    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
