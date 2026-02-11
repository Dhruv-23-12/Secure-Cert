import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to CertVerify. By accessing or using our certificate verification platform, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">
              You agree to use CertVerify only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Prohibited Activities</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Using the service for any fraudulent or unlawful purpose</li>
              <li>Attempting to gain unauthorized access to the platform or other accounts</li>
              <li>Interfering with or disrupting the integrity or performance of the service</li>
              <li>Uploading or transmitting viruses or malicious code</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              All content, trademarks, and data on CertVerify, including but not limited to software, databases, text, graphics, icons, and hyperlinks are the property of CertVerify or its licensors and are protected by intellectual property laws.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Disclaimers</h2>
            <p className="text-gray-600 mb-4">
              CertVerify is provided on an "as is" and "as available" basis. We do not warrant that the service will be uninterrupted, error-free, or completely secure. Use of the service is at your own risk.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              To the fullest extent permitted by law, CertVerify and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the revised terms.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 space-y-2 text-gray-600">
              <p>Email: support@certverify.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Verification Street, Tech City, TC 12345, United States</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
