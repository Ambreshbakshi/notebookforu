import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK securely using environment variables
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (err) {
    console.error('🔥 Firebase Admin Init Error:', err);
  }
}

const db = getFirestore();

// POST: Create new order
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, items, customer, shipping, paymentMethod } = body;

    if (!amount || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Amount or items missing/invalid' },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.email) {
      return NextResponse.json(
        { success: false, message: 'Customer details incomplete' },
        { status: 400 }
      );
    }

    if (!shipping?.cost || !shipping?.pincode) {
      return NextResponse.json(
        { success: false, message: 'Shipping info incomplete' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Payment method missing' },
        { status: 400 }
      );
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const orderData = {
      orderId,
      amount,
      items,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
      },
      shipping,
      paymentMethod,
      status: 'pending',
      trackingId: '',
      createdAt: new Date(), // server timestamp
    };

    await db.collection('orders').doc(orderId).set(orderData);

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('[ORDER_POST_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Server error while creating order.' },
      { status: 500 }
    );
  }
}

// GET: Fetch all orders
export async function GET() {
  try {
    const snapshot = await db.collection('orders').get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('[ORDER_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching orders.' },
      { status: 500 }
    );
  }
}

// PATCH: Update order status/tracking
export async function PATCH(request) {
  try {
    const { orderId, trackingId, status } = await request.json();

    if (!orderId || (!trackingId && !status)) {
      return NextResponse.json(
        { success: false, message: 'Order ID and update field(s) required' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (trackingId) updateData.trackingId = trackingId;
    if (status) updateData.status = status;

    await db.collection('orders').doc(orderId).update(updateData);

    return NextResponse.json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('[ORDER_PATCH_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Server error while updating order.' },
      { status: 500 }
    );
  }
}
