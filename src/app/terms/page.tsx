'use client';

import { faArrowLeft, faFileContract } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
              <FontAwesomeIcon icon={faFileContract} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600 mt-1">Last updated: February 11, 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Performance Management System (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              The Performance Management System is designed to help organizations manage employee performance, conduct appraisals, and track professional development. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to any part of the Service</li>
              <li>Not interfere with or disrupt the Service or servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the security of your account and password. The Service cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are fully responsible for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data and Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. We collect and process your personal data in accordance with applicable data protection laws. By using our Service, you consent to such processing and you warrant that all data provided by you is accurate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service and its original content, features, and functionality are owned by the Performance Management System and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Performance Data</h2>
            <p className="text-gray-700 leading-relaxed">
              All performance reviews, appraisals, and employee data entered into the system remain the property of your organization. We serve as a secure platform for storing and managing this information. You retain all rights to your organizational data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to maintain high availability of our Service. However, we do not guarantee that the Service will be uninterrupted, timely, secure, or error-free. We reserve the right to modify or discontinue the Service with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall the Performance Management System, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> support@performance-management.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Performance Management System HQ</p>
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
