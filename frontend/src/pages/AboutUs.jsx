import React from 'react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About CertVerify</h1>
          <p className="text-xl text-gray-600">Secure Certificate Verification Platform</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            At CertVerify, we're dedicated to revolutionizing the way certificates and documents are verified. 
            Our mission is to provide a secure, efficient, and user-friendly platform that ensures the authenticity 
            of digital certificates while combating fraud and forgery.
          </p>
          <p className="text-gray-600">
            We believe in leveraging cutting-edge technology to create a more trustworthy digital environment 
            for individuals and organizations alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Secure certificate verification using advanced cryptographic techniques</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>QR code-based instant verification system</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Digital signature verification for document integrity</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Comprehensive analytics and verification tracking</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us</h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>State-of-the-art security measures</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>User-friendly interface</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>24/7 verification support</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Comprehensive verification history</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-600 mb-6">
            Our team consists of experienced professionals in cybersecurity, software development, and digital 
            verification systems. We're passionate about creating a secure and reliable platform that helps 
            organizations and individuals verify their certificates with confidence.
          </p>
          <p className="text-gray-600">
            With years of experience in the industry, we understand the importance of document verification 
            and are committed to providing the best possible service to our users.
          </p>
        </div>
      </div>
    </div>
  );
} 