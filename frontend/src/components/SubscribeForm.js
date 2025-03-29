"use client";
import { useState } from 'react';
import { subscribeEmail } from '@/utils/api';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await subscribeEmail(email);
      setMessage(result.message);
      setEmail('');
    } catch (error) {
      setMessage(error.message.includes('CORS') 
        ? 'Connection error. Please try again.'
        : error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Subscribe'}
      </button>
      {message && <div className="message">{message}</div>}
    </form>
  );
}