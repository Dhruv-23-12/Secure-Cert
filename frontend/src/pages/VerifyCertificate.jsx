import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserActivity from '../components/UserActivity';
import jsQR from 'jsqr';

const scanningStyles = `
@keyframes scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-scan { animation: scan 1.5s linear infinite; }
`;

export default function VerifyCertificate() {
  const navigate = useNavigate();
  const { certificateId } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState('reference');
  const [reference, setReference] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrMode, setQrMode] = useState('upload');
  const [cameraActive, setCameraActive] = useState(false);
  const [qrData, setQrData] = useState(null); // QR data from camera scan
  const [cameraError, setCameraError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [scanningStatus, setScanningStatus] = useState('idle');
  const [scanAttempts, setScanAttempts] = useState(0);
  const scanningTimeoutRef = useRef(null);
  const [userActivities, setUserActivities] = useState(() => {
    const stored = localStorage.getItem('userActivities');
    return stored ? JSON.parse(stored) : [];
  });

  // Add styles to document when component mounts
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = scanningStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('userActivities', JSON.stringify(userActivities));
  }, [userActivities]);

  useEffect(() => {
    if (certificateId) {
      if (certificateId === 'demo-certificate') {
        // Simulate a successful verification for the demo
        setLoading(true);
        setTimeout(() => {
          setVerificationResult({
            isValid: true,
            message: 'Certificate is valid and authentic. (DEMO)',
            details: {
              certificateId: 'DEMO-CERT-2026',
              recipientName: 'John Doe',
              certificateType: 'Hackathon Participation',
              issueDate: new Date().toISOString(),
              issuingAuthority: 'SecureCert Demo Authority'
            }
          });
          setLoading(false);
        }, 800);
      } else {
        setReference(certificateId);
      }
    }
  }, [certificateId]);

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      // Store the current URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
    }
  }, [user, navigate]);

  // If not logged in, don't render the component
  if (!user) {
    return null;
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setQrFile(e.target.files[0]);
      setQrPreview(URL.createObjectURL(e.target.files[0]));
      setQrData(null); // Reset previous scan data
      setVerificationResult(null); // Reset previous verification
    }
  };

  // Scan uploaded image for QR code
  useEffect(() => {
    if (qrFile && qrPreview && qrFile.type.startsWith('image/')) {
      const img = new Image();
      img.src = qrPreview;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code) {
          setQrData(code.data);
          // Optional: Visualize success
        } else {
          // console.log("No QR code found in uploaded image");
        }
      };
    }
  }, [qrFile, qrPreview]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
    setScanningStatus('idle');
    setScanAttempts(0);
    if (scanningTimeoutRef.current) {
      clearTimeout(scanningTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Only enable verification if we have a reference number OR successfully scanned QR data
  // Just having a file (qrFile) is not enough if we couldn't read the QR code
  const hasInputForVerification =
    (reference && reference.trim().length > 0) || qrData;

  const handleStartCamera = async () => {
    setCameraError('');
    setCameraActive(true);
    setScanningStatus('scanning');
    let triedUserCamera = false;
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (err) {
        triedUserCamera = true;
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        const checkReady = () => {
          if (
            videoRef.current.readyState >= 2 &&
            videoRef.current.videoWidth > 0 &&
            videoRef.current.videoHeight > 0
          ) {
            scanQRCode();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      }
    } catch (err) {
      setCameraError(triedUserCamera
        ? 'Unable to access camera. Please allow camera access or try a different device.'
        : 'Unable to access back camera. Trying front camera...');
      setCameraActive(false);
      setScanningStatus('error');
    }
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (canvas.width === 0 || canvas.height === 0) {
      setTimeout(scanQRCode, 100);
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
        threshold: 0.1
      });
      if (code) {
        setScanningStatus('found');
        setScanning(false);
        setQrData(code.data);
        return;
      }
      setScanAttempts(prev => prev + 1);
      if (scanning) {
        requestAnimationFrame(scanQRCode);
      }
    } catch (error) {
      setScanningStatus('error');
      setCameraError('Error scanning QR code. Please try again.');
      stopCamera();
    }
  };

  const handleVerify = async (scannedData = null) => {
    const trimmedReference = reference.trim();
    const effectiveQrData = scannedData || qrData;

    // Check if we have valid input
    if (!trimmedReference && !effectiveQrData) {
      // If a file was uploaded but no QR data was extracted, show specific error
      if (qrFile && !effectiveQrData) {
        setVerificationResult({
          isValid: false,
          message: 'Could not automatically detect a QR code. Please ensure the image is clear or try entering the Reference Number manually.',
          details: null
        });
      }
      return;
    }

    setLoading(true);
    setVerificationResult(null);
    try {
      const formData = new FormData();

      if (trimmedReference) {
        formData.append('referenceNumber', trimmedReference);
      }
      if (effectiveQrData) {
        formData.append('qrData', effectiveQrData);
      }
      if (qrFile) {
        formData.append('file', qrFile);
      }

      const response = await fetch('/api/cert/verify', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      const data = await response.json();

      const isValid =
        typeof data.valid === 'boolean'
          ? data.valid
          : typeof data.isValid === 'boolean'
            ? data.isValid
            : false;

      const details = isValid
        ? {
          certificateId:
            data.certificateId ||
            data.id ||
            trimmedReference ||
            effectiveQrData ||
            (qrFile && qrFile.name) ||
            '-',
          recipientName: data.recipientName || data.holderName || '-',
          certificateType: data.certificateType || data.type || '-',
          issueDate: data.issueDate || data.issuedAt || '-',
          issuingAuthority: data.issuingAuthority || data.issuer || '-',
          additionalData: data.additionalData || {},
        }
        : null;

      setVerificationResult({
        isValid,
        message:
          (isValid
            ? data.message || 'Certificate is valid and authentic.'
            : data.reason || data.message || 'Certificate is invalid.') ||
          '',
        details,
      });

      // Add to user activity
      setUserActivities(prev =>
        [
          {
            certificateId:
              details?.certificateId ||
              trimmedReference ||
              effectiveQrData ||
              (qrFile && qrFile.name) ||
              '-',
            holderName: details?.recipientName || '-',
            isValid,
            verifiedAt: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 10)
      );
    } catch (error) {
      setVerificationResult({
        isValid: false,
        message: 'An error occurred during verification. Please try again.',
        details: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
        Certificate Verification
      </h1>
      <p className="text-gray-500 text-center mb-8 max-w-xl">
        Verify the authenticity of a certificate by scanning the QR code or entering the reference number
      </p>
      {user.role === 'user' ? (
        <>
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 mb-10">
            <h2 className="text-lg font-semibold mb-1">Verify Certificate</h2>
            <p className="text-gray-500 text-sm mb-4">
              Enter the certificate reference number or scan the QR code
            </p>
            <div className="flex mb-4 rounded-lg overflow-hidden border border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === 'reference'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-white text-gray-500'
                  }`}
                onClick={() => setTab('reference')}
              >
                Reference Number
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === 'qr'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-white text-gray-500'
                  }`}
                onClick={() => setTab('qr')}
              >
                QR Code
              </button>
            </div>
            {tab === 'reference' ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Reference Number (IRN)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter the certificate reference number"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                />
              </>
            ) : (
              <>
                {/* QR Code Mode Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-2 border rounded-md py-2 px-4 font-semibold transition ${qrMode === 'upload'
                      ? 'bg-white border-gray-300 text-gray-900 shadow'
                      : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}
                    onClick={() => setQrMode('upload')}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v16h16V4H4zm4 8h8m-4-4v8"
                      />
                    </svg>
                    Upload QR Code
                  </button>
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-2 border rounded-md py-2 px-4 font-semibold transition ${qrMode === 'camera'
                      ? 'bg-black text-white border-gray-900 shadow'
                      : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}
                    onClick={() => setQrMode('camera')}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                      />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Scan with Camera
                  </button>
                </div>
                {/* Upload QR Code Section */}
                {qrMode === 'upload' && (
                  <>
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50 py-8 px-2 mb-4 cursor-pointer hover:border-indigo-400 transition shadow-sm w-full max-w-md mx-auto"
                      onClick={handleUploadClick}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <svg
                        className="w-14 h-14 text-indigo-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                        />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <p className="text-gray-500 text-center text-sm mb-3">
                        Click or drag file to upload
                        <br />
                        (PDF, ZIP, image, etc.)
                      </p>
                      <button
                        type="button"
                        className="w-full mt-2 flex items-center justify-center gap-2 border border-indigo-300 rounded-xl py-3 px-4 font-semibold text-indigo-700 bg-white hover:bg-indigo-50 transition text-base shadow"
                        onClick={e => {
                          e.stopPropagation();
                          handleUploadClick();
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 4v16h16V4H4zm4 8h8m-4-4v8"
                          />
                        </svg>
                        Upload File
                      </button>
                    </div>
                    {qrFile && (
                      <div className="flex flex-col items-center mb-4">
                        <div className="text-center text-sm text-gray-600 mb-2">
                          Selected file:{' '}
                          <span className="font-medium">{qrFile.name}</span>
                          <span className="ml-2 text-xs text-gray-400">
                            ({qrFile.type || 'Unknown type'})
                          </span>
                        </div>
                        {qrFile.type && !qrFile.type.startsWith('image/') && (
                          <div className="text-amber-600 text-sm mb-2 bg-amber-50 p-2 rounded">
                            Note: Automatic QR scanning is only available for image files.
                            For PDFs, please enter the Reference Number manually or convert to image.
                          </div>
                        )}
                        {qrData && qrFile.type && qrFile.type.startsWith('image/') && (
                          <div className="text-green-600 text-sm mb-2 bg-green-50 p-2 rounded flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            QR Code detected in image!
                          </div>
                        )}
                        {qrFile.type && qrFile.type.startsWith('image/') && (
                          <img
                            src={qrPreview}
                            alt="File Preview"
                            className="max-h-40 rounded shadow"
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
                {/* Scan with Camera Section */}
                {qrMode === 'camera' && (
                  <>
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center py-6 px-4 mb-4">
                      {!cameraActive ? (
                        <>
                          <p className="text-gray-700 text-sm mb-3">
                            Scan a QR code using your camera
                          </p>
                          <button
                            className="flex items-center gap-2 bg-indigo-600 text-white font-medium px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                            onClick={handleStartCamera}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                              />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            Start Camera
                          </button>
                        </>
                      ) : (
                        <div className="relative w-full max-w-md">
                          <video
                            ref={videoRef}
                            className="w-full h-[400px] object-cover rounded-lg"
                            autoPlay
                            playsInline
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          {/* Scanning overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`w-64 h-64 border-2 ${scanningStatus === 'found'
                                ? 'border-green-500'
                                : 'border-white'
                                } rounded-lg relative transition-colors duration-300`}
                            >
                              <div
                                className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${scanningStatus === 'found'
                                  ? 'border-green-500'
                                  : 'border-white'
                                  } transition-colors duration-300`}
                              ></div>
                              <div
                                className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${scanningStatus === 'found'
                                  ? 'border-green-500'
                                  : 'border-white'
                                  } transition-colors duration-300`}
                              ></div>
                              <div
                                className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${scanningStatus === 'found'
                                  ? 'border-green-500'
                                  : 'border-white'
                                  } transition-colors duration-300`}
                              ></div>
                              <div
                                className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${scanningStatus === 'found'
                                  ? 'border-green-500'
                                  : 'border-white'
                                  } transition-colors duration-300`}
                              ></div>
                              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                              {scanningStatus === 'scanning' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-1 bg-white bg-opacity-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-white animate-scan"></div>
                                  </div>
                                </div>
                              )}
                              {scanningStatus === 'found' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-8 h-8 text-green-500"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p
                              className={`text-sm py-2 px-4 rounded-full inline-block ${scanningStatus === 'found'
                                ? 'bg-green-500 bg-opacity-50 text-white'
                                : scanningStatus === 'error'
                                  ? 'bg-red-500 bg-opacity-50 text-white'
                                  : 'bg-black bg-opacity-50 text-white'
                                }`}
                            >
                              {scanningStatus === 'scanning' &&
                                'Scanning for QR code...'}
                              {scanningStatus === 'found' &&
                                'QR code found! You can now verify below.'}
                              {scanningStatus === 'error' &&
                                'Error scanning QR code'}
                              {scanningStatus === 'idle' &&
                                'Position QR code within the frame'}
                            </p>
                          </div>
                          <div className="absolute top-4 right-4">
                            <button
                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                              onClick={stopCamera}
                            >
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      {cameraError && (
                        <div className="text-red-500 text-xs mt-2">
                          {cameraError}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs text-center">
                      Position the QR code within the camera view
                    </p>
                  </>
                )}
              </>
            )}
            {/* Primary verify button centered below input / upload section */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${hasInputForVerification && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
                disabled={!hasInputForVerification || loading}
                onClick={() => handleVerify()}
              >
                {loading && (
                  <svg
                    className="w-5 h-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                <span>Verify Certificate</span>
              </button>
            </div>
          </div>
          {verificationResult && (
            <div className="w-full max-w-xl mb-10">
              <div
                className={`rounded-xl shadow-lg p-6 border ${verificationResult.isValid
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
                  }`}
              >
                <div className="flex items-center mb-3">
                  <span
                    className={`mr-2 rounded-full p-1 ${verificationResult.isValid
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                      }`}
                  >
                    {verificationResult.isValid ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </span>
                  <h3 className="text-lg font-semibold">
                    {verificationResult.isValid
                      ? 'Valid Certificate'
                      : 'Invalid Certificate'}
                  </h3>
                </div>
                {verificationResult.message && (
                  <p className="text-sm text-gray-700 mb-4">
                    {verificationResult.message}
                  </p>
                )}
                {verificationResult.isValid && verificationResult.details && (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-600">
                        Certificate ID
                      </dt>
                      <dd className="text-gray-900">
                        {verificationResult.details.certificateId}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">
                        Recipient Name
                      </dt>
                      <dd className="text-gray-900">
                        {verificationResult.details.recipientName}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">
                        Certificate Type
                      </dt>
                      <dd className="text-gray-900">
                        {verificationResult.details.certificateType}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">
                        Issue Date
                      </dt>
                      <dd className="text-gray-900">
                        {verificationResult.details.issueDate}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">
                        Issuing Authority
                      </dt>
                      <dd className="text-gray-900">
                        {verificationResult.details.issuingAuthority}
                      </dd>
                    </div>

                    {/* Dynamic Fields based on Certificate Type */}
                    {verificationResult.details.certificateType.toLowerCase() === 'hackathon' && (
                      <>
                        <div>
                          <dt className="font-medium text-gray-600">Event Name</dt>
                          <dd className="text-gray-900">{verificationResult.details.additionalData?.eventName || '-'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Organizer</dt>
                          <dd className="text-gray-900">{verificationResult.details.additionalData?.organizer || '-'}</dd>
                        </div>
                      </>
                    )}

                    {verificationResult.details.certificateType.toLowerCase() === 'sports' && (
                      <>
                        <div>
                          <dt className="font-medium text-gray-600">Sport</dt>
                          <dd className="text-gray-900">{verificationResult.details.additionalData?.sportName || '-'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Achievement</dt>
                          <dd className="text-gray-900">{verificationResult.details.additionalData?.achievement || '-'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Event Level</dt>
                          <dd className="text-gray-900">{verificationResult.details.additionalData?.eventLevel || '-'}</dd>
                        </div>
                      </>
                    )}

                    {verificationResult.details.certificateType.toLowerCase() === 'marksheet' && (
                      <>
                        <div>
                          <dt className="font-medium text-gray-600">Course</dt>
                          <dd className="text-gray-900">{verificationResult.details.course || verificationResult.details.additionalData?.course || '-'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Enrollment No</dt>
                          <dd className="text-gray-900">{verificationResult.details.enrollmentNo || verificationResult.details.additionalData?.enrollmentNo || '-'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Semester</dt>
                          <dd className="text-gray-900">{verificationResult.details.additionalData?.semester || '-'}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full max-w-xl bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Verification Unavailable</h2>
          <p className="text-sm">
            Certificate verification is only available for user accounts. Please
            sign in with a user role to verify certificates.
          </p>
        </div>
      )}
      {/* Info cards at the bottom */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 justify-center mt-8">
        {/* Valid Certificate Card */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-2">
            <span className="text-green-500 mr-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </span>
            <span className="font-semibold text-lg">Valid Certificate</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">If the certificate is valid, you will see details about the certificate including:</p>
          <ul className="text-gray-700 text-sm list-disc pl-5 space-y-1">
            <li>Certificate ID</li>
            <li>Recipient name</li>
            <li>Issue date</li>
            <li>Issuing authority</li>
            <li>Certificate type</li>
          </ul>
        </div>
        {/* Invalid Certificate Card */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-2">
            <span className="text-red-500 mr-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
            <span className="font-semibold text-lg">Invalid Certificate</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">A certificate may be invalid for several reasons:</p>
          <ul className="text-gray-700 text-sm list-disc pl-5 space-y-1">
            <li>The certificate does not exist in our database</li>
            <li>The certificate has been tampered with</li>
            <li>The certificate has been revoked</li>
            <li>The QR code is damaged or incorrect</li>
          </ul>
        </div>
      </div>
      {/* User activity log below info cards */}
      <div className="w-full max-w-4xl mt-8">
        <UserActivity activities={userActivities} />
      </div>
    </div>
  );
}