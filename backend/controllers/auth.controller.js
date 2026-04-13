import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { issueOtpForEmail, verifyOtpByEmail } from './otp.controller.js';

/**
 * Generate JWT Token
 * Helper function to create JWT token for authenticated user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Register New User
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    // Password will be automatically hashed by the pre-save middleware
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: role || 'user', // Default to 'user' if not specified
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password using the method defined in User model
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Enforce OTP step for all users after password verification
    await issueOtpForEmail(user.email);

    // Return response indicating 2FA required
    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      require2FA: true,
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

/**
 * Verify 2FA OTP
 * POST /api/auth/verify-2fa
 */
export const verify2FA = async (req, res) => {
  try {
    const { userId, email, code, otp } = req.body;
    let resolvedEmail = (email || '').toLowerCase().trim();
    const resolvedOtp = String(code || otp || '').trim();

    if (!resolvedEmail && userId) {
      const lookupUser = await User.findById(userId).select('email');
      resolvedEmail = lookupUser?.email || '';
    }

    if (!resolvedEmail || !resolvedOtp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: resolvedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpCheck = await verifyOtpByEmail({ email: resolvedEmail, otp: resolvedOtp });
    if (!otpCheck.ok) {
      return res.status(otpCheck.statusCode).json({
        success: false,
        message: otpCheck.message,
        attemptsLeft: otpCheck.attemptsLeft,
      });
    }

    // Generate Token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Verification successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

