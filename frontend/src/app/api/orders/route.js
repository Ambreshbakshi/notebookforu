import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { db, adminAuth } from '@/lib/firebase-admin';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const CONFIG = {
  MAX_ADDRESS_LENGTH: 200,
  MAX_ITEMS_PER_ORDER: 20,
  MAX_ORDER_AMOUNT: 1000000,
  MAX_RETRIES: 3
};

const ERROR_MESSAGES = {
  INVALID_DATA: 'Invalid request data',
  MISSING_FIELDS: 'Required fields missing',
  UNAUTHORIZED: 'Authentication required',
  NOT_FOUND: 'Resource not found',
  LIMIT_EXCEEDED: 'Order limit exceeded',
  SERVER_ERROR: 'Internal server error',
};

const STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

const SHIPPING_STATUSES = {
  NOT_DISPATCHED: 'not_dispatched',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const PAYMENT_STATUSES = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUND_INITIATED: 'refund_initiated',
  REFUNDED: 'refunded'
};

const generateOrderId = () => `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const sanitizeOrderData = (data) => {
  const sanitized = {
    ...data,
    customer: {
      name: String(data.customer?.name || '').substring(0, 100),
      email: String(data.customer?.email || '').substring(0, 100).toLowerCase(),
      phone: String(data.customer?.phone || '').substring(0, 15),
      userId: String(data.customer?.userId || 'guest')
    },
    shipping: {
      ...data.shipping,
      address: String(data.shipping?.address || '').substring(0, CONFIG.MAX_ADDRESS_LENGTH),
      cost: Number(data.shipping?.cost) || 0
    },
    items: (data.items || []).slice(0, CONFIG.MAX_ITEMS_PER_ORDER).map(item => ({
      id: String(item.id),
      name: String(item.name).substring(0, 100),
      price: Number(item.price) || 0,
      quantity: Math.min(Number(item.quantity) || 1, 10),
      weight: Number(item.weight) || 0.5
    }))
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.customer.email)) {
    throw new Error(ERROR_MESSAGES.INVALID_DATA);
  }

  const itemsTotal = sanitized.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = sanitized.shipping.cost;

  const totalAmount = itemsTotal + shippingCost;

  if (totalAmount > CONFIG.MAX_ORDER_AMOUNT) {
    throw new Error(ERROR_MESSAGES.LIMIT_EXCEEDED);
  }

  return {
    ...sanitized,
    amount: totalAmount,
    shippingStatus: SHIPPING_STATUSES.NOT_DISPATCHED,
    paymentStatus: PAYMENT_STATUSES.UNPAID
  };
};

const validateRequest = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { error: ERROR_MESSAGES.UNAUTHORIZED, status: STATUS_CODES.UNAUTHORIZED };
    }

    const authToken = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const data = await request.json().catch(() => null);

    if (!data) {
      return { error: ERROR_MESSAGES.INVALID_DATA, status: STATUS_CODES.BAD_REQUEST };
    }

    return { data, userId: decodedToken.uid };
  } catch (error) {
    console.error('Request validation error:', error);
    return {
      error: error.code === 'auth/id-token-expired' ? 'Token expired' : ERROR_MESSAGES.UNAUTHORIZED,
      status: STATUS_CODES.UNAUTHORIZED
    };
  }
};

export async function POST(request) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const validation = await validateRequest(request);
    if (validation.error) {
      return NextResponse.json({ success: false, error: validation.error }, { status: validation.status, headers });
    }

    const { data, userId } = validation;

    if (data.orderId) {
      const orderDoc = await db.collection('orders').doc(data.orderId).get();
      if (!orderDoc.exists) {
        return NextResponse.json({ success: false, error: ERROR_MESSAGES.NOT_FOUND }, { status: STATUS_CODES.NOT_FOUND, headers });
      }

      const orderData = orderDoc.data();

      if (orderData.paymentStatus !== PAYMENT_STATUSES.UNPAID) {
        return NextResponse.json({
          success: false,
          error: 'Payment already completed or invalid status',
          currentStatus: orderData.paymentStatus
        }, { status: STATUS_CODES.BAD_REQUEST, headers });
      }

      const amountInPaise = Math.round(orderData.amount * 100);

      if (isNaN(amountInPaise) || amountInPaise < 100) {
        return NextResponse.json({ success: false, error: 'Invalid order amount' }, { status: STATUS_CODES.BAD_REQUEST, headers });
      }

      const razorOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: data.orderId,
        payment_capture: 1,
        notes: { orderId: data.orderId, userId: orderData.userId || 'guest' }
      });

      console.log(`Razorpay order created for ${data.orderId}`, razorOrder.id);

      return NextResponse.json({
        success: true,
        razorpayOrderId: razorOrder.id,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        orderId: data.orderId
      }, { status: STATUS_CODES.SUCCESS, headers });
    }

    const requiredFields = ['items', 'customer', 'shipping'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length) {
      return NextResponse.json({
        success: false,
        error: ERROR_MESSAGES.MISSING_FIELDS,
        missingFields
      }, { status: STATUS_CODES.BAD_REQUEST, headers });
    }

    const sanitizedData = sanitizeOrderData(data);
    const orderId = generateOrderId();

    let retries = 0;
    while (retries < CONFIG.MAX_RETRIES) {
      try {
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.set({
          ...sanitizedData,
          orderId,
          userId,
          trackingId: "Available Soon",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          _metadata: {
            appVersion: '1.0',
            environment: process.env.NODE_ENV
          }
        });

        return NextResponse.json({
          success: true,
          data: {
            orderId,
            shippingStatus: SHIPPING_STATUSES.NOT_DISPATCHED,
            paymentStatus: PAYMENT_STATUSES.UNPAID,
            amount: sanitizedData.amount,
            trackingId: "available soon",
            createdAt: new Date().toISOString()
          }
        }, { status: STATUS_CODES.SUCCESS, headers });

      } catch (dbError) {
        retries++;
        if (retries >= CONFIG.MAX_RETRIES) throw dbError;
        await new Promise(resolve => setTimeout(resolve, 100 * retries));
      }
    }
  } catch (error) {
    console.error('Order creation/payment failed:', error);
    return NextResponse.json({ success: false, error: error.message || ERROR_MESSAGES.SERVER_ERROR }, { status: STATUS_CODES.SERVER_ERROR, headers });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
