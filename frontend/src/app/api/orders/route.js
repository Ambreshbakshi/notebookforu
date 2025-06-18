import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { amount, items, customer, shipping } = await request.json();
    
    if (!amount || !items || !customer || !shipping) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderId = `ORD-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      orderId,
      amount,
      itemsCount: items.length,
      customerName: customer.name,
      shippingCost: shipping.cost
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}