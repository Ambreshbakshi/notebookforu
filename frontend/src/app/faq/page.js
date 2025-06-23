'use client';

import { FiHelpCircle } from "react-icons/fi";

export default function FAQPage() {
  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center mb-4">
        <FiHelpCircle className="mr-2" /> Frequently Asked Questions
      </h1>
      <div className="space-y-4 text-gray-700">
        <div>
          <h2 className="font-semibold">Q: How can I track my order?</h2>
          <p>A: You can track your order by visiting the 'Track Order' page and entering your Order ID.</p>
        </div>
        <div>
          <h2 className="font-semibold">Q: What payment methods do you accept?</h2>
          <p>A: We accept UPI, Credit/Debit Cards, and major Wallets through Razorpay.</p>
        </div>
        <div>
          <h2 className="font-semibold">Q: Can I cancel my order?</h2>
          <p>A: Please contact support within 12 hours of placing the order for cancellation requests.</p>
        </div>
      </div>
    </div>
  );
}
