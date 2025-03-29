import { render, screen, fireEvent } from '@testing-library/react';
import Footer from '../components/Footer';

describe('Footer Component', () => {
  it('shows error for invalid email', async () => {
    render(<Footer />);
    
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'invalid' }
    });
    fireEvent.click(screen.getByTestId('submit-button'));
    
    expect(await screen.findByTestId('error-message'))
      .toHaveTextContent('valid email');
  });

  it('shows success for valid submission', async () => {
    render(<Footer />);
    
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@success.com' }
    });
    fireEvent.click(screen.getByTestId('submit-button'));
    
    expect(await screen.findByTestId('success-message'))
      .toHaveTextContent('Thank you');
  });
});