import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

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

export default router;

