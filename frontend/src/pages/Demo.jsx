import React from 'react';
import { Link } from 'react-router-dom';

export default function Demo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">How to Verify a Certificate</h1>
        <p className="text-center text-gray-600 mb-10">Follow these simple steps to verify your certificate or scan a document using CertVerify.</p>
        <ol className="space-y-8">
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Upload or Scan</h2>
              <p className="text-gray-600">Go to the <Link to="/verify/demo-certificate" className="text-indigo-600 hover:underline">verification page</Link> and either upload your certificate or scan its QR code using your device's camera.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Step 2: Instant Verification</h2>
              <p className="text-gray-600">Our system will instantly check the authenticity of your document using advanced cryptography and display the results.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Step 3: Get Results</h2>
              <p className="text-gray-600">View the verification results and download or share your verified certificate as needed.</p>
            </div>
          </li>
        </ol>
        <div className="mt-10 text-center">
          <Link to="/verify/demo-certificate" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition">Go to Verification Page</Link>
        </div>
      </div>
    </div>
  );
}