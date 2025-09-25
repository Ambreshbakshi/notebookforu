"use client";
import { FaInstagram, FaEnvelope, FaWhatsapp, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiCheck, FiMail, FiClock } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ 
    loading: false, 
    success: false,
    resubscribed: false,
    alreadySubscribed: false,
    error: null,
    validationError: null,
    cooldown: 0
  });

  // Clear success messages after 5 seconds
  useEffect(() => {
    if (status.success || status.resubscribed || status.alreadySubscribed) {
      const timer = setTimeout(() => {
        setStatus(prev => ({ 
          ...prev, 
          success: false, 
          resubscribed: false,
          alreadySubscribed: false 
        }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status.success, status.resubscribed, status.alreadySubscribed]);

  // Handle cooldown timer
  useEffect(() => {
    let interval;
    if (status.cooldown > 0) {
      interval = setInterval(() => {
        setStatus(prev => ({
          ...prev,
          cooldown: prev.cooldown - 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status.cooldown]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email || !validateEmail(email)) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        validationError: 'Please enter a valid email address'
      }));
      return;
    }

    setStatus({ 
      loading: true, 
      success: false,
      resubscribed: false,
      alreadySubscribed: false,
      error: null,
      validationError: null,
      cooldown: 0 
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          const firstError = data.details?.[0]?.msg || 'Invalid email format';
          throw new Error(firstError);
        }
        if (response.status === 429) {
          setStatus(prev => ({
            ...prev,
            loading: false,
            cooldown: 120 // 2 minutes cooldown
          }));
          return;
        }
        throw new Error(data.error || 'Subscription failed');
      }

      // Handle different success cases
      if (response.status === 201) {
        setStatus({ 
          loading: false, 
          success: true,
          error: null
        });
        setEmail('');
      } else if (data.isResubscribe) {
        setStatus({ 
          loading: false, 
          resubscribed: true,
          cooldown: 120, // Start 2-minute cooldown
          error: null
        });
      } else if (data.message?.includes('already subscribed')) {
        setStatus({ 
          loading: false, 
          alreadySubscribed: true,
          error: null
        });
      }
    } catch (err) {
      setStatus(prev => ({ 
        ...prev,
        loading: false, 
        error: err.message || 'Subscription failed. Please try again.',
        validationError: err.message.includes('email') ? err.message : null
      }));
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Newsletter Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Newsletter</h3>
            <p className="text-gray-400">
              Subscribe for updates and exclusive offers
            </p>
            
            {status.success ? (
              <div className="flex items-center gap-2 text-green-400" aria-live="polite" role="alert">
                <FiCheck aria-hidden="true" /> 
                <span>Thank you for subscribing! Please check your email.</span>
              </div>
            ) : status.resubscribed ? (
              <div className="flex items-center gap-2 text-blue-400" aria-live="polite" role="alert">
                <FiCheck aria-hidden="true" /> 
                <span>Welcome back! Please check your email to confirm resubscription.</span>
              </div>
            ) : status.alreadySubscribed ? (
              <div className="flex items-center gap-2 text-yellow-400" aria-live="polite" role="alert">
                <FiCheck aria-hidden="true" /> 
                <span>You are already subscribed!</span>
              </div>
            ) : status.cooldown ? (
              <div className="flex items-center gap-2 text-blue-400" aria-live="polite">
                <FiClock aria-hidden="true" />
                <span>Please wait {status.cooldown}s before requesting another email</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2" noValidate>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status.validationError) {
                        setStatus(prev => ({ ...prev, validationError: null }));
                      }
                    }}
                    placeholder="Your email"
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    disabled={status.loading || status.cooldown > 0}
                    required
                    aria-required="true"
                    aria-invalid={!!status.validationError}
                    aria-describedby={status.validationError ? "email-error" : undefined}
                  />
                </div>
                
                {status.validationError && (
                  <p id="email-error" className="text-red-400 text-sm" aria-live="assertive" role="alert">
                    {status.validationError}
                  </p>
                )}
                
                {status.error && !status.validationError && (
                  <p className="text-red-400 text-sm" aria-live="assertive" role="alert">
                    {status.error}
                  </p>
                )}
                
                <button
                  type="submit"
                  disabled={status.loading || status.cooldown > 0}
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                    status.loading || status.cooldown > 0
                      ? 'bg-blue-700 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } flex items-center justify-center`}
                  aria-busy={status.loading}
                >
                  {status.loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </>
                  ) : status.cooldown > 0 ? `Wait ${status.cooldown}s` : 'Subscribe'}
                </button>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about-us" 
                  className="text-gray-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/notebook-gallery" 
                  className="text-gray-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Notebook Gallery
                </Link>
              </li>
              <li>
                <Link 
                  href="/notebook-gallery#customization" 
                  className="text-gray-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-400">
              <p>
                Email:{' '}
                <a 
                  href="mailto:contact@notebookforu.in" 
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  contact@notebookforu.in
                </a>
              </p>
              <p>
                Phone:{' '}
                <a 
                  href="tel:+918303137090" 
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  +91 8303137090
                </a>
              </p>
              <p>
                Phone:{' '}
                <a 
                  href="tel:+917991252505" 
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  +91 7991252505
                </a>
              </p>
              <p>Hours: Mon-Fri, 9AM-6PM</p>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/notebookforu.in" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                aria-label="Instagram (opens in new tab)"
                className="text-gray-400 hover:text-pink-500 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full p-1"
              >
                <FaInstagram className="text-2xl" aria-hidden="true" />
              </a>
              <a 
                href="https://wa.me/918303137090" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                aria-label="WhatsApp (opens in new tab)"
                className="text-gray-400 hover:text-green-500 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full p-1"
              >
                <FaWhatsapp className="text-2xl" aria-hidden="true" />
              </a>
              <a 
                href="https://wa.me/917991252505" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                aria-label="WhatsApp (opens in new tab)"
                className="text-gray-400 hover:text-green-500 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full p-1"
              >
                <FaWhatsapp className="text-2xl" aria-hidden="true" />
              </a>
              <a 
                href="mailto:contact@notebookforu.in"
                aria-label="Send email"
                className="text-gray-400 hover:text-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full p-1"
              >
                <FaEnvelope className="text-2xl" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} NotebookForU. All rights reserved.</p>
          <p className="mt-2 text-sm">
            <Link 
              href="/privacy-policy" 
              className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
            >
              Privacy Policy
            </Link>
            {' | '}
            <Link 
              href="/terms-of-service" 
              className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
