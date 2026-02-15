import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import React from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCodeLib from 'qrcode';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CertificateTypeSelector from '../components/CertificateTypeSelector';
import CertificateGenerator from '../components/CertificateGenerator';
import CertificatePreviewModal from '../components/CertificatePreviewModal';
import jsQR from 'jsqr';

const stats = [
  { label: 'Total Certificates', value: 127, change: '+5 from last week' },
  { label: 'Verifications', value: 342, change: '+18 from last week' },
  { label: 'Users', value: 56, change: '+3 from last week' },
  { label: 'Database Size', value: '2.4 GB', change: '+0.3 GB from last month' },
];

const tabs = [
  { name: 'Add Certificate/Bill', key: 'add' },
  { name: 'Manage Certificates', key: 'manage' },
  { name: 'Verify Certificate', key: 'verify' },
  { name: 'Analytics', key: 'analytics' },
];

// Add this function at the top of your file (or in a utils file and import it)
async function overlayQROnPhoto(photoUrl, qrUrl) {
  return new Promise((resolve, reject) => {
    const photo = new window.Image();
    const qr = new window.Image();
    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded === 2) {
        const canvas = document.createElement('canvas');
        canvas.width = photo.width;
        canvas.height = photo.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(photo, 0, 0);
        const qrSize = Math.floor(Math.min(photo.width, photo.height) * 0.25);
        ctx.drawImage(qr, photo.width - qrSize - 20, photo.height - qrSize - 20, qrSize, qrSize);
        resolve(canvas.toDataURL('image/png'));
      }
    };
    photo.onload = checkLoaded;
    qr.onload = checkLoaded;
    photo.onerror = qr.onerror = reject;
    photo.src = photoUrl;
    qr.src = qrUrl;
  });
}

