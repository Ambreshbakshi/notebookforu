const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://backend.notebookforu.in'
    : 'http://localhost:5000');

/**
 * Handles email subscription with improved resubscribe flow
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, message: string, isResubscribe?: boolean}>}
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

    // Handle all successful responses
    if (response.ok || [200, 201, 202].includes(response.status)) {
      // Special handling for resubscribe flow
      if (response.status === 202) {
        return {
          success: true,
          message: 'Welcome back! Please check your email to confirm resubscription.',
          isResubscribe: true
        };
      }
      // Handle already subscribed case
      if (data.message?.includes('already subscribed')) {
        return {
          success: true,
          message: 'You are already subscribed to our newsletter!'
        };
      }
      // Default success case for new subscriptions
      return {
        success: true,
        message: 'Thank you for subscribing! Please check your email for confirmation.'
      };
    }

    // Handle specific error cases
    switch (response.status) {
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
 * @returns {Promise<{success: boolean, message: string, resubscribeLink?: string}>}
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
          throw new Error('Invalid or expired unsubscribe link');
        case 400:
          throw new Error(data.message || 'Invalid request');
        default:
          throw new Error(data.error || 'Failed to unsubscribe');
      }
    }

    return {
      success: true,
      message: 'You have been successfully unsubscribed.',
      ...(data.resubscribeLink && { resubscribeLink: data.resubscribeLink })
    };
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
          throw new Error('Invalid or expired resubscription link');
        case 400:
          throw new Error(data.message || 'Invalid token');
        default:
          throw new Error(data.error || 'Failed to confirm resubscription');
      }
    }

    return {
      success: true,
      message: 'You have been successfully resubscribed!'
    };
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

    return {
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    };
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
 * @private
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