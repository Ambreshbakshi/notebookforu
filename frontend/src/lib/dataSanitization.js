export const sanitizeOrderData = (data) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>"']/g, '');
  };

  return {
    ...data,
    customer: {
      name: sanitizeString(data.customer?.name),
      email: sanitizeString(data.customer?.email),
      phone: sanitizeString(data.customer?.phone),
      userId: sanitizeString(data.customer?.userId)
    },
    shipping: {
      ...data.shipping,
      address: sanitizeString(data.shipping?.address),
      pincode: sanitizeString(data.shipping?.pincode)
    },
    paymentMethod: sanitizeString(data.paymentMethod)
  };
};