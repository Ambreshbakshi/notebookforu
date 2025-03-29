"use client";
import { useEffect, useState } from "react";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-lg">Your cart is empty.</p>
      ) : (
        cartItems.map((item, index) => (
          <div key={index} className="border p-4 my-2">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-700">{item.price}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default CartPage;
