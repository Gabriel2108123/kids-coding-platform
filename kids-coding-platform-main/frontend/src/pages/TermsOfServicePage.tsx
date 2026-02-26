import React from 'react';

/**
 * TermsOfServicePage - Generic Terms of Service page
 * Opens in a new window/tab for better user experience
 */
const TermsOfServicePage: React.FC = () => {
  const lastUpdated = "January 1, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Kids Coding Platform</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Kids Coding Platform ("Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              Kids Coding Platform is an educational service designed to teach children programming concepts through 
              interactive lessons, games, and projects. The service includes learning modules, coding exercises, 
              progress tracking, and parental oversight features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts and Eligibility</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p><strong>Child Accounts:</strong> This service is designed for children under 13 years of age. Child accounts must be created and managed by a parent or legal guardian.</p>
              <p><strong>Parent Accounts:</strong> Parents or legal guardians must create an account to register their children and oversee their activities on the platform.</p>
              <p><strong>Age Requirements:</strong> Children must be at least 6 years old to use this service.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Parental Consent and COPPA Compliance</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We comply with the Children's Online Privacy Protection Act (COPPA). For children under 13:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verifiable parental consent is required before collecting any personal information</li>
                <li>Parents have the right to review, delete, and refuse further collection of their child's information</li>
                <li>We collect only information necessary for the educational service</li>
                <li>Information is not shared with third parties without parental consent</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. User Responsibilities</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p><strong>Parents agree to:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information during registration</li>
                <li>Monitor their child's use of the service</li>
                <li>Ensure their child follows platform guidelines</li>
                <li>Keep account credentials secure</li>
              </ul>
              
              <p className="mt-4"><strong>Children agree to:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform for educational purposes only</li>
                <li>Be respectful to other users</li>
                <li>Not share personal information</li>
                <li>Follow safety guidelines</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Content and Intellectual Property</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p><strong>Platform Content:</strong> All educational content, including lessons, exercises, and games, 
              are owned by Kids Coding Platform and protected by copyright laws.</p>
              <p><strong>User-Generated Content:</strong> Projects and code created by users remain their property, 
              but users grant us a license to display and use this content within the educational platform.</p>
              <p><strong>Third-Party Content:</strong> Some content may be provided by third parties and is subject 
              to their respective terms and licenses.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
              use, and protect your information. The Privacy Policy is incorporated into these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Safety and Monitoring</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We implement various safety measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Content filtering and moderation</li>
                <li>Parental controls and oversight features</li>
                <li>Safe communication environments</li>
                <li>Regular security audits</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to provide continuous service but cannot guarantee 100% uptime. We reserve the right 
              to modify, suspend, or discontinue the service with reasonable notice to users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Kids Coding Platform provides the service "as is" without warranties. We are not liable for any 
              indirect, incidental, or consequential damages arising from the use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms of Service from time to time. Significant changes will be communicated 
              to users via email or platform notifications. Continued use of the service constitutes acceptance 
              of updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
            <div className="text-gray-700 leading-relaxed">
              <p>If you have questions about these Terms of Service, please contact us at:</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> legal@kidscodingplatform.com</p>
                <p><strong>Address:</strong> [Company Address]</p>
                <p><strong>Phone:</strong> [Company Phone]</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => window.close()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
