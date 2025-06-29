import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req) {
  let orderId = "(unknown)";

  try {
    // 1. Content-Type Check
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return new Response(
        JSON.stringify({
          error: "Invalid content type",
          solution: "Set Content-Type: application/json"
        }),
        { status: 415 }
      );
    }

    // 2. Body Parsing
    const body = await req.json();
    orderId = body.orderId;
    const { cancellationReason = "user_requested" } = body;

    if (!orderId || typeof orderId !== "string" || orderId.length < 8) {
      return new Response(
        JSON.stringify({
          error: "Invalid order ID",
          details: "Must be a string with at least 8 characters",
          received: orderId
        }),
        { status: 400 }
      );
    }

    // 3. Authentication
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Missing authentication token",
          solution: "Include Authorization: Bearer <token> header"
        }),
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken?.uid) {
      return new Response(
        JSON.stringify({
          error: "Invalid authentication token"
        }),
        { status: 401 }
      );
    }

    // 4. Fetch Order
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return new Response(
        JSON.stringify({
          error: "Order not found",
          orderId,
          solution: "Verify the order ID and try again"
        }),
        { status: 404 }
      );
    }

    const orderData = orderSnap.data();

    // 5. Ownership Check
    const isOwner = (
      orderData.userId === decodedToken.uid ||
      (orderData.customer?.userId === decodedToken.uid)
    );

    if (!isOwner) {
      return new Response(
        JSON.stringify({
          error: "Permission denied",
          details: "You can only cancel your own orders",
          userId: decodedToken.uid,
          orderOwner: orderData.userId || orderData.customer?.userId
        }),
        { status: 403 }
      );
    }

    // 6. Cancellation Eligibility Check
    if (
      orderData.shippingStatus !== "not_dispatched" ||
      orderData.paymentStatus !== "paid"
    ) {
      return new Response(
        JSON.stringify({
          error: "Order cannot be cancelled",
          currentShippingStatus: orderData.shippingStatus,
          currentPaymentStatus: orderData.paymentStatus,
          allowedShippingStatus: "not_dispatched",
          allowedPaymentStatus: "paid",
          solution: "Only orders that are paid and not dispatched can be cancelled"
        }),
        { status: 400 }
      );
    }

    // 7. Batch Transaction
    const batch = adminDb.batch();

    batch.update(orderRef, {
      shippingStatus: "cancelled",
      paymentStatus: "refund_initiated",
      updatedAt: FieldValue.serverTimestamp(),
      cancelledBy: decodedToken.uid,
      cancellationReason: cancellationReason.slice(0, 100)
    });

    const auditLogRef = adminDb.collection("orderAuditLogs").doc(`${orderId}_${Date.now()}`);
    batch.set(auditLogRef, {
      action: "cancellation",
      orderId,
      performedBy: decodedToken.uid,
      timestamp: FieldValue.serverTimestamp(),
      previousShippingStatus: orderData.shippingStatus,
      newShippingStatus: "cancelled",
      previousPaymentStatus: orderData.paymentStatus,
      newPaymentStatus: "refund_initiated",
      reason: cancellationReason,
      ipAddress: req.headers.get("x-forwarded-for") || req.ip
    });

    await batch.commit();

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        newShippingStatus: "cancelled",
        newPaymentStatus: "refund_initiated",
        refundInitiated: true,
        timestamp: new Date().toISOString()
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error(`Critical error in cancellation for order ${orderId}:`, error);

    return new Response(
      JSON.stringify({
        error: error.code === "permission-denied" ? "Permission denied" : "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : "Please try again later",
        ...(process.env.NODE_ENV === "development" && {
          stack: error.stack,
          rawError: error
        })
      }),
      { status: error.code === "permission-denied" ? 403 : 500 }
    );
  }
}
