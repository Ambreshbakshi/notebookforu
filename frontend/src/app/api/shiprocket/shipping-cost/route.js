// /api/shiprocket/shipping-cost.js
export async function POST(req) {
  const { pickup_pincode, delivery_pincode, weight } = await req.json();

  const tokenRes = await fetch("http://localhost:3000/api/shiprocket/login", {
    method: "POST",
  });
  const { token } = await tokenRes.json();

  const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pickup_postcode: pickup_pincode,
      delivery_postcode: delivery_pincode,
      weight: weight || 0.5,
      cod: 0,
    }),
  });

  const data = await res.json();
  return Response.json(data);
}
