import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to CertVerify's Privacy Policy. This policy explains how we collect, use, disclose, and safeguard 
              your information when you use our certificate verification service. Please read this privacy policy carefully. 
              If you do not agree with the terms of this privacy policy, please do not access the service.
            </p>
            <p className="text-gray-600">
              We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert 
              you about any changes by updating the "Last updated" date of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-600">
                  We may collect personal information that you voluntarily provide to us when you register on the service, 
                  express an interest in obtaining information about us or our products and services, or otherwise contact us. 
                  The personal information that we collect depends on the context of your interactions with us and the service, 
                  the choices you make, and the products and features you use.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Certificate Information</h3>
                <p className="text-gray-600">
                  We collect and process certificate data that you upload or verify through our service. This includes 
                  certificate details, verification history, and related metadata necessary for the verification process.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide, operate, and maintain our service</li>
              <li>Improve, personalize, and expand our service</li>
              <li>Understand and analyze how you use our service</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you for customer service and support</li>
              <li>Send you updates and marketing communications</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We have implemented appropriate technical and organizational security measures designed to protect the 
              security of any personal information we process. However, please also remember that we cannot guarantee 
              that the internet itself is 100% secure.
            </p>
            <p className="text-gray-600">
              We will use commercially reasonable efforts to protect your personal information, but we cannot guarantee 
              its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Data Protection Rights</h2>
            <p className="text-gray-600 mb-4">
              We would like to make sure you are fully aware of all of your data protection rights. Every user is 
              entitled to the following:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>The right to access – You have the right to request copies of your personal data.</li>
              <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
              <li>The right to erasure – You have the right to request that we erase your personal data.</li>
              <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data.</li>
              <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization.</li>
              <li>The right to object – You have the right to object to our processing of your personal data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 space-y-2 text-gray-600">
              <p>Email: privacy@certverify.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Verification Street, Tech City, TC 12345, United States</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 