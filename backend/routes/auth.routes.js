import express from 'express';
import { login, register, verify2FA } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Auth Routes
 * Base path: /api/auth
 */

// Register new user
// POST /api/auth/register
router.post('/register', register);

// Login user
// POST /api/auth/login
router.post('/login', login);

// Verify 2FA
// POST /api/auth/verify-2fa
router.post('/verify-2fa', verify2FA);

export default router;

