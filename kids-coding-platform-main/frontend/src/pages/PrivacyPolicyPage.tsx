import React from 'react';

/**
 * PrivacyPolicyPage - Generic Privacy Policy page
 * Opens in a new window/tab for better user experience
 */
const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "January 1, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Kids Coding Platform</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Kids Coding Platform ("we," "our," or "us") is committed to protecting the privacy and safety of 
              children who use our educational service. This Privacy Policy explains how we collect, use, and 
              protect information when you use our platform, with special attention to compliance with the 
              Children's Online Privacy Protection Act (COPPA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">From Parents/Guardians:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials (username, encrypted password)</li>
                  <li>Payment information (if applicable)</li>
                  <li>Verification documents for parental consent</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">From Children (with parental consent):</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Display name or username (no real names required)</li>
                  <li>Age or birth year (for age-appropriate content)</li>
                  <li>Learning progress and achievements</li>
                  <li>Projects and code created on the platform</li>
                  <li>Technical information (device type, browser, IP address)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Automatically Collected Information:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Usage analytics (pages visited, time spent, features used)</li>
                  <li>Device and browser information</li>
                  <li>IP address and general location (for security purposes)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Information</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We use collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Educational Services:</strong> Provide personalized learning experiences and track progress</li>
                <li><strong>Platform Improvement:</strong> Analyze usage patterns to enhance our educational content</li>
                <li><strong>Safety and Security:</strong> Monitor for inappropriate content and ensure platform safety</li>
                <li><strong>Communication:</strong> Send important updates about the service (with parental consent)</li>
                <li><strong>Technical Support:</strong> Provide customer service and resolve technical issues</li>
                <li><strong>Legal Compliance:</strong> Meet legal obligations and protect our rights</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. COPPA Compliance</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-semibold">Important: Special Protections for Children Under 13</p>
            </div>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p><strong>Parental Consent:</strong> We obtain verifiable parental consent before collecting any personal 
              information from children under 13 years of age.</p>
              
              <p><strong>Limited Collection:</strong> We only collect information that is reasonably necessary for 
              the educational activity.</p>
              
              <p><strong>Parental Rights:</strong> Parents have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Review their child's personal information</li>
                <li>Delete their child's personal information</li>
                <li>Refuse to allow further collection of their child's information</li>
                <li>Request that we stop using their child's information</li>
              </ul>
              
              <p><strong>No Disclosure:</strong> We do not disclose children's personal information to third parties 
              except as necessary for the educational service or as required by law.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Information Sharing and Disclosure</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We do not sell, trade, or otherwise transfer personal information to third parties except in the 
              following limited circumstances:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform 
                (hosting, analytics, customer support) under strict confidentiality agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Safety Concerns:</strong> To protect the safety of users or investigate potential violations</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with advance notice)</li>
              </ul>
              
              <p><strong>For Children Under 13:</strong> No personal information is shared without additional parental consent.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Security</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We implement comprehensive security measures to protect personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                <li><strong>Staff Training:</strong> Regular privacy and security training for all employees</li>
                <li><strong>Incident Response:</strong> Established procedures for handling security breaches</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p><strong>Active Accounts:</strong> We retain information as long as accounts remain active and for 
              educational continuity.</p>
              
              <p><strong>Inactive Accounts:</strong> Information from inactive accounts is deleted after 3 years of inactivity.</p>
              
              <p><strong>Upon Request:</strong> Parents can request immediate deletion of their child's information at any time.</p>
              
              <p><strong>Legal Requirements:</strong> Some information may be retained longer if required by law.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookies and Tracking</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Functions:</strong> Login sessions, security, and basic platform functionality</li>
                <li><strong>Analytics:</strong> Understanding how users interact with our platform (anonymized data)</li>
                <li><strong>Preferences:</strong> Remembering user settings and customizations</li>
              </ul>
              
              <p><strong>Cookie Management:</strong> Parents can manage cookie preferences through browser settings. 
              Note that disabling essential cookies may affect platform functionality.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Our servers are located in [Country/Region]. If you access our service from outside this region, 
              your information may be transferred to and processed in our server locations. We ensure appropriate 
              safeguards are in place for international transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Your Rights and Choices</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p><strong>Access:</strong> Request a copy of personal information we have collected</p>
              <p><strong>Correction:</strong> Update or correct inaccurate information</p>
              <p><strong>Deletion:</strong> Request deletion of personal information</p>
              <p><strong>Portability:</strong> Receive personal information in a portable format</p>
              <p><strong>Objection:</strong> Object to certain uses of personal information</p>
              
              <p className="mt-4"><strong>For Children Under 13:</strong> All rights must be exercised by parents or legal guardians.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be communicated via:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Email notification to registered parents</li>
              <li>Prominent notice on our platform</li>
              <li>Updated "Last Modified" date at the top of this policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
            <div className="text-gray-700 leading-relaxed">
              <p>For questions about this Privacy Policy or to exercise your privacy rights, contact us:</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
                <p><strong>Privacy Officer:</strong> privacy@kidscodingplatform.com</p>
                <p><strong>General Contact:</strong> support@kidscodingplatform.com</p>
                <p><strong>Mailing Address:</strong> [Company Address]</p>
                <p><strong>Phone:</strong> [Company Phone]</p>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>For COPPA-related requests:</strong> Please include "COPPA Request" in the subject line 
                  and provide verification of parental status.
                </p>
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

export default PrivacyPolicyPage;
