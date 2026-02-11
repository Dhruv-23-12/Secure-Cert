import express from 'express';
import {
  createCertificate,
  verifyCertificate,
  listCertificates,
} from '../controllers/certificate.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Certificate Routes
 * Base path: /api/cert
 */

// Create new certificate (Admin only)
// POST /api/cert/create
router.post('/create', authenticate, authorizeAdmin, createCertificate);

// Verify certificate (Public access)
// GET /api/cert/verify/:certificateId
router.get('/verify/:certificateId', verifyCertificate);

// List all certificates (Admin only)
// GET /api/cert/list
router.get('/list', authenticate, authorizeAdmin, listCertificates);

export default router;

