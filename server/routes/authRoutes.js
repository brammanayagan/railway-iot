import express from 'express';
import { authUser, getUserProfile, registerUser, googleLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/google', googleLogin);
router.get('/user', protect, getUserProfile);

export default router;
