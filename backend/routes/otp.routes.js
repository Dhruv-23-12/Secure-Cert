import express from 'express';
import rateLimit from 'express-rate-limit';
import { sendOtp, verifyOtp } from '../controllers/otp.controller.js';

const router = express.Router();

const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please try again later' },
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts. Please try again later' },
});

router.post('/send-otp', sendOtpLimiter, sendOtp);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);

export default router;
