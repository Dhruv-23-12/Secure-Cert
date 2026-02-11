import Certificate from '../models/Certificate.js';
import { generateCertificateHash } from '../utils/hash.util.js';
import { verifyCertificateHash } from '../utils/hash.util.js';
import { generateCertificateId } from '../utils/qr.util.js';

/**
 * Create New Certificate
 * POST /api/cert/create
 * Admin only
 */
export const createCertificate = async (req, res) => {
  try {
    const { 
      certificateType = 'general',
      certificateId: providedId,
      studentName, 
      enrollmentNo, 
      course, 
      issueDate,
      additionalData = {}
    } = req.body;

    // Validate required fields
    if (!studentName || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'studentName and issueDate are required',
      });
    }

    // Generate unique certificate ID (IRN) if not provided
    let certificateId = providedId;
    if (!certificateId) {
      let isUnique = false;
      while (!isUnique) {
        certificateId = generateCertificateId();
        const existing = await Certificate.findOne({ certificateId });
        if (!existing) {
          isUnique = true;
        }
      }
    } else {
      // Check if provided ID already exists
      const existing = await Certificate.findOne({ certificateId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Certificate ID already exists',
        });
      }
    }

    // Generate hash for certificate integrity
    const hashValue = generateCertificateHash(
      studentName,
      enrollmentNo || certificateId,
      course || certificateType,
      certificateId
    );

    // Create certificate document
    const certificate = await Certificate.create({
      certificateId,
      certificateType,
      studentName,
      enrollmentNo: enrollmentNo || null,
      course: course || null,
      issueDate: new Date(issueDate),
      status: 'Valid',
      hashValue,
      additionalData,
    });

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: {
        certificate: {
          certificateId: certificate.certificateId,
          studentName: certificate.studentName,
          enrollmentNo: certificate.enrollmentNo,
          course: certificate.course,
          issueDate: certificate.issueDate,
          status: certificate.status,
          hashValue: certificate.hashValue,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating certificate',
      error: error.message,
    });
  }
};

/**
 * Verify Certificate
 * GET /api/cert/verify/:certificateId
 * Public access
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Find certificate by ID
    const certificate = await Certificate.findOne({
      certificateId: certificateId.toUpperCase(),
    });

    // If certificate not found
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        data: {
          status: 'Invalid',
          certificateId,
        },
      });
    }

    // Check if certificate is revoked
    if (certificate.status === 'Revoked') {
      return res.status(200).json({
        success: true,
        message: 'Certificate has been revoked',
        data: {
          status: 'Revoked',
          certificateId: certificate.certificateId,
          studentName: certificate.studentName,
          course: certificate.course,
          issueDate: certificate.issueDate,
        },
      });
    }

    // Verify hash integrity
    const hashVerification = verifyCertificateHash(certificate);

    // Determine final status
    let finalStatus;
    if (!hashVerification.isValid) {
      finalStatus = 'Tampered';
    } else {
      finalStatus = 'Valid';
    }

    // Return verification result
    res.status(200).json({
      success: true,
      message: hashVerification.message,
      data: {
        status: finalStatus,
        certificateId: certificate.certificateId,
        certificateType: certificate.certificateType,
        studentName: certificate.studentName,
        enrollmentNo: certificate.enrollmentNo,
        course: certificate.course,
        issueDate: certificate.issueDate,
        additionalData: certificate.additionalData || {},
        hashVerification: {
          isValid: hashVerification.isValid,
          message: hashVerification.message,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error.message,
    });
  }
};

/**
 * List All Certificates
 * GET /api/cert/list
 * Admin only
 */
export const listCertificates = async (req, res) => {
  try {
    // Optional query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional status filter
    const statusFilter = req.query.status;

    // Build query
    const query = {};
    if (statusFilter) {
      query.status = statusFilter;
    }

    // Fetch certificates with pagination
    const certificates = await Certificate.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Certificate.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: {
        certificates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving certificates',
      error: error.message,
    });
  }
};

