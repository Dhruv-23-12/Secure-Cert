import React from 'react';

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4 text-center">Our Services</h1>
        <p className="text-lg text-gray-600 mb-10 text-center">
          CertVerify offers a suite of secure, modern solutions for document and certificate management.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="bg-indigo-100 p-3 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
            </span>
            <h3 className="text-xl font-semibold mb-2">Document Verification</h3>
            <p className="text-gray-500 text-center">Instantly verify the authenticity of documents and certificates using advanced cryptographic techniques and QR codes.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="bg-indigo-100 p-3 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <h3 className="text-xl font-semibold mb-2">Certificate Generation</h3>
            <p className="text-gray-500 text-center">Easily generate tamper-proof digital certificates for your organization, events, or educational programs.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="bg-indigo-100 p-3 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v-4h-1m-4 0h-1v-4h-1" /></svg>
            </span>
            <h3 className="text-xl font-semibold mb-2">Blockchain Security</h3>
            <p className="text-gray-500 text-center">Leverage blockchain technology to ensure the highest level of security and immutability for your records.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="bg-indigo-100 p-3 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
            </span>
            <h3 className="text-xl font-semibold mb-2">API Integration</h3>
            <p className="text-gray-500 text-center">Integrate our verification and certificate services into your own apps and workflows with robust APIs.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 