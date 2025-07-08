const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://backend.notebookforu.in'
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

    // Consider both 200 (OK) and 201 (Created) as successful responses
    if (!response.ok && response.status !== 200 && response.status !== 201) {
      // Custom message for already subscribed users
      if (response.status === 409) {
        throw new Error('You are already subscribed!');
      }
      throw new Error(data.message || data.error || 'Subscription failed');
    }

    // Special case for resubscribe flow
    if (data.message && data.message.includes('confirmation link has been sent')) {
      return {
        success: true,
        message: 'Welcome back! Resubscribe email sent to your email'
      };
    }

    return data;
  } catch (error) {
    console.error('Subscription Error:', error);
    throw new Error(
      error.message.includes('CORS') || error.message.includes('Failed to fetch')
        ? 'Connection error. Please try again.'
        : error.message || 'Subscription failed. Please try again.'
    );
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
      if (response.status === 404) {
        throw new Error('Oops! Not found - Invalid or expired link');
      }
      throw new Error(data.error || data.message || 'Failed to unsubscribe');
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
      if (response.status === 404) {
        throw new Error('Oops! Not found - Invalid or expired link');
      }
      throw new Error(data.error || data.message || 'Failed to confirm resubscription');
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