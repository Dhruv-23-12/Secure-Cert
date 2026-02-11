import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import React from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCodeLib from 'qrcode';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CertificateTypeSelector from '../components/CertificateTypeSelector';
import CertificateGenerator from '../components/CertificateGenerator';

const stats = [
  { label: 'Total Certificates', value: 127, change: '+5 from last week' },
  { label: 'Verifications', value: 342, change: '+18 from last week' },
  { label: 'Users', value: 56, change: '+3 from last week' },
  { label: 'Database Size', value: '2.4 GB', change: '+0.3 GB from last month' },
];

const tabs = [
  { name: 'Add Certificate/Bill', key: 'add' },
  { name: 'Manage Certificates', key: 'manage' },
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
`;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add');
  const [showCertificateTypeSelector, setShowCertificateTypeSelector] = useState(false);
  const [selectedCertificateType, setSelectedCertificateType] = useState(null);
  const [activityLog, setActivityLog] = useState(() => {
    // Load from localStorage
    const stored = localStorage.getItem('activityLog');
    return stored ? JSON.parse(stored) : [];
  });

  // Save activity log to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
  }, [activityLog]);

  const handleAddActivity = (activity) => {
    setActivityLog((prev) => [activity, ...prev]);
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
    // You can expand this logic to fetch the file or regenerate the certificate as needed
    // For now, just alert the IRN/hash for demonstration
    alert(`Download for IRN: ${activity.irn}\nHash: ${activity.hash}`);
    // TODO: Integrate with your download logic (e.g., call a backend or reuse handleDownload logic)
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
                handleAddActivity({
                  type: 'Generated',
                  fileName: `${selectedCertificateType}_${certData.studentName}`,
                  fileType: 'certificate',
                  date: new Date().toLocaleString(),
                  irn: certData.id,
                  hash: certData.hashValue || certData.id,
                  certificateType: selectedCertificateType,
                });
                setSelectedCertificateType(null);
              }}
            />
          </div>
        </div>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">All Activity</h2>
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
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.type === 'Generated' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
                      className={`flex-1 px-2 py-2 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none ${
                        !showDeleted
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-transparent text-gray-700 border border-transparent'
                      }`}
                      onClick={() => setShowDeleted(false)}
                    >
                      Show Active
                    </button>
                    <button
                      className={`flex-1 px-2 py-2 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none ${
                        showDeleted
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

  const handleGenerate = () => {
    // Generate IRN first
    const newIrn = generateIRN();
    setIrn(newIrn);
    
    // Generate hash using IRN as part of the data
    const hash = `HASH-${newIrn}-${Math.random().toString(36).substr(2, 10)}`;
    setHashLink(`https://certverify.com/verify/${hash}`);
    setQrValue(hash);
    setShowQR(true);

    // Log activity with IRN
    const activity = {
      type: 'Generated',
      fileName: fileObj.name,
      fileType: fileType,
      date: new Date().toLocaleString(),
      irn: newIrn,
      hash: hash
    };
    onActivity && onActivity(activity);
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