import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment info" }, { status: 400 });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // ✅ Payment is verified!
      return NextResponse.json({ success: true, message: "Payment verified" });
    } else {
      // 🔴 Invalid signature
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("🔴 Payment verification failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
