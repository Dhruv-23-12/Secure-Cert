import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import OTP from '../models/otp.model.js';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/mail.service.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;

const normalizeEmail = (email = '') => email.toLowerCase().trim();
const generateOtp = () => crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');

const getRemainingCooldownSeconds = (lastSentAt) => {
  if (!lastSentAt) return 0;
  const elapsedSeconds = Math.floor((Date.now() - new Date(lastSentAt).getTime()) / 1000);
  return Math.max(0, RESEND_COOLDOWN_SECONDS - elapsedSeconds);
};

export const issueOtpForEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const now = new Date();
  const existingOtp = await OTP.findOne({ email: normalizedEmail });

  const remainingCooldown = getRemainingCooldownSeconds(existingOtp?.lastSentAt);
  if (remainingCooldown > 0) {
    const error = new Error(`Please wait ${remainingCooldown}s before requesting another OTP`);
    error.statusCode = 429;
    throw error;
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

  if (existingOtp) {
    existingOtp.otp = hashedOtp;
    existingOtp.expiresAt = expiresAt;
    existingOtp.attempts = 0;
    existingOtp.lastSentAt = now;
    await existingOtp.save();
  } else {
    await OTP.create({
      email: normalizedEmail,
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    });
  }

  await sendOtpEmail({ to: normalizedEmail, otp, expiresInMinutes: OTP_EXPIRY_MINUTES });
};

export const sendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await issueOtpForEmail(email);
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: { email, expiresInSeconds: OTP_EXPIRY_MINUTES * 60 },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

export const verifyOtpByEmail = async ({ email, otp }) => {
  const normalizedEmail = normalizeEmail(email);
  const otpDoc = await OTP.findOne({ email: normalizedEmail }).select('+otp');

  if (!otpDoc) {
    return { ok: false, statusCode: 400, message: 'OTP not found or expired' };
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return { ok: false, statusCode: 400, message: 'OTP expired' };
  }

  if (otpDoc.attempts >= MAX_VERIFY_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return { ok: false, statusCode: 429, message: 'Maximum OTP attempts exceeded. Request a new OTP' };
  }

  const isValid = await bcrypt.compare(otp, otpDoc.otp);
  if (!isValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return {
      ok: false,
      statusCode: 400,
      message: 'Invalid OTP',
      attemptsLeft: Math.max(0, MAX_VERIFY_ATTEMPTS - otpDoc.attempts),
    };
  }

  await OTP.deleteOne({ _id: otpDoc._id });
  return { ok: true };
};

export const verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const result = await verifyOtpByEmail({ email, otp });
    if (!result.ok) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
        attemptsLeft: result.attemptsLeft,
      });
    }

    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
    });
  }
};
