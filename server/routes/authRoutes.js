import express from 'express';
import {
  googleLogin,
  googleCallback,
  getUserProfile,
  logoutUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.post('/logout', protect, logoutUser);

export default router;