// Add this style block at the top of your component (after imports, before export default)
const customNavbarStyles = `
  @media (max-width: 900px) {
    .hide-900 { display: none !important; }
    .show-900 { display: flex !important; }
  }
  @media (min-width: 901px) {
    .hide-900 { display: flex !important; }
    .show-900 { display: none !important; }
  }
  @keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add');
  const [showCertificateTypeSelector, setShowCertificateTypeSelector] = useState(false);
  const [selectedCertificateType, setSelectedCertificateType] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [previewCert, setPreviewCert] = useState(null);

  // --- Verify Certificate State ---
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyTab, setVerifyTab] = useState('reference');
  const [verifyQrMode, setVerifyQrMode] = useState('upload');
  const [verifyQrFile, setVerifyQrFile] = useState(null);
  const [verifyQrPreview, setVerifyQrPreview] = useState(null);
  const [verifyQrData, setVerifyQrData] = useState(null);
  const [verifyCameraActive, setVerifyCameraActive] = useState(false);
  const [verifyCameraError, setVerifyCameraError] = useState('');
  const [verifyScanning, setVerifyScanning] = useState(false);
  const [verifyScanStatus, setVerifyScanStatus] = useState('idle');
  const [verifyQrScanning, setVerifyQrScanning] = useState(false);
  const verifyVideoRef = useRef(null);
  const verifyCanvasRef = useRef(null);
  const verifyStreamRef = useRef(null);
  const verifyFileInputRef = useRef(null);

  // Stop camera helper
  const stopVerifyCamera = useCallback(() => {
    if (verifyStreamRef.current) {
      verifyStreamRef.current.getTracks().forEach(track => track.stop());
      verifyStreamRef.current = null;
    }
    setVerifyCameraActive(false);
    setVerifyScanning(false);
    setVerifyScanStatus('idle');
  }, []);

  // Cleanup camera on unmount or tab change
  useEffect(() => {
    return () => stopVerifyCamera();
  }, [stopVerifyCamera]);

  // Scan uploaded image for QR code — aggressive multi-region + grid scanning
  useEffect(() => {
    if (verifyQrFile && verifyQrPreview && verifyQrFile.type.startsWith('image/')) {
      setVerifyQrScanning(true);
      const img = new window.Image();
      img.src = verifyQrPreview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const W = img.width;
        const H = img.height;

        // Helper: try scanning a region with upscaling
        const tryScan = (x, y, w, h) => {
          if (w < 10 || h < 10) return null;
          const scale = Math.max(1, Math.min(4, 1000 / Math.min(w, h)));
          canvas.width = Math.floor(w * scale);
          canvas.height = Math.floor(h * scale);
          context.drawImage(img, x, y, w, h, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
          return code ? code.data : null;
        };

        // 1. Full image
        let result = tryScan(0, 0, W, H);
        if (result) { setVerifyQrData(result); setVerifyQrScanning(false); return; }

        // 2. 3x3 grid scan (covers all areas including center)
        for (let row = 0; row < 3 && !result; row++) {
          for (let col = 0; col < 3 && !result; col++) {
            result = tryScan(
              Math.floor(col * W / 3), Math.floor(row * H / 3),
              Math.floor(W / 3), Math.floor(H / 3)
            );
          }
        }
        if (result) { setVerifyQrData(result); setVerifyQrScanning(false); return; }

        // 3. Overlapping center strips (bottom-center where QR codes often are on certificates)
        const centerRegions = [
          { x: W * 0.25, y: H * 0.6, w: W * 0.5, h: H * 0.4 },   // bottom-center
          { x: W * 0.2, y: H * 0.7, w: W * 0.6, h: H * 0.3 },    // lower-center wide
          { x: W * 0.3, y: H * 0.65, w: W * 0.4, h: H * 0.3 },   // lower-center narrow
          { x: W * 0.35, y: H * 0.7, w: W * 0.3, h: H * 0.25 },  // tight bottom-center
          { x: 0, y: H * 0.65, w: W, h: H * 0.35 },               // full-width bottom strip
          { x: W * 0.25, y: H * 0.25, w: W * 0.5, h: H * 0.5 },  // center of image
        ];
        for (const r of centerRegions) {
          result = tryScan(r.x, r.y, r.w, r.h);
          if (result) { setVerifyQrData(result); setVerifyQrScanning(false); return; }
        }

        // 4. 4x4 grid for very small QR codes
        for (let row = 0; row < 4 && !result; row++) {
          for (let col = 0; col < 4 && !result; col++) {
            result = tryScan(
              Math.floor(col * W / 4), Math.floor(row * H / 4),
              Math.floor(W / 4), Math.floor(H / 4)
            );
          }
        }
        if (result) { setVerifyQrData(result); setVerifyQrScanning(false); return; }

        // 5. Quadrants with overlap
        const quadrants = [
          { x: 0, y: H * 0.4, w: W * 0.6, h: H * 0.6 },         // bottom-left overlap
          { x: W * 0.4, y: H * 0.4, w: W * 0.6, h: H * 0.6 },   // bottom-right overlap
          { x: 0, y: 0, w: W * 0.6, h: H * 0.6 },                // top-left overlap
          { x: W * 0.4, y: 0, w: W * 0.6, h: H * 0.6 },          // top-right overlap
        ];
        for (const r of quadrants) {
          result = tryScan(r.x, r.y, r.w, r.h);
          if (result) { setVerifyQrData(result); setVerifyQrScanning(false); return; }
        }

        setVerifyQrScanning(false);
      };
    }
  }, [verifyQrFile, verifyQrPreview]);

  const handleVerifyFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVerifyQrFile(e.target.files[0]);
      setVerifyQrPreview(URL.createObjectURL(e.target.files[0]));
      setVerifyQrData(null);
      setVerifyResult(null);
    }
  };

  const handleVerifyStartCamera = async () => {
    setVerifyCameraError('');
    setVerifyCameraActive(true);
    setVerifyScanStatus('scanning');
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
      }
      verifyStreamRef.current = stream;
      if (verifyVideoRef.current) {
        verifyVideoRef.current.srcObject = stream;
        await verifyVideoRef.current.play();
        setVerifyScanning(true);
        const checkReady = () => {
          if (verifyVideoRef.current?.readyState >= 2 && verifyVideoRef.current?.videoWidth > 0) {
            scanVerifyQR();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      }
    } catch {
      setVerifyCameraError('Unable to access camera. Please allow camera access.');
      setVerifyCameraActive(false);
      setVerifyScanStatus('error');
    }
  };

  const scanVerifyQR = () => {
    if (!verifyVideoRef.current || !verifyCanvasRef.current) return;
    const video = verifyVideoRef.current;
    const canvas = verifyCanvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (canvas.width === 0 || canvas.height === 0) { setTimeout(scanVerifyQR, 100); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth', threshold: 0.1 });
      if (code) {
        setVerifyScanStatus('found');
        setVerifyScanning(false);
        setVerifyQrData(code.data);
        // Auto-verify after scanning
        handleVerifyCertificate(code.data);
        return;
      }
      requestAnimationFrame(scanVerifyQR);
    } catch {
      setVerifyScanStatus('error');
      setVerifyCameraError('Error scanning QR code.');
      stopVerifyCamera();
    }
  };

  const handleVerifyCertificate = async (scannedData = null) => {
    const certId = scannedData || verifyQrData || verifyQuery.trim();
    if (!certId) {
      setVerifyError('Please enter a Certificate ID, scan a QR code, or upload a QR image.');
      return;
    }
    setVerifyLoading(true);
    setVerifyError('');
    setVerifyResult(null);
    try {
      const response = await fetch(`/api/cert/verify/${encodeURIComponent(certId)}`);
      const data = await response.json();
      if (data.success) {
        setVerifyResult({ ...data.data, found: true });
      } else {
        setVerifyResult({ found: false, status: 'Invalid', message: data.message || 'Certificate not found' });
      }
    } catch {
      setVerifyError('Network error. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const resetVerify = () => {
    setVerifyQuery('');
    setVerifyResult(null);
    setVerifyError('');
    setVerifyQrFile(null);
    setVerifyQrPreview(null);
    setVerifyQrData(null);
    stopVerifyCamera();
  };

  // Fetch certificates from API
  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/cert/list?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('AdminDashboard fetched certificates:', data);
      if (data.success) {
        // Transform API data to match activity log format
        const certs = data.data.certificates.map(cert => ({
          type: 'Generated',
          fileName: `${cert.certificateType}_${cert.studentName}`,
          fileType: 'certificate',
          date: new Date(cert.issueDate).toLocaleString(),
          irn: cert.certificateId,
          hash: cert.hashValue,
          certificateType: cert.certificateType,
          studentName: cert.studentName,
          additionalData: cert.additionalData,
          issueDate: cert.issueDate // Keep original date for preview
        }));
        setActivityLog(certs);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  React.useEffect(() => {
    console.log('AdminDashboard activityLog updated:', activityLog);
  }, [activityLog]);

  React.useEffect(() => {
    fetchCertificates();
    setSearchQuery(''); // Clear search when tab changes
  }, [activeTab]); // Refresh when tab changes

  const handleAddActivity = (activity) => {
    setActivityLog((prev) => [activity, ...prev]);
    fetchCertificates(); // Refresh from server
  };

  // --- QR on Photo Section ---
  const [photoUrl, setPhotoUrl] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  // Handle photo file input
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle QR file input (or use your generated QR code dataURL)
  const handleQRChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setQrUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleOverlay = async () => {
    if (photoUrl && qrUrl) {
      const newImg = await overlayQROnPhoto(photoUrl, qrUrl);
      setResultImage(newImg);
    }
  };

  // Add these new state variables at the top of AdminDashboard component
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedCertificates, setDeletedCertificates] = useState(() => {
    const stored = localStorage.getItem('deletedCertificates');
    return stored ? JSON.parse(stored) : [];
  });

  // Add this state at the top of your AdminDashboard component
  const [showDeleted, setShowDeleted] = useState(false);

  // Add these new functions in AdminDashboard component
  const handleDelete = (certificate) => {
    // Move to deleted certificates
    setDeletedCertificates(prev => [...prev, certificate]);
    // Remove from active certificates
    setActivityLog(prev => prev.filter(item => item.irn !== certificate.irn));

    // Update localStorage
    localStorage.setItem('deletedCertificates', JSON.stringify([...deletedCertificates, certificate]));
    localStorage.setItem('activityLog', JSON.stringify(activityLog.filter(item => item.irn !== certificate.irn)));
  };

  const handleRestore = (certificate) => {
    // Move back to active certificates
    setActivityLog(prev => [...prev, certificate]);
    // Remove from deleted certificates
    setDeletedCertificates(prev => prev.filter(item => item.irn !== certificate.irn));

    // Update localStorage
    localStorage.setItem('activityLog', JSON.stringify([...activityLog, certificate]));
    localStorage.setItem('deletedCertificates', JSON.stringify(deletedCertificates.filter(item => item.irn !== certificate.irn)));
  };

  const handlePermanentDelete = (certificate) => {
    // Remove from deleted certificates
    setDeletedCertificates(prev => prev.filter(item => item.irn !== certificate.irn));
    // Update localStorage
    localStorage.setItem('deletedCertificates', JSON.stringify(deletedCertificates.filter(item => item.irn !== certificate.irn)));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.recipientName || !form.recipientId || !form.certificateType || !form.issueDate) {
      setError('Please fill in all required fields.');
      return;
    }
    // Simulate certificate generation
    const certId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    setQrValue(certId);
    setSuccess('Certificate generated successfully!');
    setForm({
      recipientName: '',
      recipientId: '',
      certificateType: '',
      issueDate: '',
      authority: '',
      details: '',
      validUntil: '',
    });
  };

  function handleActivityDownload(activity) {
    if (activity.type === 'Generated' && activity.certificateType) {
      // Open preview modal
      setPreviewCert({
        certificateType: activity.certificateType,
        certificateId: activity.irn,
        hashValue: activity.hash,
        studentName: activity.studentName,
        issueDate: activity.issueDate,
        additionalData: activity.additionalData || {}
      });
    } else {
      // Fallback for uploaded files (not implemented in this scope)
      alert(`Download not available for this file type yet.\nIRN: ${activity.irn}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col page-fade-in">
      {/* Custom style for 900px breakpoint */}
      <style>{customNavbarStyles}</style>
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-6">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full sm:w-auto">
            <span className="text-3xl font-extrabold text-gray-900 leading-tight">Admin Dashboard</span>
            <span className="text-base text-gray-500 mt-1">Manage certificates and verification system</span>
          </div>
          <button
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition text-base"
            onClick={() => {
              setShowCertificateTypeSelector(true);
              setActiveTab('add');
            }}
          >
            + Generate New Certificate
          </button>
        </div>
      </nav>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 px-2 sm:px-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6 flex flex-col w-full">
            <div className="text-xs text-gray-500 font-medium mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-green-600 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mt-8 px-2 sm:px-4">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 text-sm font-medium focus:outline-none ${activeTab === tab.key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Type Selector Modal */}
      {showCertificateTypeSelector && !selectedCertificateType && (
        <CertificateTypeSelector
          onSelect={(type) => {
            setSelectedCertificateType(type);
            setShowCertificateTypeSelector(false);
          }}
          onClose={() => setShowCertificateTypeSelector(false)}
        />
      )}

      {/* Certificate Generator */}
      {selectedCertificateType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CertificateGenerator
              certificateType={selectedCertificateType}
              onClose={() => {
                setSelectedCertificateType(null);
                setShowCertificateTypeSelector(false);
              }}
              onSuccess={(certData) => {
                // Refresh list
                fetchCertificates();
                setSelectedCertificateType(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <CertificatePreviewModal
          certificateData={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto w-full mt-6 px-2 sm:px-4 flex-1">
        {activeTab === 'add' && !selectedCertificateType && (
          <>
            <div className="bg-white rounded-lg shadow p-4 sm:p-8 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Add Certificate/Bill</h2>
              <AdminUploadSection onActivity={handleAddActivity} />
            </div>
            {/* All Activity Section */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-8 space-y-4 mt-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Activity ({activityLog.length})
                </h2>
                <button
                  onClick={fetchCertificates}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Refresh List
                </button>
              </div>

              {activityLog.length === 0 ? (
                <div className="text-gray-500">No activity yet.</div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">File Name</th>
                        <th className="px-4 py-2 text-left">File Type</th>
                        <th className="px-4 py-2 text-left">IRN</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((item, idx) => (
                        <tr key={item.irn || idx} className="border-b">
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'Generated' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-2">{item.fileName}</td>
                          <td className="px-4 py-2">{item.fileType}</td>
                          <td className="px-4 py-2 font-mono text-sm">
                            {item.irn ? (
                              <span className="text-indigo-600">{item.irn}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2">{item.date}</td>
                          <td className="px-4 py-2">
                            <button
                              className={`px-3 py-1 rounded text-white font-semibold shadow ${item.type === 'Generated' && item.irn && item.hash ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
                              disabled={!(item.type === 'Generated' && item.irn && item.hash)}
                              onClick={() => handleActivityDownload(item)}
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Manage Certificates</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto sm:mb-0 mb-3">
                  <input
                    type="text"
                    placeholder="Search by reference number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                    style={{ minWidth: 0 }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                      aria-label="Clear search"
                    >
                      &#10005;
                    </button>
                  )}
                </div>
                <div className="flex w-full sm:w-auto justify-center sm:justify-start">
                  <div className="flex w-full max-w-xs sm:max-w-none bg-gray-100 rounded-full p-1 gap-1 sm:w-auto sm:ml-2">
                    <button
                      className={`flex-1 px-2 py-2 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none ${!showDeleted
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-transparent text-gray-700 border border-transparent'
                        }`}
                      onClick={() => setShowDeleted(false)}
                    >
                      Show Active
                    </button>
                    <button
                      className={`flex-1 px-2 py-2 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none ${showDeleted
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-transparent text-gray-700 border border-transparent'
                        }`}
                      onClick={() => setShowDeleted(true)}
                    >
                      Show Deleted
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            {!showDeleted ? (
              <>
                {activityLog.length === 0 ? (
                  <div className="text-gray-500">No active certificates.</div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left">File Name</th>
                          <th className="px-4 py-2 text-left">File Type</th>
                          <th className="px-4 py-2 text-left">IRN</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLog
                          .filter(item =>
                            (item.irn || '').toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="px-4 py-2">{item.fileName}</td>
                              <td className="px-4 py-2">{item.fileType}</td>
                              <td className="px-4 py-2 font-mono text-sm">
                                {item.irn ? (
                                  <span className="text-indigo-600">{item.irn}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2">{item.date}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-md font-medium text-gray-700 mb-4">Deleted Certificates</h3>
                {deletedCertificates.length === 0 ? (
                  <div className="text-gray-500">No deleted certificates.</div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left">File Name</th>
                          <th className="px-4 py-2 text-left">File Type</th>
                          <th className="px-4 py-2 text-left">IRN</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deletedCertificates
                          .filter(item =>
                            (item.irn || '').toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((item, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="px-4 py-2">{item.fileName}</td>
                              <td className="px-4 py-2">{item.fileType}</td>
                              <td className="px-4 py-2 font-mono text-sm">
                                {item.irn ? (
                                  <span className="text-indigo-600">{item.irn}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2">{item.date}</td>
                              <td className="px-4 py-2">
                                <div className="flex flex-col items-start gap-2">
                                  <button
                                    onClick={() => handleRestore(item)}
                                    className="px-4 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700 transition w-fit"
                                    style={{ minWidth: 120 }}
                                  >
                                    Restore
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDelete(item)}
                                    className="px-4 py-2 bg-red-600 text-white rounded font-semibold shadow hover:bg-red-700 transition w-fit"
                                    style={{ minWidth: 160 }}
                                  >
                                    Delete Permanently
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {activeTab === 'verify' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Verify Certificate</h2>
              {(verifyResult || verifyQrData || verifyQuery) && (
                <button onClick={resetVerify} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Reset</button>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-6">Enter a reference number or scan a QR code to check if a certificate is valid.</p>

            {/* Sub-tabs: Reference Number | QR Code */}
            <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
              <button
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${verifyTab === 'reference' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-500 hover:text-gray-700'}`}
                onClick={() => { setVerifyTab('reference'); stopVerifyCamera(); }}
              >
                📝 Reference Number
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${verifyTab === 'qr' ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-gray-500 hover:text-gray-700'}`}
                onClick={() => setVerifyTab('qr')}
              >
                📷 QR Code Scanner
              </button>
            </div>

            {/* Reference Number Input */}
            {verifyTab === 'reference' && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="text"
                  placeholder="e.g. PPSU-CERT-2026-XXXXXX"
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCertificate()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-mono"
                />
                <button
                  onClick={() => handleVerifyCertificate()}
                  disabled={verifyLoading || !verifyQuery.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {verifyLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Verifying...
                    </span>
                  ) : '🔍 Verify'}
                </button>
              </div>
            )}

            {/* QR Code Scanner */}
            {verifyTab === 'qr' && (
              <div className="mb-6">
                {/* QR Mode Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 px-4 font-semibold transition ${verifyQrMode === 'upload' ? 'bg-white border-indigo-300 text-indigo-700 shadow' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                    onClick={() => { setVerifyQrMode('upload'); stopVerifyCamera(); }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload QR Image
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 px-4 font-semibold transition ${verifyQrMode === 'camera' ? 'bg-gray-900 border-gray-900 text-white shadow' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                    onClick={() => setVerifyQrMode('camera')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Scan with Camera
                  </button>
                </div>

                {/* Upload QR Image */}
                {verifyQrMode === 'upload' && (
                  <>
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50 py-8 px-4 mb-4 cursor-pointer hover:border-indigo-400 transition"
                      onClick={() => verifyFileInputRef.current?.click()}
                    >
                      <input type="file" ref={verifyFileInputRef} className="hidden" accept="image/*" onChange={handleVerifyFileChange} />
                      <svg className="w-12 h-12 text-indigo-400 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm text-center">Click to upload a QR code image</p>
                    </div>
                    {verifyQrFile && (
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="text-sm text-gray-600">
                          File: <span className="font-medium">{verifyQrFile.name}</span>
                        </div>
                        {verifyQrFile.type.startsWith('image/') && verifyQrPreview && (
                          <img src={verifyQrPreview} alt="QR Preview" className="max-h-40 rounded shadow" />
                        )}
                        {verifyQrScanning && (
                          <div className="text-indigo-600 text-sm bg-indigo-50 p-2 rounded flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                            Scanning image for QR code...
                          </div>
                        )}
                        {verifyQrData && (
                          <div className="text-green-600 text-sm bg-green-50 p-2 rounded flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            QR Code detected! Data: <span className="font-mono text-xs">{verifyQrData}</span>
                          </div>
                        )}
                        {!verifyQrData && !verifyQrScanning && (
                          <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Could not auto-detect QR code. Try camera scan or use Reference Number tab.
                          </div>
                        )}
                      </div>
                    )}
                    {verifyQrFile && !verifyQrScanning && (
                      <button
                        onClick={() => handleVerifyCertificate()}
                        disabled={verifyLoading || !verifyQrData}
                        className={`w-full px-6 py-3 rounded-lg font-semibold shadow transition ${verifyQrData ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                      >
                        {verifyLoading ? 'Verifying...' : verifyQrData ? '🔍 Verify Scanned QR Code' : '🔍 No QR Data Found'}
                      </button>
                    )}
                  </>
                )}

                {/* Camera Scanner */}
                {verifyQrMode === 'camera' && (
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center py-6 px-4">
                    {!verifyCameraActive ? (
                      <>
                        <p className="text-gray-700 text-sm mb-3">Scan a QR code using your camera</p>
                        <button
                          className="flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition text-sm"
                          onClick={handleVerifyStartCamera}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          Start Camera
                        </button>
                      </>
                    ) : (
                      <div className="relative w-full max-w-lg">
                        <video ref={verifyVideoRef} className="w-full h-[400px] object-cover rounded-lg" autoPlay playsInline />
                        <canvas ref={verifyCanvasRef} className="hidden" />
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-56 h-56 border-2 ${verifyScanStatus === 'found' ? 'border-green-500' : 'border-white'} rounded-lg relative transition-colors`}>
                            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${verifyScanStatus === 'found' ? 'border-green-500' : 'border-white'}`}></div>
                            <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${verifyScanStatus === 'found' ? 'border-green-500' : 'border-white'}`}></div>
                            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${verifyScanStatus === 'found' ? 'border-green-500' : 'border-white'}`}></div>
                            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${verifyScanStatus === 'found' ? 'border-green-500' : 'border-white'}`}></div>
                            {verifyScanStatus === 'scanning' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-1 bg-white bg-opacity-50 rounded-full overflow-hidden">
                                  <div className="h-full bg-white" style={{ animation: 'scan 1.5s linear infinite' }}></div>
                                </div>
                              </div>
                            )}
                            {verifyScanStatus === 'found' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Status bar */}
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <p className={`text-sm py-2 px-4 rounded-full inline-block ${verifyScanStatus === 'found' ? 'bg-green-500 bg-opacity-70 text-white'
                            : verifyScanStatus === 'error' ? 'bg-red-500 bg-opacity-70 text-white'
                              : 'bg-black bg-opacity-50 text-white'
                            }`}>
                            {verifyScanStatus === 'scanning' && 'Scanning for QR code...'}
                            {verifyScanStatus === 'found' && 'QR code found! Verifying...'}
                            {verifyScanStatus === 'error' && 'Error scanning'}
                            {verifyScanStatus === 'idle' && 'Position QR code within the frame'}
                          </p>
                        </div>
                        {/* Stop button */}
                        <div className="absolute top-3 right-3">
                          <button className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg" onClick={stopVerifyCamera}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {verifyCameraError && <div className="text-red-500 text-xs mt-2">{verifyCameraError}</div>}
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {verifyError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {verifyError}
              </div>
            )}

            {/* Result */}
            {verifyResult && (
              <div className={`rounded-xl border-2 p-6 transition-all duration-300 ${verifyResult.status === 'Valid'
                ? 'border-green-400 bg-green-50'
                : verifyResult.status === 'Tampered'
                  ? 'border-yellow-400 bg-yellow-50'
                  : verifyResult.status === 'Revoked'
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-red-400 bg-red-50'
                }`}>
                {/* Status Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {verifyResult.status === 'Valid' ? '✅' : verifyResult.status === 'Tampered' ? '⚠️' : verifyResult.status === 'Revoked' ? '🚫' : '❌'}
                  </span>
                  <div>
                    <h3 className={`text-xl font-bold ${verifyResult.status === 'Valid' ? 'text-green-800'
                      : verifyResult.status === 'Tampered' ? 'text-yellow-800'
                        : verifyResult.status === 'Revoked' ? 'text-gray-700'
                          : 'text-red-800'
                      }`}>
                      Certificate is {verifyResult.status}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {verifyResult.status === 'Valid' && 'This certificate is authentic and has not been tampered with.'}
                      {verifyResult.status === 'Tampered' && 'Warning: The certificate data has been modified. Hash mismatch detected.'}
                      {verifyResult.status === 'Revoked' && 'This certificate has been revoked by the issuing authority.'}
                      {verifyResult.status === 'Invalid' && (verifyResult.message || 'No certificate found with this ID.')}
                    </p>
                  </div>
                </div>

                {/* Certificate Details */}
                {verifyResult.found && verifyResult.status !== 'Invalid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Certificate ID</span>
                      <p className="font-mono text-sm font-semibold text-indigo-700">{verifyResult.certificateId}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Student Name</span>
                      <p className="font-semibold text-gray-900">{verifyResult.studentName}</p>
                    </div>
                    {verifyResult.enrollmentNo && (
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Enrollment No</span>
                        <p className="font-semibold text-gray-900">{verifyResult.enrollmentNo}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Course / Type</span>
                      <p className="font-semibold text-gray-900">{verifyResult.course || verifyResult.certificateType}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Issue Date</span>
                      <p className="font-semibold text-gray-900">{new Date(verifyResult.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Issuing Authority</span>
                      <p className="font-semibold text-gray-900">{verifyResult.issuingAuthority || 'P P SAVANI UNIVERSITY'}</p>
                    </div>
                    {verifyResult.hashVerification && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Hash Verification</span>
                        <p className={`text-sm font-medium ${verifyResult.hashVerification.isValid ? 'text-green-700' : 'text-red-700'}`}>
                          {verifyResult.hashVerification.isValid ? '✓ ' : '✗ '}
                          {verifyResult.hashVerification.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!verifyResult && !verifyError && !verifyLoading && !verifyCameraActive && (
              <div className="text-center py-10 text-gray-400">
                <div className="text-5xl mb-3">🔐</div>
                <p className="text-lg font-medium">Enter a certificate ID or scan a QR code to verify</p>
                <p className="text-sm mt-1">Results will appear here</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statsPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {statsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminUploadSection({ onActivity }) {
  const fileInputRef = React.useRef();
  const cameraInputRef = React.useRef();
  const [message, setMessage] = React.useState('');
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [fileType, setFileType] = React.useState('');
  const [issuedDate, setIssuedDate] = React.useState(new Date());
  const [showQR, setShowQR] = React.useState(false);
  const [hashLink, setHashLink] = React.useState('');
  const [qrValue, setQrValue] = React.useState('');
  const [fileObj, setFileObj] = React.useState(null);
  const [downloading, setDownloading] = React.useState(false);
  const [irn, setIrn] = React.useState('');

  // Function to generate IRN
  const generateIRN = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const year = new Date().getFullYear().toString().substr(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    // Format: YYMM-XXXXXX-XXXXXX (YearMonth-Random-Timestamp)
    return `${year}${month}-${random}-${timestamp.substr(-6)}`;
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessage(`File received: ${file.name}`);
      setFileType(file.type);
      setFileObj(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIssuedDate(new Date());
      setShowQR(false);
      setHashLink('');
      setQrValue('');
      setIrn(''); // Reset IRN when new file is uploaded
      // Log activity
      const activity = {
        type: 'Upload',
        fileName: file.name,
        fileType: file.type,
        date: new Date().toLocaleString(),
      };
      onActivity && onActivity(activity);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileType('');
    setMessage('');
    setShowQR(false);
    setHashLink('');
    setQrValue('');
    setFileObj(null);
  };

  const handleGenerate = async () => {
    try {
      // Prepare data for API
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login as admin first');
        return;
      }

      // Generate a temporary ID for the certificate request
      const tempId = generateIRN();

      const response = await fetch('/api/cert/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          certificateId: tempId, // Optional: let backend generate or use this
          studentName: fileObj.name.split('.')[0], // Use filename as student name for now
          issueDate: issuedDate,
          // Add other fields as needed
          additionalData: {
            fileName: fileObj.name,
            fileType: fileType
          }
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate certificate');
      }

      const certData = data.data.certificate;
      const newIrn = certData.certificateId;
      setIrn(newIrn);

      // Use the Certificate ID as the QR value so scanner can verify it
      const qrData = newIrn;
      // Verification link
      setHashLink(`${window.location.protocol}//${window.location.host}/verify/${newIrn}`);
      setQrValue(qrData);
      setShowQR(true);

      // Log activity
      const activity = {
        type: 'Generated',
        fileName: fileObj.name,
        fileType: fileType,
        date: new Date(certData.issueDate).toLocaleString(),
        irn: newIrn,
        hash: certData.hashValue
      };
      onActivity && onActivity(activity);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error generating certificate: ' + error.message);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    if (fileType.startsWith('image/')) {
      // Draw image at the top, QR and hash in a new row at the bottom
      const img = new window.Image();
      img.src = previewUrl;
      img.onload = () => {
        const qrSize = 80;
        const padding = 20;
        const hashFontSize = 16;
        // Calculate new canvas height: image + padding + QR + padding
        const width = Math.max(img.width, 400);
        const qrRowHeight = Math.max(qrSize, hashFontSize + 16) + padding * 2;
        const height = img.height + qrRowHeight;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // White background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        // Draw image at the top, centered
        ctx.drawImage(img, (width - img.width) / 2, 0);
        // Draw QR code using qrcode package
        const qrCanvas = document.createElement('canvas');
        qrCanvas.width = qrCanvas.height = qrSize;
        QRCodeLib.toCanvas(qrCanvas, qrValue, { width: qrSize }, (error) => {
          if (!error) {
            // Draw QR at left in the new row
            const qrY = img.height + padding;
            ctx.drawImage(qrCanvas, padding, qrY);
            // Draw hash text next to QR
            ctx.font = `${hashFontSize}px monospace`;
            ctx.fillStyle = '#333';
            ctx.textBaseline = 'middle';
            ctx.fillText(hashLink, padding + qrSize + 16, qrY + qrSize / 2);
            // Download
            const link = document.createElement('a');
            link.download = 'certificate_with_qr.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            setDownloading(false);
          }
        });
      };
    } else if (fileType === 'application/pdf') {
      // PDF workflow using pdf-lib
      const arrayBuffer = await fileObj.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const [origPage] = pdfDoc.getPages();
      const origWidth = origPage.getWidth();
      const origHeight = origPage.getHeight();
      const extraHeight = 120; // Space for QR/hash
      // Create a new page with extra height
      const newPage = pdfDoc.addPage([origWidth, origHeight + extraHeight]);
      // Copy original page content to new page
      const origPageEmbed = await pdfDoc.embedPage(origPage);
      newPage.drawPage(origPageEmbed, {
        x: 0,
        y: extraHeight,
        width: origWidth,
        height: origHeight,
      });
      // Generate QR code as data URL using qrcode package
      const qrCanvas = document.createElement('canvas');
      qrCanvas.width = qrCanvas.height = 80;
      await new Promise((resolve) => {
        QRCodeLib.toCanvas(qrCanvas, qrValue, { width: 80 }, resolve);
      });
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      const qrImageBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer());
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      // Draw QR and hash in the new space at the bottom
      const padding = 20;
      const qrY = padding;
      const qrX = padding;
      newPage.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: 80,
        height: 80,
      });
      newPage.drawText(hashLink, {
        x: qrX + 90,
        y: qrY + 30,
        size: 12,
        color: rgb(0, 0, 0),
      });
      // Remove the original page
      pdfDoc.removePage(0);
      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'certificate_with_qr.pdf';
      link.click();
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onClick={() => fileInputRef.current.click()}
          type="button"
        >
          Upload File
        </button>
        <input
          type="file"
          accept="image/*,application/pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleUpload}
        />
        <button
          className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onClick={() => cameraInputRef.current.click()}
          type="button"
        >
          Take Photo
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {message && <div className="text-sm text-gray-700 mt-2">{message}</div>}
      {previewUrl && (
        <div className="mt-4 flex flex-col items-center">
          <div className="font-medium text-gray-800 mb-2 flex items-center gap-4">
            Preview
            <button
              className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold shadow"
              onClick={handleRemove}
              type="button"
            >
              Remove
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 flex justify-center items-center shadow-md w-full max-w-lg">
            {fileType.startsWith('image/') ? (
              <img src={previewUrl} alt="Preview" className="max-h-64 max-w-full rounded shadow" />
            ) : fileType === 'application/pdf' ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-full"
                style={{ background: '#222', borderRadius: '1rem', padding: '2rem 1rem', color: '#fff', minHeight: '180px', textDecoration: 'none' }}
              >
                <span style={{ marginBottom: '1rem', opacity: 0.5 }}>PDF</span>
                <span style={{ wordBreak: 'break-all', fontSize: '0.9rem', marginBottom: '1rem' }}>{fileObj?.name || 'PDF File'}</span>
                <span
                  style={{
                    background: '#a5b4fc',
                    color: '#222',
                    border: 'none',
                    borderRadius: '1rem',
                    padding: '0.75rem 2.5rem',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'inline-block',
                  }}
                >
                  Open
                </span>
              </a>
            ) : (
              <span className="text-gray-500">No preview available</span>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-semibold">Issued Date:</span> {issuedDate.toLocaleDateString()} {issuedDate.toLocaleTimeString()}
          </div>
          <button
            className="mt-4 px-6 py-2 bg-indigo-700 text-white rounded-lg font-semibold shadow hover:bg-indigo-800 transition"
            onClick={handleGenerate}
            type="button"
          >
            Generate Certificate with QR/Hash
          </button>
          {showQR && (
            <div className="mt-6 flex flex-col items-center">
              <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-indigo-700">Certificate Reference Number (IRN)</span>
                </div>
                <div className="text-2xl font-mono font-bold text-indigo-900 tracking-wider">
                  {irn}
                </div>
              </div>
              <div className="mb-2 font-semibold text-gray-800">QR Code & Hash Link</div>
              <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
                <QRCode value={qrValue} size={120} />
                <a
                  href={hashLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-indigo-600 hover:underline break-all text-sm"
                >
                  {hashLink}
                </a>
                <button
                  className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                  onClick={handleDownload}
                  type="button"
                  disabled={downloading}
                >
                  {downloading ? 'Preparing...' : 'Download Document with QR & Hash'}
                </button>
                {fileType === 'application/pdf' && (
                  <div className="mt-2 text-xs text-gray-500">PDF download requires <code>pdf-lib</code>. See code for details.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Pie chart helpers
const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
const statsPieData = [
  { name: 'Total Certificates', value: 127 },
  { name: 'Verifications', value: 342 },
  { name: 'Users', value: 56 },
  { name: 'Database Size (GB)', value: 2.4 },
];

// Note: You must install recharts for the pie chart to work:
// npm install recharts 