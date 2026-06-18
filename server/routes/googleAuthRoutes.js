import express from 'express';
import { googleLogin, googleCallback } from '../controllers/googleAuthController.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

export default router;
