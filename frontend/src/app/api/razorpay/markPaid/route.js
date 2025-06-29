import { db, adminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { orderId, razorpayPaymentId } = await request.json();

    if (!orderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Missing orderId or paymentId" }, { status: 400 });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await orderRef.update({
      paymentStatus: "paid",
      "payment.paymentMethod": "Razorpay",
      "payment.paymentId": razorpayPaymentId
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 400 });
  }
}
