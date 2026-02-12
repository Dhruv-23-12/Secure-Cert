import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/email.js';

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

    // Generate JWT token
    // const token = generateToken(user._id);

    // Prepare 2FA Logic
    // For this implementation, we enforce 2FA for all users or specific roles (e.g., admin)
    // Here, let's enforce it for 'admin' role as per previous requirements, or maybe all for demonstration
    // User requested "real time otp", implying standard flow. Let's make it mandatory for all for now to show the feature.

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user
    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send OTP via Email
    // In a real scenario, we'd use a template. Here, simple HTML.
    try {
      await sendEmail({
        to: user.email,
        subject: 'Your SecureCert Verification Code',
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">SecureCert Verification</h2>
                    <p>Your verification code is:</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                </div>
            `
      });
      console.log('OTP Email sent successfully');
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr);
      // Continue flow, maybe user can get it from console for dev
    }

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
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ success: false, message: 'User ID and Code are required' });
    }

    const user = await User.findById(userId).select('+otpCode +otpExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otpCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

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

