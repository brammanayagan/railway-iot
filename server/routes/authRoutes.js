import express from 'express';
import { authUser, getUserProfile, registerUser, sendOTP, verifyOTP } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate Limiter: Prevent spamming the OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many OTP requests from this IP, please try again after 15 minutes' }
});

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/user', protect, getUserProfile);

// OTP routes
router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', verifyOTP);

export default router;






// POST http://localhost:5000/api/auth/register
// POST http://localhost:5000/api/auth/login
// GET http://localhost:5000/api/auth/user


// http://localhost:5000/api/auth/send-otp
// http://localhost:5000/api/auth/verify-otp




