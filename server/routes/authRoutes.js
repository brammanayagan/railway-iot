import express from 'express';
import { authUser, getUserProfile, registerUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/user', protect, getUserProfile);

export default router;
