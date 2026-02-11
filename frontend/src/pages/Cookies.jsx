import React from 'react';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4 text-center">Cookie Policy</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          This Cookie Policy explains how CertVerify uses cookies and similar technologies to recognize you when you visit our website.
        </p>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-2">What are cookies?</h2>
          <p className="text-gray-700 mb-4">
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          <h2 className="text-2xl font-semibold mb-2">How We Use Cookies</h2>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>To remember your preferences and settings</li>
            <li>To keep you logged in and secure</li>
            <li>To analyze site traffic and usage for improvement</li>
            <li>To provide relevant content and features</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-2">Managing Cookies</h2>
          <p className="text-gray-700">
            You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience and some features may no longer be available.
          </p>
        </div>
        <div className="text-center text-gray-500 text-sm">
          If you have any questions about our Cookie Policy, please contact us at <a href="mailto:info@certverify.com" className="text-indigo-600 hover:underline">info@certverify.com</a>.
        </div>
      </div>
    </div>
  );
} 