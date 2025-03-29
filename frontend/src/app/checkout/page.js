"use client";
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const router = useRouter();

  const handleOrder = () => {
    localStorage.removeItem("cart");
    router.push("/order-confirmation");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Checkout</h1>
      <button
        onClick={handleOrder}
        className="block mx-auto bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700"
      >
        Place Order
      </button>
    </div>
  );
};

export default CheckoutPage;
