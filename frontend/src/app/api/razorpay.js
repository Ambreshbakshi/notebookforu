// pages/api/razorpay.js
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, orderId } = req.body;
    
    const options = {
      amount: amount, // amount in smallest currency unit (paise for INR)
      currency: "INR",
      receipt: orderId,
    };

    const order = await instance.orders.create(options);
    
    return res.status(200).json(order);
  } catch (err) {
    console.error('Razorpay order error:', err);
    return res.status(500).json({ error: 'Error creating Razorpay order' });
  }
}