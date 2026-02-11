import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  'http://localhost:5000/api';

export default function SportsCertificate({
  studentName: propStudentName,
  sportName: propSportName,
  achievement: propAchievement,
  eventLevel: propEventLevel,
  eventDate: propEventDate,
  certificateId: propCertificateId,
  qrValue: propQrValue,
}) {
  const { id } = useParams();
  const [loading, setLoading] = useState(!!id);
  const [certificateData, setCertificateData] = useState(null);

  const studentName = propStudentName || certificateData?.studentName || 'John Doe';
  const sportName = propSportName || certificateData?.additionalData?.sportName || 'Football';
  const achievement = propAchievement || certificateData?.additionalData?.achievement || 'First Place';
  const eventLevel = propEventLevel || certificateData?.additionalData?.eventLevel || 'Inter-University Championship';
  const eventDate = propEventDate || certificateData?.additionalData?.eventDate || certificateData?.issueDate || '15 March 2024';
  const certificateId = propCertificateId || certificateData?.certificateId || id || 'SPORT-2024-001';
  const qrValue = propQrValue || certificateData?.hashValue || certificateId;

  useEffect(() => {
    if (id) {
      fetch(`${API_BASE_URL}/cert/verify/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setCertificateData(data.data);
          }
        })
        .catch(err => console.error('Error fetching certificate:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .certificate-container, .certificate-container * {
          visibility: visible;
        }
        .certificate-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 297mm;
          min-height: 210mm;
        }
        .no-print {
          display: none !important;
        }
        nav, footer {
          display: none !important;
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const verificationUrl = qrValue 
    ? `${window.location.origin}/verify/${qrValue}`
    : `${window.location.origin}/verify/${certificateId}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="certificate-container mx-auto bg-white shadow-lg relative" style={{ width: '297mm', minHeight: '210mm', padding: '20mm' }}>
        {/* Sports-themed Border */}
        <div className="absolute inset-0 border-8 border-green-500" style={{ borderStyle: 'double' }}></div>
        <div className="absolute inset-4 border-2 border-gold-400"></div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="mb-4">
            <div className="inline-block bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-3 rounded-lg">
              <h1 className="text-4xl font-bold tracking-wide">SPORTS ACHIEVEMENT CERTIFICATE</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8 relative z-10">
          <p className="text-lg text-gray-700 mb-6">This is to certify that</p>
          <div className="mb-6">
            <h2 className="text-5xl font-bold text-gray-900 mb-2">
              {studentName}
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-4">
            has achieved
          </p>
          <div className="mb-4">
            <p className="text-3xl font-bold text-green-700 mb-2">{achievement}</p>
            <p className="text-xl text-gray-700">in {sportName}</p>
          </div>
          <p className="text-lg text-gray-600 mb-2">at the {eventLevel}</p>
          <p className="text-lg text-gray-600">held on {eventDate}</p>
        </div>

        {/* Footer */}
        <div className="mt-12 flex justify-between items-end relative z-10">
          {/* Official Seal and Signature */}
          <div className="flex-1">
            <div className="flex items-end space-x-6">
              <div className="w-24 h-24 border-4 border-gold-400 rounded-full flex items-center justify-center bg-green-50">
                <span className="text-xs text-center text-gray-600 font-semibold">OFFICIAL<br />SEAL</span>
              </div>
              <div>
                <div className="border-t-2 border-gray-800 w-48 mt-2 mb-1"></div>
                <p className="text-sm font-semibold text-gray-900">Authority Signature</p>
                <p className="text-xs text-gray-600">Sports Committee</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-2 border-2 border-green-300 rounded">
              {qrValue || certificateId ? (
                <QRCode
                  value={verificationUrl}
                  size={100}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-400">QR Code</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center max-w-[120px]">
              Verify: {certificateId}
            </p>
          </div>
        </div>

        {/* Certificate ID */}
        <div className="mt-6 text-center relative z-10">
          <p className="text-xs text-gray-500">Certificate ID: {certificateId}</p>
          <p className="text-xs text-gray-500 mt-1">Issue Date: {eventDate}</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="no-print max-w-4xl mx-auto mt-4 text-center">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-900 transition-colors"
        >
          Print Certificate
        </button>
      </div>
    </div>
  );
}
