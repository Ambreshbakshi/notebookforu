"use client";
import { FaInstagram, FaEnvelope, FaWhatsapp, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';
import { FiCheck, FiMail } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ 
    loading: false, 
    success: false, 
    error: null 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      setStatus({ ...status, error: 'Email is required' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ ...status, error: 'Please enter a valid email' });
      return;
    }

    setStatus({ loading: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      setStatus({ loading: false, success: true, error: null });
      setEmail('');
      setTimeout(() => setStatus({ ...status, success: false }), 5000);
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: 'Subscription failed. Please try again.' 
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Newsletter</h3>
            <p className="text-gray-400">
              Subscribe for updates and exclusive offers
            </p>
            
            {status.success ? (
              <div className="flex items-center gap-2 text-green-400">
                <FiCheck /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded border border-gray-700 focus:ring-2 focus:ring-blue-500"
                    disabled={status.loading}
                  />
                </div>
                
                {status.error && (
                  <p className="text-red-400 text-sm">{status.error}</p>
                )}
                
                <button
                  type="submit"
                  disabled={status.loading}
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                    status.loading 
                      ? 'bg-blue-700 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {status.loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition">
                  Our Products
                </Link>
              </li>
              <li>
                <Link href="/custom" className="text-gray-400 hover:text-white transition">
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-400">
              <p>Email: contact@notebookforu.com</p>
              <p>Phone: {process.env.NEXT_PUBLIC_CONTACT_PHONE}</p>
              <p>Hours: Mon-Fri, 9AM-6PM</p>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/notebookforu" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-pink-500 transition"
              >
                <FaInstagram className="text-2xl" />
              </a>
              <a 
                href="https://facebook.com/notebookforu" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-500 transition"
              >
                <FaFacebook className="text-2xl" />
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-gray-400 hover:text-green-500 transition"
              >
                <FaWhatsapp className="text-2xl" />
              </a>
              <a 
                href="mailto:contact@notebookforu.com"
                aria-label="Email"
                className="text-gray-400 hover:text-red-500 transition"
              >
                <FaEnvelope className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} NotebookForU. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;