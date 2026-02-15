import { Link } from 'react-router-dom';
import HeroAnimation from '../components/HeroAnimation';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#c7d2fe] to-[#818cf8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 sm:pt-32 lg:pt-40 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Secure Certificate Verification
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Verify the authenticity of certificates, documents, and digital assets using our secure verification system. Our platform uses advanced cryptographic techniques to ensure the integrity of your documents.
              </p>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
                <Link
                  to="/verify"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Verify Certificate
                </Link>
                <Link
                  to="/demo"
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600"
                >
                  View Demo <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Animation */}
            <div className="relative flex justify-center items-center w-full h-full">
              <HeroAnimation />
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#c7d2fe] to-[#818cf8] opacity-15 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features section */}
      <div className="bg-gray-50 pt-8 sm:pt-12 pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Secure Verification</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to verify certificates
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform provides a comprehensive solution for certificate verification, ensuring the authenticity and integrity of your documents.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  QR Code Verification
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Scan QR codes to instantly verify the authenticity of certificates and documents.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Digital Signatures
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Advanced cryptographic signatures ensure document integrity and prevent tampering.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Real-time Verification
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Instant verification results with detailed information about the certificate's authenticity.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* How It Works section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 mb-12">Follow these simple steps to verify your certificate quickly and securely.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                {/* Upload/Scan Icon */}
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload or Scan</h3>
              <p className="text-gray-600">Upload your certificate or scan its QR code to begin the verification process.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                {/* Verify Icon */}
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify Instantly</h3>
              <p className="text-gray-600">Our system checks the authenticity of your document using advanced cryptography.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
                {/* Result Icon */}
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-600">Receive instant verification results and download or share your verified certificate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group border border-gray-200 rounded-lg p-4 bg-white">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-medium text-gray-800 group-open:text-indigo-600">
                How do I verify a certificate?
                <span className="ml-2 transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <p className="mt-2 text-gray-600">Simply upload your certificate or scan its QR code using our platform. The system will instantly check its authenticity and provide you with the results.</p>
            </details>
            {/* FAQ 2 */}
            <details className="group border border-gray-200 rounded-lg p-4 bg-white">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-medium text-gray-800 group-open:text-indigo-600">
                Is my data secure?
                <span className="ml-2 transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <p className="mt-2 text-gray-600">Yes, we use advanced cryptographic techniques to ensure your documents and personal data remain private and secure. We do not store or share your private data.</p>
            </details>
            {/* FAQ 3 */}
            <details className="group border border-gray-200 rounded-lg p-4 bg-white">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-medium text-gray-800 group-open:text-indigo-600">
                What types of certificates can I verify?
                <span className="ml-2 transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <p className="mt-2 text-gray-600">You can verify academic, professional, and other digital certificates that are supported by our platform. For more details, contact our support team.</p>
            </details>
            {/* FAQ 4 */}
            <details className="group border border-gray-200 rounded-lg p-4 bg-white">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-medium text-gray-800 group-open:text-indigo-600">
                How long does the verification process take?
                <span className="ml-2 transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </summary>
              <p className="mt-2 text-gray-600">Verification is instant for most certificates. In rare cases, it may take a few minutes if additional checks are required.</p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}