// src/app/api/razorpay/verify/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
const getAdminApp = () => {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
  }
  return getApps()[0];
};

const adminApp = getAdminApp();
const adminDb = getFirestore(adminApp);

const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Missing required fields',
  INVALID_SIGNATURE: 'Invalid payment signature',
  ORDER_NOT_FOUND: 'Order not found or insufficient permissions',
  VERIFICATION_FAILED: 'Payment verification failed',
  SERVER_ERROR: 'Internal server error'
};

const STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

export async function POST(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  try {
    // 1. Validate request method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { success: false, error: 'Method not allowed' },
        { status: 405, headers }
      );
    }

    // 2. Parse and validate request data
    const requestData = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = requestData;

    // 3. Validate required fields
    const requiredFields = [
      'razorpay_order_id',
      'razorpay_payment_id',
      'razorpay_signature',
      'orderId'
    ];
    
    const missingFields = requiredFields.filter(field => !requestData[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.MISSING_FIELDS,
          missingFields,
          received: Object.keys(requestData)
        },
        { status: STATUS_CODES.BAD_REQUEST, headers }
      );
    }

    // 4. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    )) {
      console.error('Signature verification failed', {
        orderId,
        expectedSignature,
        receivedSignature: razorpay_signature
      });
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.INVALID_SIGNATURE },
        { status: STATUS_CODES.BAD_REQUEST, headers }
      );
    }

    // 5. Update order in Firestore using Admin SDK
    const orderRef = adminDb.collection('orders').doc(orderId);
    
    try {
      await orderRef.update({
        'payment.id': razorpay_payment_id,
        'payment.order_id': razorpay_order_id,
        'payment.verified': true,
        'payment.verified_at': FieldValue.serverTimestamp(),
        'status': 'paid',
        'updatedAt': FieldValue.serverTimestamp(),
        '_metadata.razorpay': {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          verification_timestamp: FieldValue.serverTimestamp()
        }
      });

      console.log('Payment verified successfully', { orderId });
      return NextResponse.json(
        { success: true, orderId, paymentId: razorpay_payment_id },
        { status: STATUS_CODES.SUCCESS, headers }
      );

    } catch (dbError) {
      console.error('Database operation failed:', {
        error: dbError.message,
        orderId,
        code: dbError.code
      });

      const statusCode = dbError.code === 'not-found' ? 
        STATUS_CODES.NOT_FOUND : 
        STATUS_CODES.SERVER_ERROR;

      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.ORDER_NOT_FOUND,
          ...(process.env.NODE_ENV !== 'production' && { details: dbError.message })
        },
        { status: statusCode, headers }
      );
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.VERIFICATION_FAILED },
      { status: STATUS_CODES.SERVER_ERROR, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}