import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', authMiddleware, logoutUser);

export default router;
