"use client";
import { useEffect, useState } from "react";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleUpdateQuantity = (id, quantity) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-lg">Your cart is empty.</p>
      ) : (
        cartItems.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center border p-4 my-2"
          >
            <div className="flex items-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-gray-700">Rs. {item.price}</p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleUpdateQuantity(item.id, parseInt(e.target.value))
                }
                className="w-16 px-2 py-1 border rounded mr-4"
              />
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
      {cartItems.length > 0 && (
        <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Promo Code Section */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">Promo Code</h3>
            <div className="flex">
              <input
                type="text"
                placeholder="Enter promo code"
                className="w-full px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r hover:bg-gray-400">
                Apply
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-1/3 text-right">
            <div className="text-lg font-semibold mb-2">
              Subtotal: Rs. {total.toFixed(2)}
            </div>
            <div className="text-lg font-semibold mb-2">Shipping: Rs. 0.00 (Placeholder)</div>
            <div className="text-lg font-semibold mb-4">Tax: Rs. 0.00 (Placeholder)</div>
            <div className="text-2xl font-bold mb-6">Total: Rs. {total.toFixed(2)}</div>
            <div className="flex flex-col sm:flex-row justify-end">
              <a href="/notebook-gallery" className="mb-4 sm:mb-0 sm:mr-4 px-6 py-3 border border-blue-500 text-blue-500 rounded hover:bg-blue-50">Continue Shopping</a>
              <a href="/checkout" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">Proceed to Checkout</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
