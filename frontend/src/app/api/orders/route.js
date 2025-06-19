import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Utility: generate a unique order ID
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

export async function POST(request) {
  try {
    const { amount, items, customer, shipping, paymentMethod } = await request.json();

    if (!amount || !items || !customer || !shipping || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();

    // Prepare the order object
    const orderData = {
      orderId,
      amount,
      items,
      customer,
      shipping,
      paymentMethod,
      trackingId: null,
      courier: 'India Post',
      createdAt: new Date().toISOString(),
    };
console.log("Order saved to Firestore:", orderId);

    // Send response immediately
    const response = NextResponse.json({
      success: true,
      orderId,
      amount,
      itemsCount: items.length,
      customerName: customer.name,
      shippingCost: shipping.cost,
    });

    // Perform Firestore write in the background
    setDoc(doc(db, 'orders', orderId), orderData).catch((err) =>
      console.error('[ORDER_WRITE_ERROR]', err)
    );

    return response;
  } catch (error) {
    console.error('[ORDER_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
