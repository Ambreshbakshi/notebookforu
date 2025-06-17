"use client";
import { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from "next/image";
import Link from "next/link";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
    setIsLoading(false);
  }, []);

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const applyPromoCode = () => {
    // In a real app, you would validate the promo code with your backend
    if (promoCode.toUpperCase() === "NOTEBOOK10") {
      setDiscount(total * 0.1); // 10% discount
      toast.success("Promo code applied! 10% discount added");
    } else if (promoCode) {
      toast.error("Invalid promo code");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% tax
  };

  const total = calculateSubtotal() + shippingCost + calculateTax() - discount;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <ToastContainer position="bottom-right" />
      
      <div className="mb-6">
        <Link href="/notebook-gallery" className="flex items-center text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="mr-2" /> Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <FiShoppingBag className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/notebook-gallery" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Browse Notebooks
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="hidden md:grid grid-cols-12 gap-4 border-b pb-2 mb-4">
              <div className="col-span-5 font-medium">Product</div>
              <div className="col-span-2 font-medium text-center">Price</div>
              <div className="col-span-3 font-medium text-center">Quantity</div>
              <div className="col-span-2 font-medium text-right">Total</div>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 items-center border-b py-4"
              >
                <div className="col-span-5 flex items-center">
                  <div className="relative w-20 h-20 mr-4">
                    <Image
                      src={item.gridImage || "/placeholder-product.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h2 className="font-medium">{item.name}</h2>
                    {item.designation && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.designation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <span className="md:hidden text-sm text-gray-500 mr-2">Price:</span>
                  ₹{item.price.toFixed(2)}
                </div>

                <div className="col-span-3 flex items-center justify-center">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    className="w-12 text-center border rounded mx-2 py-1"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                <div className="col-span-2 text-right">
                  <span className="md:hidden text-sm text-gray-500 mr-2">Total:</span>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow-sm h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="mb-6">
              <label htmlFor="promo-code" className="block text-sm font-medium mb-2">
                Promo Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="promo-code"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyPromoCode}
                  className="px-4 py-2 bg-gray-800 text-white rounded-r hover:bg-gray-700"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition"
            >
              Proceed to Checkout
            </Link>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Free shipping on orders over ₹500
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;