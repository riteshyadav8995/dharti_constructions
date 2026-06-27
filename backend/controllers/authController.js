const User = require('../models/User');
const { generateToken, determineRole } = require('../services/authService');

const registerUser = async (req, res) => {
  try {
    let { name, email, password, company, phone } = req.body;
    email = email.trim().toLowerCase();

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const role = determineRole(email);

    const user = await User.create({
      name,
      email,
      password,
      role,
      company,
      phone
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();


    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.company = req.body.company || user.company;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        company: updatedUser.company,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSiteManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: { $in: ['site_manager', 'client'] } }).select('-password');
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSiteManager = async (req, res) => {
  try {
    let { name, email, password, phone, role, company } = req.body;
    email = email.trim().toLowerCase();

    // Default to site_manager if not provided or invalid
    const assignedRole = (role === 'client') ? 'client' : 'site_manager';

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone,
      company: company || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, getUserProfile, updateUserProfile, getSiteManagers, createSiteManager };
