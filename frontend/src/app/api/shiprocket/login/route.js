import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.SHIPROCKET_BASE_URL}/v1/external/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error("Shiprocket login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
