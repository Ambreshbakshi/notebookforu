'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Head from 'next/head';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      setError("No order ID found in URL");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          setError("Order not found in database");
          return;
        }

        const data = orderSnap.data();
        console.log("Order data:", data); // Debug log
        setOrderData(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    // Clear cart from localStorage
    try {
      localStorage.removeItem("cart");
    } catch (e) {
      console.warn("Failed to clear cart from localStorage", e);
    }

    fetchOrder();
  }, [searchParams]);

  const generateInvoice = () => {
    if (!orderData) return;

    try {
      const docPDF = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set metadata
      docPDF.setProperties({
        title: `Invoice - ${searchParams.get("order_id")}`,
        subject: 'Purchase Invoice',
        author: 'NotebookForU',
        keywords: 'invoice, receipt, purchase',
        creator: 'NotebookForU'
      });

      // Colors
      const primaryColor = '#4CAF50';
      const secondaryColor = '#333333';

      // Header
      docPDF.setFontSize(18);
      docPDF.setTextColor(secondaryColor);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text("NotebookForU", 14, 20);
      
      docPDF.setFontSize(12);
      docPDF.setFont('helvetica', 'normal');
      docPDF.text("Invoice", 14, 26);

      // Logo (try-catch for safety)
      try {
        docPDF.addImage('/logo.jpg', 'JPG', 160, 10, 30, 30);
      } catch (error) {
        console.log("Logo image not found or inaccessible in PDF");
      }

      // Order details section
      docPDF.setFontSize(10);
      docPDF.text("www.notebookforu.in", 14, 34);
      docPDF.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 40);
      docPDF.text(`Order ID: ${searchParams.get("order_id")}`, 14, 46);
      
      // Payment Details - Corrected and Enhanced
      docPDF.text(`Payment ID: ${orderData.payment?.id || 'N/A'}`, 14, 52);
      docPDF.text(`Razorpay Order ID: ${orderData.payment?.order_id || 'N/A'}`, 14, 58);
      docPDF.text(`Payment Method: ${orderData.paymentMethod || 'N/A'}`, 14, 64);
docPDF.text(`Payment Status: ${orderData.paymentStatus || 'N/A'}`, 14, 70);

      docPDF.text(`Verified: ${orderData.payment?.verified ? 'Yes' : 'No'}`, 14, 76);
      docPDF.text(`Verified At: ${orderData.payment?.verified_at?.toDate().toLocaleString() || 'N/A'}`, 14, 82);

      // Customer details
      docPDF.setFontSize(11);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text("Bill To:", 14, 94);
      docPDF.setFont('helvetica', 'normal');
      docPDF.text(`${orderData.customer?.name || 'N/A'}`, 14, 100);
      docPDF.text(`${orderData.customer?.email || 'N/A'}`, 14, 106);
      docPDF.text(`${orderData.customer?.phone || 'N/A'}`, 14, 112);
      
      // Handle multi-line address
      const addressLines = docPDF.splitTextToSize(orderData.shipping?.address || 'N/A', 150);
      docPDF.text(addressLines, 14, 118);

      // Calculate totals
      const itemsTotal = orderData?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
      const shippingCost = orderData?.shipping?.cost || 0;
      const grandTotal = itemsTotal + shippingCost;

      // Items table
      const items = orderData?.items?.map((item, index) => [
        index + 1,
        item.name,
        item.quantity,
        `Rs.${item.price.toFixed(2)}`,
        `Rs.${(item.price * item.quantity).toFixed(2)}`
      ]) || [];

      // Use the imported autoTable function directly
      autoTable(docPDF, {
        startY: 130,
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold'
        },
        head: [['S.No', 'Product', 'Qty', 'Unit Price', 'Total']],
        body: items,
        theme: 'grid',
        styles: {
          cellPadding: 3,
          fontSize: 9,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 70 },
          2: { cellWidth: 20 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 }
        }
      });

      // Totals section
      const finalY = docPDF.lastAutoTable.finalY + 10;
      docPDF.setFontSize(11);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text("Order Summary", 14, finalY);
      
      docPDF.setFont('helvetica', 'normal');
      docPDF.text(`Subtotal: Rs.${itemsTotal.toFixed(2)}`, 140, finalY, { align: 'right' });
      docPDF.text(`Shipping: Rs.${shippingCost.toFixed(2)}`, 140, finalY + 6, { align: 'right' });
      
      docPDF.setFontSize(12);
      docPDF.setFont('helvetica', 'bold');
      docPDF.text(`Grand Total: Rs.${grandTotal.toFixed(2)}`, 140, finalY + 14, { align: 'right' });

      // Footer
      docPDF.setFontSize(9);
      docPDF.setFont('helvetica', 'normal');
      docPDF.setTextColor(100);
      docPDF.text("Thank you for shopping with us!", 14, finalY + 24);
      docPDF.text("This is a system-generated invoice. No signature required.", 14, finalY + 30);
      docPDF.text("For any queries, contact: notebookforu009@gmail.com", 14, finalY + 36);

      // Save PDF
      docPDF.save(`Invoice_${searchParams.get("order_id")}_NotebookForU.pdf`);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Head>
          <title>Processing Payment - NotebookForU</title>
        </Head>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <div className="text-xl font-medium text-gray-700">Processing your payment...</div>
        <p className="text-sm text-gray-500 mt-2">Please wait while we verify your transaction</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Head>
          <title>Payment Error - NotebookForU</title>
        </Head>
        <div className="text-4xl font-bold text-red-600 mb-4">⚠️ Error</div>
        <p className="text-lg mb-4 text-center max-w-md">{error}</p>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Please contact support if you believe this is a mistake.
        </p>
        <div className="space-x-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <Head>
        <title>Payment Successful - NotebookForU</title>
        <meta name="description" content="Your payment was successful. Thank you for shopping with NotebookForU." />
      </Head>
      
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        {orderData && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{searchParams.get("order_id")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium">{orderData.payment?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium capitalize">{orderData.paymentStatus || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{orderData.paymentMethod || 'N/A'}</span>
              </div>
              {orderData.shipping?.trackingId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking ID:</span>
                  <span className="font-medium">{orderData.shipping.trackingId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(orderData.payment?.verified_at?.toDate() || new Date()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">
  Rs.{orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (orderData.shipping?.cost || 0)}
</span>

              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push(`/track-order?order_id=${searchParams.get("order_id")}`)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Track Order
          </button>
          {orderData && (
            <button
              onClick={generateInvoice}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Download Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}