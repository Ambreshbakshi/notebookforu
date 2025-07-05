// src/utils/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://notebookforu-production-4e70.up.railway.app' 
    : 'http://localhost:5000');

/**
 * Handles email subscription
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const subscribeEmail = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Subscription failed');
    }

    return data;
  } catch (error) {
    console.error('Subscription Error:', error);
    throw new Error(
      error.message.includes('CORS') 
        ? 'Connection error. Please try again.' 
        : error.message
    );
  }
};

/**
 * Handles contact form submission
 * @param {Object} formData - {name: string, email: string, message: string}
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendContactForm = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Message failed to send');
    }

    return data;
  } catch (error) {
    console.error('Contact Form Error:', error);
    throw new Error(
      error.message.includes('CORS')
        ? 'Connection error. Please try again.'
        : error.message
    );
  }
};