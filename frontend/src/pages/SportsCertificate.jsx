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

  const studentName = propStudentName || certificateData?.studentName || 'Student Name';
  const sportName = propSportName || certificateData?.additionalData?.sportName || 'Sport Name';
  const achievement = propAchievement || certificateData?.additionalData?.achievement || 'Achievement';
  const eventLevel = propEventLevel || certificateData?.additionalData?.eventLevel || 'Event Level';
  const eventDate = propEventDate || certificateData?.additionalData?.eventDate || certificateData?.issueDate || new Date().toLocaleDateString();
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
      .greek-border {
        background-color: transparent;
        background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H22v18H0v-2h20v-2H0v-2h20v-2H0v-2h20v-2H0v-2h20v-2H0v-2h20v-2H0z' fill='%2315803d' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center items-center">
      <div
        className="certificate-container bg-white shadow-2xl relative flex flex-col items-center justify-between"
        style={{ width: '297mm', height: '210mm', padding: '15mm' }}
      >

        {/* Borders */}
        <div className="absolute inset-4 border-2 border-yellow-500 rounded-sm"></div>
        <div className="absolute inset-6 border-4 border-green-800 rounded-sm"></div>

        {/* Corner Accents */}
        <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-yellow-500 z-10"></div>
        <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-yellow-500 z-10"></div>
        <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-yellow-500 z-10"></div>
        <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-yellow-500 z-10"></div>

        {/* Header */}
        <div className="text-center z-10 mt-4">
          {/* Achievement Icon */}
          <div className="mx-auto text-yellow-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <h1 className="text-5xl font-black text-green-900 tracking-wider uppercase" style={{ fontFamily: 'serif' }}>
            Sports Achievement<br />Certificate
          </h1>
          <div className="h-1 w-32 bg-yellow-500 mx-auto mt-4"></div>
        </div>

        {/* Content */}
        <div className="text-center z-10 w-full max-w-4xl flex-grow flex flex-col justify-center">
          <p className="text-xl text-gray-600 mb-4 italic font-serif">This certifies that</p>

          <h2 className="text-5xl font-bold text-gray-900 mb-6 font-serif border-b-2 border-gray-200 inline-block pb-2 px-12 mx-auto">
            {studentName}
          </h2>

          <div className="space-y-4">
            <p className="text-xl text-gray-700">has demonstrated outstanding performance and achieved</p>
            <p className="text-3xl font-bold text-green-800">{achievement}</p>
            <p className="text-2xl text-gray-800 font-medium">in {sportName}</p>
            <p className="text-lg text-gray-600 mt-4">at the <span className="font-semibold">{eventLevel}</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full grid grid-cols-3 gap-8 items-end z-10">

          {/* Authority Sig */}
          <div className="text-center">
            <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
            <p className="font-bold text-gray-900 text-lg font-serif">Chairman</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Sports Committee</p>
          </div>

          {/* Official Seal */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-yellow-600 flex items-center justify-center bg-yellow-50 shadow-inner">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-yellow-600 flex items-center justify-center">
                <div className="text-center transform -rotate-12">
                  <p className="text-xs font-bold text-yellow-800 uppercase tracking-widest">Official<br />Seal</p>
                  <svg className="w-8 h-8 mx-auto text-yellow-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* QR & Date */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-2 border border-green-200">
              <QRCode
                value={verificationUrl}
                size={80}
                level="M"
                fgColor="#166534"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono">{certificateId}</p>
            <p className="text-xs text-gray-900 font-bold mt-1">Issued: {eventDate}</p>
          </div>

        </div>

      </div>

      {/* Print Button */}
      <div className="fixed bottom-8 right-8 no-print">
        <button
          onClick={() => window.print()}
          className="bg-green-800 text-white px-6 py-3 rounded-full shadow-xl hover:bg-green-900 transition-all transform hover:scale-105 flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Certificate
        </button>
      </div>
    </div>
  );
}
