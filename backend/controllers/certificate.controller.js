import Certificate from '../models/Certificate.js';
import { generateCertificateHash } from '../utils/hash.util.js';
import { verifyCertificateHash } from '../utils/hash.util.js';
import { generateCertificateId } from '../utils/qr.util.js';
import QRCode from 'qrcode';
import nunjucks from 'nunjucks';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Nunjucks
nunjucks.configure(path.join(__dirname, '../templates'), {
  autoescape: true,
  express: null
});

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
    let { certificateId } = req.params;

    // Handle POST request where certificateId might be in the body
    if (!certificateId && req.body) {
      certificateId = req.body.certificateId || req.body.referenceNumber || req.body.qrData;
    }

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID or QR data is required',
      });
    }

    const searchTerm = certificateId.trim().toUpperCase();

    // Find certificate by ID OR Hash
    const certificate = await Certificate.findOne({
      $or: [
        { certificateId: searchTerm },
        { hashValue: certificateId } // Hash might be case sensitive or not, usually specific string
      ]
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
        issuingAuthority: 'P P SAVANI UNIVERSITY', // Hardcoded as per template
        additionalData: certificate.additionalData || {},
        hashVerification: {
          isValid: hashVerification.isValid,
          message: hashVerification.message,
        },
      },
    });
  } catch (error) {
    console.error('Verification Error:', error);
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


/**
 * Download Certificate as PDF
 * GET /api/cert/download/:certificateId
 * Public/Protected (depending on requirement)
 */
export const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({
      certificateId: certificateId.toUpperCase(),
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Generate QR Code Data URI
    // Make sure this points to your frontend verification URL
    // const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?id=${certificate.certificateId}`;
    const qrContent = certificate.hashValue || certificate.certificateId;
    const qrCodeDataUri = await QRCode.toDataURL(qrContent);

    // Prepare data for template
    const data = {
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      issueDate: new Date(certificate.issueDate).toLocaleDateString('en-GB'), // DD/MM/YYYY
      qrCodeDataUri,
      ...certificate.additionalData, // Spread specific fields (course, eventName, etc.)
      ...certificate.toObject() // Fallback
    };

    // Select template based on type
    let templateName;
    switch (certificate.certificateType) {
      case 'Hackathon':
        templateName = 'hackathon.html';
        data.eventName = certificate.additionalData?.eventName || 'Hackathon Event';
        data.organizer = certificate.additionalData?.organizer || 'Organizer';
        data.eventDate = certificate.additionalData?.eventDate ? new Date(certificate.additionalData.eventDate).toLocaleDateString('en-GB') : data.issueDate;
        data.title = 'Certificate of Achievement';
        data.orientation = 'landscape';
        break;
      case 'Sports':
        templateName = 'sports.html';
        data.sportName = certificate.additionalData?.sportName || 'Sports';
        data.achievement = certificate.additionalData?.position || 'Participation';
        data.eventLevel = certificate.additionalData?.competitionLevel || 'University Level';
        data.eventDate = certificate.additionalData?.eventDate ? new Date(certificate.additionalData.eventDate).toLocaleDateString('en-GB') : data.issueDate;
        data.title = 'Sports Excellence';
        data.orientation = 'landscape';
        break;
      case 'Marksheet':
        templateName = 'marksheet.html';
        data.reportNo = certificate.certificateId;
        data.date = data.issueDate;
        data.enrollmentNo = certificate.enrollmentNo;
        data.semester = certificate.additionalData?.semester || 'N/A';
        data.academicYear = certificate.additionalData?.academicYear || '2023-2024';
        data.institution = 'P P SAVANI SCHOOL OF ENGINEERING'; // Example
        data.course = certificate.course;
        data.subjects = certificate.additionalData?.subjects || [];
        // Ensure performance structure exists
        const perf = certificate.additionalData?.performance || {};
        data.performance = {
          currentSemester: {
            registeredCredits: perf.currentSemester?.registeredCredits || 0,
            earnedCredits: perf.currentSemester?.earnedCredits || 0,
            sgpa: perf.currentSemester?.sgpa || 0
          },
          cumulative: {
            earnedCredits: perf.cumulative?.earnedCredits || 0,
            cgpa: perf.cumulative?.cgpa || 0,
            backlogs: perf.cumulative?.backlogs || 0
          }
        };
        data.printedOn = new Date().toLocaleString('en-GB');
        data.title = 'Official Marksheet';
        data.orientation = 'portrait';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unknown certificate type',
        });
    }

    // Render HTML
    const htmlContent = nunjucks.render(templateName, data);

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set content and wait for network idle
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: data.orientation === 'landscape'
    });

    await browser.close();

    // Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="${certificate.certificateId}.pdf"`,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};
