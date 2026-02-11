import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  'http://localhost:5000/api';

export default function HackathonCertificate({
  studentName: propStudentName,
  eventName: propEventName,
  eventDate: propEventDate,
  organizer: propOrganizer,
  certificateId: propCertificateId,
  qrValue: propQrValue,
}) {
  const { id } = useParams();
  const [loading, setLoading] = useState(!!id);
  const [certificateData, setCertificateData] = useState(null);

  const studentName = propStudentName || certificateData?.studentName || 'John Doe';
  const eventName = propEventName || certificateData?.additionalData?.eventName || 'Tech Innovation Hackathon 2024';
  const eventDate = propEventDate || certificateData?.additionalData?.eventDate || certificateData?.issueDate || '15-17 March 2024';
  const organizer = propOrganizer || certificateData?.additionalData?.organizer || 'Tech University';
  const certificateId = propCertificateId || certificateData?.certificateId || id || 'HACK-2024-001';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="certificate-container mx-auto bg-white shadow-lg" style={{ width: '297mm', minHeight: '210mm', padding: '15mm' }}>
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-8 px-6 rounded-t-lg mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-2 tracking-wide">CERTIFICATE OF PARTICIPATION</h1>
            <div className="w-32 h-1 bg-white mx-auto mt-2"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 mb-6">This is to certify that</p>
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 border-b-4 border-blue-600 inline-block px-8 pb-2">
              {studentName}
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-4">
            has successfully participated in
          </p>
          <p className="text-2xl font-semibold text-blue-700 mb-2">{eventName}</p>
          <p className="text-lg text-gray-600 mb-4">held on {eventDate}</p>
          <p className="text-lg text-gray-700">organized by</p>
          <p className="text-xl font-semibold text-purple-700">{organizer}</p>
        </div>

        {/* Footer */}
        <div className="mt-12 flex justify-between items-end">
          {/* Digital Signature */}
          <div className="flex-1">
            <div className="border-t-2 border-gray-800 w-48 mt-2 mb-1"></div>
            <p className="text-sm font-semibold text-gray-900">Organizer Signature</p>
            <p className="text-xs text-gray-600">{organizer}</p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-2 border-2 border-gray-300 rounded">
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
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Certificate ID: {certificateId}</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="no-print max-w-4xl mx-auto mt-4 text-center">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          Print Certificate
        </button>
      </div>
    </div>
  );
}
