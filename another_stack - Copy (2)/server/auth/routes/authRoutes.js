const express = require('express');
const { register, login, profile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Add this line to import the middleware
const User = require('../models/User'); // Add this import

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, profile); // Add authMiddleware to protect the profile route


router.get('/users/:userId', async (req, res) => {
  //  console.log("User from Middleware:", req.user);
   
   // res.send(req.user);
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
          return res.status(400).json({ message: 'Invalid user ID format' });
        }
      const user = await User.findById(req.params.userId); // Find user by ID
    //  console.log("User from DB:", user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user }); // Return user details
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  router.get('/otherUsers/:userId', async (req, res) => {
    //console.log("User from Middleware:", req.user);
    
    try {
        const mongoose = require('mongoose');
        
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Find all users except the specified userId
        const users = await User.find({
            _id: { $ne: req.params.userId }  // $ne means "not equal"
        });

        console.log("other Users from DB:", users);
        
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No other users found' });
        }

        res.json({ users }); // Return array of other users
        
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


module.exports = router;
