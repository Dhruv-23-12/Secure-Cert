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

  const studentName = propStudentName || certificateData?.studentName || 'Student Name';
  const eventName = propEventName || certificateData?.additionalData?.eventName || 'Hackathon Event';
  const eventDate = propEventDate || certificateData?.additionalData?.eventDate || certificateData?.issueDate || new Date().toLocaleDateString();
  const organizer = propOrganizer || certificateData?.additionalData?.organizer || 'Organizer Name';
  const certificateId = propCertificateId || certificateData?.certificateId || id || 'CERT-ID';
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
          height: 210mm;
          margin: 0;
          padding: 0;
          overflow: hidden;
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
      .tech-grid {
        background-image: linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center items-center">
      <div
        className="certificate-container bg-white shadow-2xl relative overflow-hidden flex flex-col"
        style={{ width: '297mm', height: '210mm' }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500 to-purple-600 opacity-10 rounded-bl-full transform translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-600 to-blue-500 opacity-10 rounded-tr-full transform -translate-x-10 translate-y-10"></div>

        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col p-12">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-wider uppercase">TechVerify</span>
            </div>
            <div className="text-right">
              <span className="block text-sm text-gray-500 uppercase tracking-widest">Certificate ID</span>
              <span className="block font-mono font-bold text-indigo-600">{certificateId}</span>
            </div>
          </div>

          {/* Title Area */}
          <div className="text-center mt-4 mb-2">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 uppercase tracking-tight" style={{ lineHeight: 1.1 }}>
              Certificate of<br />Participation
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Recipient Area */}
          <div className="flex-grow flex flex-col justify-center items-center text-center">
            <p className="text-gray-500 text-lg uppercase tracking-widest mb-4">This is awarded to</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 font-serif italic relative inline-block">
              {studentName}
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-200"></div>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              For successfully participating in the <span className="font-bold text-indigo-700">{eventName}</span>.
              Your dedication and innovative spirit contributed significantly to the success of this event.
            </p>
          </div>

          {/* Footer Area */}
          <div className="mt-auto grid grid-cols-3 gap-8 items-end">

            {/* Digital Signature */}
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                {/* Simulated Digital Sig */}
                <svg width="180" height="60" viewBox="0 0 180 60" className="text-indigo-800">
                  <path d="M10,50 Q40,10 70,50 T150,30" stroke="currentColor" strokeWidth="3" fill="none" />
                  <text x="20" y="45" fontFamily="cursive" fontSize="24" fill="currentColor">Signed</text>
                </svg>
              </div>
              <div className="border-t border-gray-400 w-48 mx-auto pt-2">
                <p className="font-bold text-gray-900">{organizer}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Organizer Signature</p>
              </div>
            </div>

            {/* Date */}
            <div className="text-center pb-2">
              <div className="inline-block px-6 py-2 border border-indigo-100 bg-indigo-50 rounded-full">
                <span className="text-sm text-indigo-800 font-semibold uppercase tracking-wider">Date: {eventDate}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-end">
              <div className="bg-white p-2 shadow-lg border border-gray-100 rounded-lg">
                <QRCode
                  value={verificationUrl}
                  size={96}
                  level="M"
                  fgColor="#4F46E5"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider">Scan to Verify</p>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 w-full"></div>
      </div>

      {/* Print Button */}
      <div className="fixed bottom-8 right-8 no-print">
        <button
          onClick={() => window.print()}
          className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-black transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Certificate
        </button>
      </div>
    </div>
  );
}
