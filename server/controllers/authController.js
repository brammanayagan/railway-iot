import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import OTP from '../models/OTP.js';
import mailSender from '../utils/mailSender.js';
import bcrypt from 'bcryptjs';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        res.status(401);
        throw new Error('Please verify your email first');
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/user
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email with an OTP.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP to user's email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      res.status(400);
      throw new Error('User is already verified');
    }

    // Generate 6-digit OTP using a cryptographically secure method
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send email BEFORE saving to DB (so if email fails, we don't save a useless OTP)
    const emailBody = `<h1>Verification Code</h1><p>Your code is: <b>${otp}</b></p>`;
    await mailSender(email, "Verification Email", emailBody);

    // Save OTP to database (the pre-save hook will hash it!)
    await OTP.create({ email, otp });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify the OTP provided by the user
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error('Email and OTP are required');
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0) {
      res.status(400);
      throw new Error('The OTP is invalid or has expired');
    }

    // Compare the provided OTP with the hashed OTP in the DB
    const isMatch = await bcrypt.compare(otp, response[0].otp);

    if (!isMatch) {
      res.status(400);
      throw new Error('Invalid OTP');
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete the used OTP
    await OTP.deleteMany({ email });

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    next(error);
  }
};
