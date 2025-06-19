import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Configuration
const CONFIG = {
  MAX_ADDRESS_LENGTH: 200,
  MAX_ITEMS_PER_ORDER: 20,
  MAX_ORDER_AMOUNT: 1000000 // ₹10,000.00
};

const ERROR_MESSAGES = {
  INIT_FAILURE: 'Firebase initialization failed',
  INVALID_DATA: 'Invalid request data',
  MISSING_FIELDS: 'Required fields missing',
  UNAUTHORIZED: 'Authentication required',
  NOT_FOUND: 'Resource not found',
  LIMIT_EXCEEDED: 'Order limit exceeded',
  SERVER_ERROR: 'Internal server error'
};

const STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

// Firebase init
let db;
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_KEY?.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  }
  if (!db) {
  db = getFirestore();
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch (err) {
    // settings() can only be called once — ignore if already set
    if (!err.message.includes("settings() once")) throw err;
  }
}

} catch (error) {
  console.error('🔥 Firebase Init Error:', error);
  throw new Error(ERROR_MESSAGES.INIT_FAILURE);
}

// Middleware: validate and verify token
const validateRequest = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.split(' ')[1];

    if (!authToken) {
      return { error: ERROR_MESSAGES.UNAUTHORIZED, status: STATUS_CODES.UNAUTHORIZED };
    }

    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(authToken);
    } catch (err) {
      console.error("❌ Token verification failed:", err);
      return { error: "Invalid or expired token", status: STATUS_CODES.UNAUTHORIZED };
    }

    const data = await request.json().catch(() => null);
    if (!data) {
      return { error: ERROR_MESSAGES.INVALID_DATA, status: STATUS_CODES.BAD_REQUEST };
    }

    return { data, authToken, decodedToken };
  } catch (error) {
    console.error('Validation error:', error);
    return { error: ERROR_MESSAGES.INVALID_DATA, status: STATUS_CODES.BAD_REQUEST };
  }
};

// Helpers
const generateOrderId = () => `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const sanitizeOrder = (data) => {
  const sanitized = {
    ...data,
    customer: {
      name: String(data.customer?.name || '').substring(0, 100),
      email: String(data.customer?.email || '').substring(0, 100),
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
      quantity: Number(item.quantity) || 1,
      weight: Number(item.weight) || 0.5
    }))
  };

  if (!sanitized.customer.email.includes('@')) {
    throw new Error(ERROR_MESSAGES.INVALID_DATA);
  }

  if (sanitized.amount > CONFIG.MAX_ORDER_AMOUNT) {
    throw new Error('Order amount exceeds maximum limit');
  }

  return sanitized;
};

// POST
export async function POST(request) {
  try {
    const validation = await validateRequest(request);
    if (validation.error) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status }
      );
    }

    const { data, decodedToken } = validation;

    // Debug logs
    console.log("🔐 Decoded Firebase Token:", decodedToken);
    console.log("📦 Incoming Order Data:", JSON.stringify(data, null, 2));

    // Inject userId from verified token
    data.customer = {
      ...data.customer,
      userId: decodedToken?.uid || 'guest'
    };

    const sanitizedData = sanitizeOrder(data);
    const orderId = generateOrderId();
    const orderRef = db.collection('orders').doc(orderId);
    const now = Timestamp.now();

    const orderData = {
      ...sanitizedData,
      orderId,
      status: 'pending',
      trackingId: '',
      createdAt: now,
      updatedAt: now,
      _metadata: {
        ip: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      }
    };

    console.log("📝 Final Order Data to Save:", JSON.stringify(orderData, null, 2));

    await db.runTransaction(async (transaction) => {
      transaction.set(orderRef, orderData);
      transaction.set(orderRef.collection('history').doc(), {
        event: 'created',
        status: 'pending',
        timestamp: now,
        by: orderData.customer.userId
      });
    });

    return NextResponse.json({
      success: true,
      orderId,
      amount: orderData.amount,
      status: orderData.status
    });

  } catch (error) {
    console.error('[ORDER_POST_ERROR]', error.message);
    console.error('[STACK_TRACE]', error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || ERROR_MESSAGES.SERVER_ERROR,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: STATUS_CODES.SERVER_ERROR }
    );
  }
}


// GET and PATCH remain unchanged

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 50);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);

    let query = db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    if (userId) query = query.where('customer.userId', '==', userId);
    if (status) query = query.where('status', '==', status);

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

    const total = (await db.collection('orders').count().get()).data().count;

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('[ORDER_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: ERROR_MESSAGES.SERVER_ERROR },
      { status: STATUS_CODES.SERVER_ERROR }
    );
  }
}

export async function PATCH(request) {
  try {
    const validation = await validateRequest(request);
    if (validation.error) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: validation.status }
      );
    }

    const { data } = validation;
    const { orderId, status, trackingId } = data;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID required' },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: STATUS_CODES.BAD_REQUEST }
      );
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, message: ERROR_MESSAGES.NOT_FOUND },
        { status: STATUS_CODES.NOT_FOUND }
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
          by: validation.authToken.user_id // Or use customer ID
        });
      }
    });

    return NextResponse.json({
      success: true,
      updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt')
    });

  } catch (error) {
    console.error('[ORDER_PATCH_ERROR]', error);
    return NextResponse.json(
      { success: false, message: ERROR_MESSAGES.SERVER_ERROR },
      { status: STATUS_CODES.SERVER_ERROR }
    );
  }
}