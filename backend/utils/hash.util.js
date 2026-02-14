import crypto from 'crypto';

/**
 * Generate SHA-256 hash for certificate verification
 * Hash formula: SHA256(studentName + enrollmentNo + course + certificateId)
 * 
 * @param {string} studentName - Name of the student
 * @param {string} enrollmentNo - Enrollment number
 * @param {string} course - Course name
 * @param {string} certificateId - Certificate ID (IRN)
 * @returns {string} - SHA-256 hash in hexadecimal format
 */
export const generateCertificateHash = (studentName, enrollmentNo, course, certificateId) => {
  // Concatenate all fields in the specified order
  const dataString = `${studentName}${enrollmentNo}${course}${certificateId}`;

  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256');
  hash.update(dataString);

  // Return hash as hexadecimal string
  return hash.digest('hex');
};

/**
 * Verify certificate hash
 * Re-generates hash from certificate data and compares with stored hash
 * 
 * @param {Object} certificate - Certificate document from database
 * @returns {Object} - Verification result with isValid and message
 */
export const verifyCertificateHash = (certificate) => {
  // Re-generate hash from stored certificate data
  // Must match the logic in createCertificate controller
  const regeneratedHash = generateCertificateHash(
    certificate.studentName,
    certificate.enrollmentNo || certificate.certificateId,
    certificate.course || certificate.certificateType,
    certificate.certificateId
  );

  // Compare regenerated hash with stored hash
  // Compare regenerated hash with stored hash
  const isValid = regeneratedHash === certificate.hashValue;

  if (!isValid) {
    console.log('❌ Hash Mismatch Debug:');
    console.log('Student:', certificate.studentName);
    console.log('ID:', certificate.certificateId);
    console.log('Course (DB):', certificate.course);
    console.log('Enrollment (DB):', certificate.enrollmentNo);
    console.log('Type (DB):', certificate.certificateType);
    console.log('Regenerated Hash:', regeneratedHash);
    console.log('Stored Hash:     ', certificate.hashValue);
    console.log('Inputs used: ', `Student: ${certificate.studentName}, Enrol: ${certificate.enrollmentNo || certificate.certificateId}, Course: ${certificate.course || certificate.certificateType}, ID: ${certificate.certificateId}`);
  }

  return {
    isValid,
    regeneratedHash,
    storedHash: certificate.hashValue,
    message: isValid
      ? 'Certificate is valid and authentic'
      : 'Certificate has been tampered with',
  };
};

