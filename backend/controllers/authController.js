import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/dbFactory.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'supersecretkey_change_me_in_production', 
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide username, email and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'User already exists with this email' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User (default role to 'citizen' unless specified, but enforce security)
    const assignedRole = role === 'admin' ? 'admin' : 'citizen';
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: assignedRole
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ status: 'error', message: 'Invalid user data' });
    }
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server registration error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server login error' });
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: req.user
    });
  } catch (err) {
    console.error('Profile Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server profile fetch error' });
  }
};
