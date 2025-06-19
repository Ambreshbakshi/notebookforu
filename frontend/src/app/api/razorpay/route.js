import Razorpay from "razorpay";
import { NextResponse } from "next/server";

// Initialize Razorpay with enhanced error handling
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    const requestData = await request.json().catch(() => null);
    
    if (!requestData) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400, headers }
      );
    }

    const { amount, orderId } = requestData;

    // 3. Validate required fields
    const missingFields = [];
    if (!amount) missingFields.push('amount');
    if (!orderId) missingFields.push('orderId');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          required: ['amount', 'orderId'],
          received: Object.keys(requestData)
        },
        { status: 400, headers }
      );
    }

    // 4. Validate amount (must be in paise and at least ₹1)
    if (typeof amount !== 'number' || amount < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount",
          message: "Amount must be in paise (100 = ₹1) and minimum ₹1",
          receivedAmount: amount
        },
        { status: 400, headers }
      );
    }

    // 5. Create Razorpay order with enhanced metadata
    const options = {
      amount: Math.round(amount),
      currency: "INR",
      receipt: `order_${orderId}`,
      notes: {
        orderId,
        system: 'your-store-frontend',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      },
      payment_capture: 1 // Auto-capture payments
    };

    console.log('Creating Razorpay order with options:', options);
    const razorpayOrder = await razorpay.orders.create(options);

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          status: razorpayOrder.status,
          receipt: razorpayOrder.receipt,
          createdAt: new Date().toISOString()
        },
        _metadata: {
          service: 'razorpay',
          version: '1.0'
        }
      },
      { status: 200, headers }
    );

  } catch (error) {
    // 7. Enhanced error handling
    console.error('Razorpay API Error:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      ...(error.error && { razorpayError: error.error })
    });

    const statusCode = error.error?.code === 'BAD_REQUEST_ERROR' ? 400 : 500;
    const errorMessage = error.error?.description || 'Payment processing failed';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: error.error?.code || 'SERVER_ERROR',
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            message: error.message,
            ...(error.error && { details: error.error })
          }
        })
      },
      { status: statusCode, headers }
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