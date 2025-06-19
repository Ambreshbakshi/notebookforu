import { NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { db, adminAuth } from '@/lib/firebase-admin';

// Constants
const CONFIG = {
  MAX_ADDRESS_LENGTH: 200,
  MAX_ITEMS_PER_ORDER: 20,
  MAX_ORDER_AMOUNT: 1000000, // ₹10,000.00
  MAX_RETRIES: 3
};

const ERROR_MESSAGES = {
  INIT_FAILURE: 'Firebase initialization failed',
  INVALID_DATA: 'Invalid request data',
  MISSING_FIELDS: 'Required fields missing',
  UNAUTHORIZED: 'Authentication required',
  NOT_FOUND: 'Resource not found',
  LIMIT_EXCEEDED: 'Order limit exceeded',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMITED: 'Too many requests'
};

const STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500
};

const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Helpers
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
      address: String(data.shipping?.address || '').substring(0, CONFIG.MAX_ADDRESS_LENGTH)
    },
    items: (data.items || []).slice(0, CONFIG.MAX_ITEMS_PER_ORDER).map(item => ({
      id: String(item.id),
      name: String(item.name).substring(0, 100),
      price: Number(item.price) || 0,
      quantity: Math.min(Number(item.quantity) || 1, 10), // Max 10 per item
      weight: Number(item.weight) || 0.5
    }))
  };

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.customer.email)) {
    throw new Error(ERROR_MESSAGES.INVALID_DATA);
  }

  // Calculate and validate total amount
  const totalAmount = sanitized.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );
  
  if (totalAmount > CONFIG.MAX_ORDER_AMOUNT) {
    throw new Error(ERROR_MESSAGES.LIMIT_EXCEEDED);
  }

  return {
    ...sanitized,
    amount: totalAmount,
    status: ORDER_STATUSES.PENDING
  };
};

// Middleware
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

    return { 
      data,
      authToken,
      decodedToken,
      userId: decodedToken.uid 
    };
  } catch (error) {
    console.error('Request validation error:', error);
    return { 
      error: error.code === 'auth/id-token-expired' 
        ? 'Token expired' 
        : ERROR_MESSAGES.UNAUTHORIZED,
      status: STATUS_CODES.UNAUTHORIZED
    };
  }
};

// API Endpoints
export async function POST(request) {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    // 1. Authentication
    const validation = await validateRequest(request);
    if (validation.error) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status, headers }
      );
    }

    // 2. Data Validation
    const { data, userId } = validation;
    const requiredFields = ['items', 'customer', 'shipping'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.MISSING_FIELDS,
          missingFields,
          receivedFields: Object.keys(data)
        },
        { status: STATUS_CODES.BAD_REQUEST, headers }
      );
    }

    // 3. Sanitization
    const sanitizedData = sanitizeOrderData(data);
    const orderId = generateOrderId();

    // 4. Database Operation with Retry Logic
    let retries = 0;
    while (retries < CONFIG.MAX_RETRIES) {
      try {
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.set({
          ...sanitizedData,
          orderId,
          userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          _metadata: {
            appVersion: '1.0',
            environment: process.env.NODE_ENV
          }
        });

        // 5. Success Response
        return NextResponse.json(
          {
            success: true,
            data: {
              orderId,
              status: ORDER_STATUSES.PENDING,
              createdAt: new Date().toISOString(),
              amount: sanitizedData.amount
            }
          },
          { status: STATUS_CODES.SUCCESS, headers }
        );
      } catch (dbError) {
        retries++;
        if (retries >= CONFIG.MAX_RETRIES) {
          throw dbError;
        }
        await new Promise(resolve => setTimeout(resolve, 100 * retries));
      }
    }
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || ERROR_MESSAGES.SERVER_ERROR,
        code: error.code || 'internal_error',
        ...(process.env.NODE_ENV !== 'production' && {
          stack: error.stack
        })
      },
      { status: 
        error.message === ERROR_MESSAGES.LIMIT_EXCEEDED 
          ? STATUS_CODES.BAD_REQUEST 
          : STATUS_CODES.SERVER_ERROR,
        headers
      }
    );
  }
}

export async function GET(request) {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 50);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const offset = (page - 1) * limit;

    // Query Construction
    let query = db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    if (userId) query = query.where('userId', '==', userId);
    if (status) query = query.where('status', '==', status);

    // Execute Query
    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString()
      };
    });

    // Count Total (optimized)
    const totalSnapshot = await db.collection('orders')
      .count()
      .get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      _metadata: {
        timestamp: new Date().toISOString()
      }
    }, { headers });

  } catch (error) {
    console.error('[ORDER_GET_ERROR]', error);
    return NextResponse.json(
      { 
        success: false, 
        error: ERROR_MESSAGES.SERVER_ERROR,
        ...(process.env.NODE_ENV !== 'production' && { details: error.message })
      },
      { status: STATUS_CODES.SERVER_ERROR, headers }
    );
  }
}

export async function PATCH(request) {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    // 1. Authentication
    const validation = await validateRequest(request);
    if (validation.error) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: validation.status, headers }
      );
    }

    // 2. Input Validation
    const { data, userId } = validation;
    const { orderId, status, trackingId } = data;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: STATUS_CODES.BAD_REQUEST, headers }
      );
    }

    if (status && !Object.values(ORDER_STATUSES).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: STATUS_CODES.BAD_REQUEST, headers }
      );
    }

    // 3. Database Operation
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.NOT_FOUND },
        { status: STATUS_CODES.NOT_FOUND, headers }
      );
    }

    const now = Timestamp.now();
    const updateData = { updatedAt: now };
    
    if (status) updateData.status = status;
    if (trackingId) updateData.trackingId = trackingId;

    await db.runTransaction(async (transaction) => {
      transaction.update(orderRef, updateData);
      
      if (status) {
        transaction.set(orderRef.collection('history').doc(), {
          event: 'status_update',
          from: orderDoc.data().status,
          to: status,
          timestamp: now,
          by: userId,
          ...(trackingId && { trackingId })
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt'),
        updatedAt: now.toDate().toISOString()
      }
    }, { headers });

  } catch (error) {
    console.error('[ORDER_PATCH_ERROR]', error);
    return NextResponse.json(
      { 
        success: false, 
        error: ERROR_MESSAGES.SERVER_ERROR,
        ...(process.env.NODE_ENV !== 'production' && { details: error.message })
      },
      { status: STATUS_CODES.SERVER_ERROR, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}