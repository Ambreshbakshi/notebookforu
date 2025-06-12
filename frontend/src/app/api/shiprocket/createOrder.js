// pages/api/shiprocket/createOrder.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderData } = req.body;

  try {
    const loginRes = await fetch("http://localhost:3000/api/shiprocket/login", {
      method: "POST",
    });

    const { token } = await loginRes.json();

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Order creation failed", details: err });
  }
}
