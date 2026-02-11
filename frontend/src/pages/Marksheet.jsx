import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'react-qr-code';

export default function Marksheet({
  studentData: propStudentData,
  subjects: propSubjects,
  performance: propPerformance
}) {
  // Print-specific styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .marksheet-container, .marksheet-container * {
          visibility: visible;
        }
        .marksheet-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 210mm;
          min-height: 297mm;
        }
        .no-print {
          display: none !important;
        }
        nav, footer {
          display: none !important;
        }
        @page {
          size: A4 portrait;
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
  // Sample data - replace with actual data from props or API
  const studentData = propStudentData || {
    studentName: 'YADAV DHRUVKUMAR PARESHBHAI',
    enrollmentNo: '23SE09CS019',
    course: 'B.TECH. (COMPUTER SCIENCE & ENGINEERING)',
    semester: '7',
    academicYear: 'NOVEMBER 2025',
    institution: 'SCHOOL OF ENGINEERING',
    reportNo: '2526RESE00349',
    date: '05/02/2026',
  };

  const subjects = propSubjects || [
    { code: 'SECE4930', name: 'PROJECT/TRAINING', evaluation: 'PRACTICAL', credits: 18, grade: 'A' },
    // Add more subjects as needed
  ];

  const performance = propPerformance || {
    currentSemester: {
      registeredCredits: 18,
      earnedCredits: 18,
      sgpa: 8.0,
    },
    cumulative: {
      earnedCredits: 118,
      cgpa: 6.36,
      backlogs: 0,
    },
  };

  const marksheetRef = useRef(null);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadPDF = async () => {
    if (!marksheetRef.current) return;

    setDownloading(true);
    try {
      // Capture the marksheet as an image
      const canvas = await html2canvas(marksheetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png');

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Calculate dimensions (A4 portrait: 210mm x 297mm)
      const pdfWidth = 595.28; // A4 width in points (210mm)
      const pdfHeight = 841.89; // A4 height in points (297mm)

      // Calculate image dimensions to fit A4
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Add a page
      const page = pdfDoc.addPage([pdfWidth, pdfHeight]);

      // Embed the image
      const pngImage = await pdfDoc.embedPng(imgData);

      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = pdfHeight - scaledHeight;

      page.drawImage(pngImage, {
        x: x,
        y: y,
        width: scaledWidth,
        height: scaledHeight,
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Download the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Marksheet_${studentData.enrollmentNo || studentData.studentName || 'Certificate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download marksheet. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const gradePatterns = [
    { range: '90-100', grade: 'O', point: 10 },
    { range: '80-89.99', grade: 'A+', point: 9 },
    { range: '70-79.99', grade: 'A', point: 8 },
    { range: '60-69.99', grade: 'B+', point: 7 },
    { range: '50-59.99', grade: 'B', point: 6 },
    { range: '45-49.99', grade: 'C', point: 5 },
    { range: '40-44.99', grade: 'P', point: 4 },
    { range: '0-39.99', grade: 'F', point: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div
        ref={marksheetRef}
        className="marksheet-container max-w-4xl mx-auto bg-white shadow-lg"
        style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
      >
        {/* Header Section */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            {/* University Logo Area */}
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-blue-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">PPSU</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">P P SAVANI UNIVERSITY</h1>
                <p className="text-xs text-gray-600">NH 8, GETCO, Near Biltech, Village: Dhamdod Kosamba</p>
                <p className="text-xs text-gray-600">Dist.: Surat - 394125</p>
                <p className="text-xs text-blue-600">www.ppsu.ac.in</p>
              </div>
            </div>
            {/* NAAC Badge */}
            <div className="text-right">
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">
                NAAC A+ GRADE
              </div>
            </div>
          </div>
          {/* Title */}
          <h2 className="text-2xl font-bold text-red-600 text-center mt-4">
            OFFICIAL MARKSHEET
          </h2>
        </div>

        {/* Report Details */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-4">
            <div><strong>Date:</strong> {studentData.date}</div>
            <div><strong>Report No.:</strong> {studentData.reportNo}</div>
          </div>

          {/* Student Information Table */}
          <div className="border border-gray-800 mb-4">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="border-r border-gray-800 px-3 py-2 bg-gray-50 font-semibold w-1/3">NAME OF STUDENT</td>
                  <td className="px-3 py-2">{studentData.studentName}</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="border-r border-gray-800 px-3 py-2 bg-gray-50 font-semibold">ENROLLMENT NO.</td>
                  <td className="px-3 py-2">{studentData.enrollmentNo}</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="border-r border-gray-800 px-3 py-2 bg-gray-50 font-semibold">SEMESTER</td>
                  <td className="px-3 py-2">{studentData.semester}</td>
                </tr>
                <tr>
                  <td className="border-r border-gray-800 px-3 py-2 bg-gray-50 font-semibold">MONTH-YEAR</td>
                  <td className="px-3 py-2">{studentData.academicYear}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Academic Program Information */}
          <div className="border border-gray-800 mb-4">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="border-r border-gray-800 px-3 py-2 bg-gray-50 font-semibold w-1/3">INSTITUTION</td>
                  <td className="px-3 py-2">{studentData.institution}</td>
                </tr>
                <tr>
                  <td className="border-r border-gray-800 px-3 py-2 bg-gray-50 font-semibold">PROGRAMME</td>
                  <td className="px-3 py-2">{studentData.course}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="mb-6">
          <table className="w-full border border-gray-800 text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-800">
                <th className="border-r border-gray-800 px-3 py-2 text-left font-semibold">COURSE CODE</th>
                <th className="border-r border-gray-800 px-3 py-2 text-left font-semibold">COURSE NAME</th>
                <th className="border-r border-gray-800 px-3 py-2 text-left font-semibold">EVALUATION</th>
                <th className="border-r border-gray-800 px-3 py-2 text-center font-semibold">CREDITS</th>
                <th className="px-3 py-2 text-center font-semibold">GRADE</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2">{subject.code}</td>
                  <td className="border-r border-gray-300 px-3 py-2">{subject.name}</td>
                  <td className="border-r border-gray-300 px-3 py-2">{subject.evaluation}</td>
                  <td className="border-r border-gray-300 px-3 py-2 text-center">{subject.credits}</td>
                  <td className="px-3 py-2 text-center font-semibold">{subject.grade}</td>
                </tr>
              ))}
              {/* Empty rows for additional subjects */}
              {Array.from({ length: Math.max(0, 6 - subjects.length) }).map((_, index) => (
                <tr key={`empty-${index}`} className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 h-8"></td>
                  <td className="border-r border-gray-300 px-3 py-2"></td>
                  <td className="border-r border-gray-300 px-3 py-2"></td>
                  <td className="border-r border-gray-300 px-3 py-2"></td>
                  <td className="px-3 py-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Semester Performance */}
          <div className="border border-gray-800">
            <div className="bg-gray-100 border-b border-gray-800 px-3 py-2 font-semibold text-center">
              CURRENT SEMESTER PERFORMANCE
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold">REGISTERED CREDITS</td>
                  <td className="px-3 py-2 text-center">{performance.currentSemester.registeredCredits}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold">EARNED CREDITS</td>
                  <td className="px-3 py-2 text-center">{performance.currentSemester.earnedCredits}</td>
                </tr>
                <tr>
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold">SGPA</td>
                  <td className="px-3 py-2 text-center font-bold">{performance.currentSemester.sgpa.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cumulative Performance */}
          <div className="border border-gray-800">
            <div className="bg-gray-100 border-b border-gray-800 px-3 py-2 font-semibold text-center">
              CUMULATIVE PERFORMANCE
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold">EARNED CREDITS</td>
                  <td className="px-3 py-2 text-center">{performance.cumulative.earnedCredits}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold">CGPA</td>
                  <td className="px-3 py-2 text-center font-bold">{performance.cumulative.cgpa.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border-r border-gray-300 px-3 py-2 bg-gray-50 font-semibold">NO. OF BACKLOGS</td>
                  <td className="px-3 py-2 text-center">{performance.cumulative.backlogs}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Result */}
        <div className="border-2 border-gray-800 mb-6 p-4 text-center">
          <div className="text-lg font-bold mb-2">FINAL RESULT</div>
          <div className="text-xl font-bold text-blue-900">PASSED</div>
        </div>

        {/* Grade Patterns */}
        <div className="mb-6">
          <div className="text-sm font-semibold mb-2 text-center">--GRADE PATTERNS:--</div>
          <table className="w-full border border-gray-800 text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-800">
                <th className="border-r border-gray-800 px-2 py-1 text-left">%MARKS RANGE</th>
                <th className="border-r border-gray-800 px-2 py-1 text-center">GRADE</th>
                <th className="px-2 py-1 text-center">GRADE POINT</th>
              </tr>
            </thead>
            <tbody>
              {gradePatterns.map((pattern, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border-r border-gray-300 px-2 py-1">{pattern.range}</td>
                  <td className="border-r border-gray-300 px-2 py-1 text-center font-semibold">{pattern.grade}</td>
                  <td className="px-2 py-1 text-center">{pattern.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-600 mt-2">*S - Satisfactory, US - Unsatisfactory</p>
        </div>

        {/* Footer Section */}
        <div className="mt-8 border-t-2 border-gray-800 pt-4">
          <div className="flex justify-between items-end">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="border-2 border-gray-400 p-1 bg-white mb-2">
                <QRCode
                  value={
                    // Priority: Explicit QR Value > Hash Value > Report No > Fallback
                    (studentData.qrValue || studentData.hashValue || studentData.reportNo || 'https://ppsu.ac.in')
                  }
                  size={96}
                  level="M"
                />
              </div>
            </div>

            {/* Signature and Seal Area */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 w-48 mt-2 mb-1"></div>
                <p className="text-xs font-semibold">REGISTRAR</p>
                <p className="text-xs">P P SAVANI UNIVERSITY</p>
              </div>
              <div className="w-32 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-50">
                <span className="text-xs text-gray-400 text-center">OFFICIAL<br />SEAL</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 text-xs text-gray-600 text-center border-t border-gray-300 pt-3">
            <p className="mb-1">
              This is a computer generated report, signature is not required. In case of discrepancy office results will be considered as final.
            </p>
            <p>
              Printed on: {studentData.date}, Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Print and Download Buttons */}
      <div className="no-print max-w-4xl mx-auto mt-4 text-center flex justify-center gap-4">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Marksheet
        </button>
      </div>
    </div>
  );
}
