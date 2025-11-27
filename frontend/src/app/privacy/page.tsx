// frontend/src/app/privacy/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: November 27, 2024
            </p>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <div className="bg-white rounded-lg p-8 shadow-sm space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  AI CV Assistant ("we", "our", or "us") is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your
                  information when you use our service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Name and email address (for account creation)</li>
                  <li>CV/resume content (for processing and optimization)</li>
                  <li>Job posting information (for matching and analysis)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your CV and generate tailored applications</li>
                  <li>Analyze job postings and match requirements</li>
                  <li>Communicate with you about our services</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>TLS encryption for all data transmission</li>
                  <li>Encrypted storage of sensitive information</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  In compliance with GDPR regulations:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>Uploaded CVs are automatically deleted after 7 days</li>
                  <li>Generated applications are stored until you delete them or close your account</li>
                  <li>Account information is retained until you request deletion</li>
                  <li>Anonymized usage data may be retained for analytical purposes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Under GDPR, you have the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use trusted third-party services for:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>AI processing (OpenAI, Anthropic)</li>
                  <li>Payment processing (Stripe)</li>
                  <li>Analytics and performance monitoring</li>
                  <li>Cloud hosting and storage</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  These services have their own privacy policies and are carefully selected for their
                  security standards.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use essential cookies to maintain your session and preferences. We do not use
                  tracking cookies for advertising purposes.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any
                  significant changes by email or through our service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Email: <a href="mailto:privacy@aicvassistant.com" className="text-primary hover:underline">privacy@aicvassistant.com</a><br />
                  Address: Oslo, Norway
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
