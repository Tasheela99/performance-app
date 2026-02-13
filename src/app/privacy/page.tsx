'use client';

import { faArrowLeft, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/auth/register" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-6 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Registration
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faShieldAlt} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 mt-1">Last updated: February 11, 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Performance Management System, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our performance management platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We collect several types of information to provide and improve our Service:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Name and contact information (email address)</li>
              <li>Job title, department, and position</li>
              <li>Profile picture/avatar</li>
              <li>Account credentials</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Performance Data</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Performance reviews and appraisals</li>
              <li>Goal setting and tracking information</li>
              <li>Feedback and comments</li>
              <li>Performance metrics and analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Usage Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Log data and usage patterns</li>
              <li>Device information and browser type</li>
              <li>IP addresses and location data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To provide and maintain our Service</li>
              <li>To process performance reviews and appraisals</li>
              <li>To send you notifications and updates</li>
              <li>To analyze usage and improve our platform</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored on secure servers with encryption both in transit and at rest.
            </p>
            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Within Your Organization:</strong> Performance data is shared with authorized users (managers, HR) within your organization</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our Service</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Data Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have certain rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with small amounts of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Performance data may be retained according to your organization's data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@performance-management.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Performance Management System HQ</p>
              <p className="text-gray-700 mt-2 text-sm">Our Data Protection Officer is available to answer any questions regarding your data rights.</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/auth/register" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Return to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
