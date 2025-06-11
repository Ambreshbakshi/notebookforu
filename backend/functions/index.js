/* eslint-disable camelcase */
/* eslint-disable max-len */


const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Firestore DB instance
const db = admin.firestore();

// Razorpay credentials
const razorpay = new Razorpay({
  key_id: "rzp_test_HYxUlCVzxxvJQY",
  key_secret: "s7SyZ6G2HbI4qLzqsCX3rjAB",
});

// Cloud Function to verify payment
exports.verifyPayment = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {razorpay_order_id, razorpay_payment_id, razorpay_signature, userData} = req.body;

  const generated_signature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

  if (generated_signature === razorpay_signature) {
    // Signature matches → store in Firestore
    try {
      await db.collection("payments").add({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).send({status: "success", message: "Payment verified and saved."});
    } catch (err) {
      console.error("Firestore error:", err);
      return res.status(500).send({status: "error", message: "Failed to store payment data."});
    }
  } else {
    return res.status(400).send({status: "fail", message: "Invalid signature."});
  }
});
