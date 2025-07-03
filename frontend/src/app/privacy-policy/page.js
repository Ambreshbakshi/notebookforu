export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
      <p className="mb-8 text-gray-600 text-center">Effective Date: 03/July/2025</p>

      <div className="prose prose-lg max-w-none">
        <p className="mb-6">
          At <strong>Notebook ForU</strong>, we value your privacy and are committed to protecting your personal information.
          This Privacy Policy outlines how we collect, use, and safeguard your data when you visit or shop at{" "}
          <a href="https://notebookforu.in" className="text-blue-600 underline">www.notebookforu.in</a>.
        </p>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Information We Collect</h2>
          <p className="mb-4">
            We collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2"><strong>Personal Information:</strong> Name, email address, phone number, shipping address when you place an order.</li>
            <li className="mb-2"><strong>Payment Information:</strong> We process payments through Razorpay. We do not store your credit card details.</li>
            <li className="mb-2"><strong>Usage Data:</strong> Information about how you interact with our website (pages visited, time spent, etc.).</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">To process and fulfill your orders</li>
            <li className="mb-2">To communicate with you about your orders</li>
            <li className="mb-2">To improve our website and services</li>
            <li className="mb-2">To send promotional emails (you can opt-out anytime)</li>
            <li className="mb-2">To comply with legal obligations</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">3. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">SSL encryption for all data transmissions</li>
            <li className="mb-2">Secure payment processing through Razorpay (PCI-DSS compliant)</li>
            <li className="mb-2">Limited access to personal data within our organization</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">4. Cookies and Tracking</h2>
          <p className="mb-4">
            Our website uses cookies to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Remember your preferences</li>
            <li className="mb-2">Analyze website traffic</li>
            <li className="mb-2">Improve user experience</li>
          </ul>
          <p className="mb-4">
            You can disable cookies in your browser settings, but this may affect website functionality.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">5. Third-Party Services</h2>
          <p className="mb-4">
            We use trusted third-party services that may access your data:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2"><strong>Razorpay:</strong> For payment processing</li>
            <li className="mb-2"><strong>India Post:</strong> For order delivery</li>
            <li className="mb-2"><strong>Google Analytics:</strong> For website analytics</li>
          </ul>
          <p className="mb-4">
            These third parties have their own privacy policies which we recommend you review.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">6. Data Retention</h2>
          <p className="mb-4">
            We retain your personal information only as long as necessary:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Order information: 5 years for tax and legal purposes</li>
            <li className="mb-2">Account information: Until you request deletion</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">7. Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">Access the personal data we hold about you</li>
            <li className="mb-2">Request correction of inaccurate data</li>
            <li className="mb-2">Request deletion of your data</li>
            <li className="mb-2">Opt-out of marketing communications</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us using the information below.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">8. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy periodically. The updated version will be posted on our website with a new effective date.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">9. Contact Us</h2>
          <p className="mb-4">
            For any privacy-related questions or requests, please contact:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">📧 Email: notebookforu009@gmail.com</li>
            <li className="mb-2">📞 Phone: 8303137090 / 7991252505</li>
            <li className="mb-2">📍 Address: 1350 Sarvodaya Nagar, Bichhiya, Gorakhpur, India</li>
          </ul>
        </div>
      </div>
    </div>
  );
}