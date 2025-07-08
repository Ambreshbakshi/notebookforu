const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://backend.notebookforu.in'
    : 'http://localhost:5000');

/**
 * Handles email subscription with improved resubscribe flow
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

    // Handle all successful responses (200, 201, and resubscribe case)
    if (response.ok || response.status === 200 || response.status === 201) {
      // Transform backend message for better UX
      if (data.message?.includes('confirmation link has been sent')) {
        return {
          success: true,
          message: 'Welcome back! Resubscribe email sent to your email'
        };
      }
      return data;
    }

    // Handle specific error cases
    switch (response.status) {
      case 409:
        throw new Error('You are already subscribed!');
      case 400:
        throw new Error(data.message || 'Invalid email address');
      case 404:
        throw new Error('Service not available');
      default:
        throw new Error(data.message || data.error || 'Subscription failed');
    }
  } catch (error) {
    console.error('Subscription Error:', error);
    const userMessage = error.message.includes('CORS') || 
                       error.message.includes('Failed to fetch')
      ? 'Connection error. Please try again.'
      : error.message || 'Subscription failed. Please try again.';
    
    throw new Error(userMessage);
  }
};

/**
 * Handles unsubscription using token
 * @param {string} token - Unsubscription token
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const unsubscribeEmail = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!response.ok && response.status !== 200) {
      switch (response.status) {
        case 404:
          throw new Error('Oops! Not found - Invalid or expired link');
        case 400:
          throw new Error('Invalid request');
        default:
          throw new Error(data.error || data.message || 'Failed to unsubscribe');
      }
    }

    return data;
  } catch (error) {
    console.error('Unsubscribe Error:', error);
    throw new Error(
      error.message.includes('CORS') || error.message.includes('Failed to fetch')
        ? 'Connection error. Please try again.'
        : error.message || 'Failed to unsubscribe. Please try again.'
    );
  }
};

/**
 * Confirms a resubscription using a secure token
 * @param {string} token - Resubscription token sent via email
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const confirmResubscribe = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resubscribe-confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!response.ok && response.status !== 200) {
      switch (response.status) {
        case 404:
          throw new Error('Oops! Not found - Invalid or expired link');
        case 400:
          throw new Error('Invalid token');
        default:
          throw new Error(data.error || data.message || 'Failed to confirm resubscription');
      }
    }

    return data;
  } catch (error) {
    console.error('Resubscribe Error:', error);
    throw new Error(
      error.message.includes('CORS') || error.message.includes('Failed to fetch')
        ? 'Connection error. Please try again.'
        : error.message || 'Failed to confirm resubscription. Please try again.'
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

    if (!response.ok && response.status !== 200 && response.status !== 201) {
      throw new Error(data.message || data.error || 'Message failed to send');
    }

    return data;
  } catch (error) {
    console.error('Contact Form Error:', error);
    throw new Error(
      error.message.includes('CORS') || error.message.includes('Failed to fetch')
        ? 'Connection error. Please try again.'
        : error.message || 'Failed to send message. Please try again.'
    );
  }
};

/**
 * Helper function to make API calls with consistent error handling
 */
const makeApiCall = async (endpoint, method, body) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};