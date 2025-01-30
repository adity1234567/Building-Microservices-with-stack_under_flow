const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Ensure bcrypt is imported

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hash,
    });

    await newUser.save();

    const token = jwt.sign({
      userId: newUser._id,
    }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token);
    res.status(201).json({ token, message: 'User registered successfully' });

  } catch (error) {
    console.error("Error in register function:", error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({
      userId: user._id,
    }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });  } catch (error) {
    console.error("Error in login function:", error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.profile = async (req, res) => {
  console.log("User-profile from Middleware:", req.user);
  try {
    const user = await User.findById(req.userId).select('-password'); // Fetch user by ID and exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in profile function:", error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

