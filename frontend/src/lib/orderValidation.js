export const validateOrderData = (data) => {
  if (!data) return { valid: false, message: 'No data provided' };
  
  const { amount, items, customer, shipping, paymentMethod } = data;
  
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return { valid: false, message: 'Invalid amount' };
  }
  
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Invalid items array' };
  }
  
  if (!customer?.name || !customer?.email) {
    return { valid: false, message: 'Customer name and email are required' };
  }
  
  if (!shipping?.pincode || !shipping?.address) {
    return { valid: false, message: 'Shipping information incomplete' };
  }
  
  if (!paymentMethod) {
    return { valid: false, message: 'Payment method is required' };
  }
  
  return { valid: true };
};