import { NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function POST(request) {
  try {
    const { orderId, trackingId } = await request.json();

    if (!orderId || !trackingId) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { trackingId });

    return NextResponse.json({ success: true, message: "Tracking ID updated" }, { status: 200 });
  } catch (error) {
    console.error("TRACKING UPDATE ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
