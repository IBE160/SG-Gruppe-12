// frontend/src/app/terms/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: November 27, 2024
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-sm space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using AI CV Assistant, you accept and agree to be bound by these
                  Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  AI CV Assistant provides AI-powered tools to help job seekers create optimized CVs
                  and cover letters. Our service includes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>CV upload and parsing</li>
                  <li>Job posting analysis</li>
                  <li>ATS optimization</li>
                  <li>Tailored application generation</li>
                  <li>Gap analysis and recommendations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You must create an account to use our service. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Account Termination</h3>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these terms or
                  engage in fraudulent activity.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Billing</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Tier</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The free tier includes 1 tailored application per week. No credit card required.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">Premium Subscription</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Billed monthly at 129 NOK/month</li>
                  <li>Automatically renews unless cancelled</li>
                  <li>Can be cancelled at any time</li>
                  <li>7-day money-back guarantee</li>
                  <li>Includes unlimited applications and advanced features</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree NOT to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Use the service for any illegal purpose</li>
                  <li>Upload content that violates intellectual property rights</li>
                  <li>Attempt to reverse engineer or hack the service</li>
                  <li>Share your account credentials with others</li>
                  <li>Use automated systems to access the service (without permission)</li>
                  <li>Submit false, misleading, or fraudulent information</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Content</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You retain all rights to content you upload. By using our service, you grant us
                  a limited license to process your content for the purpose of providing our services.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Content</h3>
                <p className="text-gray-600 leading-relaxed">
                  All service features, designs, and technology are owned by AI CV Assistant and
                  protected by copyright and other intellectual property laws.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our service is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>Job interview or employment outcomes</li>
                  <li>100% accuracy of AI-generated content</li>
                  <li>Uninterrupted or error-free service</li>
                  <li>Compatibility with all ATS systems</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, AI CV Assistant shall not be liable for any
                  indirect, incidental, special, consequential, or punitive damages resulting from your
                  use or inability to use the service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data and Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your use of the service is also governed by our Privacy Policy. We are committed to
                  protecting your data in compliance with GDPR and other applicable regulations.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications to Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify or discontinue the service at any time, with or without
                  notice. We will not be liable for any modification, suspension, or discontinuation.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Norway,
                  without regard to its conflict of law provisions.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Email: <a href="mailto:legal@aicvassistant.com" className="text-primary hover:underline">legal@aicvassistant.com</a><br />
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
