/**
 * QR Code Utility Functions
 * Helper functions for QR code generation and handling
 */

/**
 * Generate a unique certificate ID (IRN)
 * Format: YYMM-XXXXXX-XXXXXX (YearMonth-Random-Timestamp)
 * 
 * @returns {string} - Unique certificate ID
 */
export const generateCertificateId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const year = new Date().getFullYear().toString().substr(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  // Format: YYMM-XXXXXX-XXXXXX
  return `${year}${month}-${random}-${timestamp.substr(-6)}`;
};

/**
 * Generate verification URL for certificate
 * This URL can be embedded in QR codes
 * 
 * @param {string} certificateId - Certificate ID
 * @returns {string} - Verification URL
 */
export const generateVerificationUrl = (certificateId) => {
  // In production, use your actual domain
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/verify/${certificateId}`;
};

