import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function UserVerification() {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState({
    certificateId: '',
    holderName: '',
    issueDate: '',
    issuer: '',
    type: '',
  });

  const handleVerify = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to verify the certificate
      // For demo purposes, we'll simulate a verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate verification result
      const isValid = Math.random() > 0.5;
      setVerificationResult({
        isValid,
        message: isValid 
          ? 'Certificate is valid and authentic'
          : 'Certificate verification failed',
        details: isValid ? {
          verifiedAt: new Date().toISOString(),
          certificateId: certificateData.certificateId,
          holderName: certificateData.holderName,
        } : null,
      });
    } catch (error) {
      setVerificationResult({
        isValid: false,
        message: 'Error verifying certificate',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Certificate Verification
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Enter the certificate details or scan the QR code to verify its authenticity.</p>
            </div>
            <div className="mt-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="certificate-id" className="block text-sm font-medium text-gray-700">
                    Certificate ID
                  </label>
                  <input
                    type="text"
                    name="certificate-id"
                    id="certificate-id"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={certificateData.certificateId}
                    onChange={(e) => setCertificateData({ ...certificateData, certificateId: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="holder-name" className="block text-sm font-medium text-gray-700">
                    Holder Name
                  </label>
                  <input
                    type="text"
                    name="holder-name"
                    id="holder-name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={certificateData.holderName}
                    onChange={(e) => setCertificateData({ ...certificateData, holderName: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleVerify}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Certificate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {verificationResult && (
          <div className={`mt-6 bg-white shadow sm:rounded-lg ${verificationResult.isValid ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'}`}>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Verification Result
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>{verificationResult.message}</p>
              </div>
              {verificationResult.isValid && verificationResult.details && (
                <div className="mt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Certificate ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{verificationResult.details.certificateId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Holder Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{verificationResult.details.holderName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Verified At</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(verificationResult.details.verifiedAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demo QR Code */}
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Demo QR Code
            </h3>
            <div className="mt-4 flex justify-center">
              <QRCode
                value={JSON.stringify(certificateData)}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={"0 0 256 256"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}