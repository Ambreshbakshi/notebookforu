// src/app/api/razorpay/verify/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase'; // adjust if your path differs
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update Firestore order
    await updateDoc(doc(db, 'orders', orderId), {
      paymentId: razorpay_payment_id,
      status: 'paid',
      paymentVerifiedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: razorpay_payment_id,
      message: 'Payment verified and order updated',
    });
  } catch (error) {
    console.error('[RAZORPAY_VERIFY_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
