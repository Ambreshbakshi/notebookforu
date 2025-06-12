import { NextResponse } from "next/server";

export async function POST(req) {
  const { pickup_pincode, delivery_pincode, cod, weight } = await req.json();

  try {
    const tokenRes = await fetch(`${process.env.SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    const { token } = await tokenRes.json();

    const checkRes = await fetch(`${process.env.SHIPROCKET_BASE_URL}/v1/external/courier/serviceability/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickup_postcode: pickup_pincode,
        delivery_postcode: delivery_pincode,
        cod,
        weight,
      }),
    });

    const checkData = await checkRes.json();
    return NextResponse.json(checkData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
