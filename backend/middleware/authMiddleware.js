import jwt from 'jsonwebtoken';
import { User } from '../models/dbFactory.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_change_me_in_production');
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      }
      
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      };
      
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ status: 'error', message: 'Forbidden: Admin access only' });
  }
};
