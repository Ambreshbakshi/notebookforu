'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a PDF invoice from the given order object.
 * @param {Object} order - The full order object with customer, items, payment, and shipping details.
 */
export default function generateInvoice(order) {
  if (!order) return;

  try {
    const docPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set document metadata
    docPDF.setProperties({
      title: `Invoice - ${order.orderId || order.id || 'Order'}`,
      subject: 'Purchase Invoice',
      author: 'NotebookForU',
      keywords: 'invoice, receipt, purchase',
      creator: 'NotebookForU',
    });

    const secondaryColor = '#333333';

    // Header: Brand and Invoice label
    docPDF.setFontSize(18);
    docPDF.setTextColor(secondaryColor);
    docPDF.setFont('helvetica', 'bold');
    docPDF.text('NotebookForU', 14, 20);

    docPDF.setFontSize(12);
    docPDF.setFont('helvetica', 'normal');
    docPDF.text('Invoice', 14, 26);

    // Logo (optional)
    try {
      docPDF.addImage('/logo.jpg', 'JPG', 160, 10, 30, 30);
    } catch (error) {
      console.warn('Logo image not found or inaccessible for PDF.');
    }

    // Invoice details
    docPDF.setFontSize(10);
    docPDF.text('www.notebookforu.in', 14, 34);
    docPDF.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 40);
    docPDF.text(`Order ID: ${order.orderId || order.id || 'N/A'}`, 14, 46);
    docPDF.text(`Payment ID: ${order.payment?.id || 'N/A'}`, 14, 52);
    docPDF.text(`Razorpay Order ID: ${order.payment?.order_id || 'N/A'}`, 14, 58);
    docPDF.text(`Payment Method: ${order.paymentMethod || 'Online'}`, 14, 64);
    docPDF.text(`Payment Status: ${order.paymentStatus || 'N/A'}`, 14, 70);

    // Customer details
    docPDF.setFontSize(11);
    docPDF.setFont('helvetica', 'bold');
    docPDF.text('Bill To:', 14, 82);
    docPDF.setFont('helvetica', 'normal');
    docPDF.text(order.customer?.name || 'N/A', 14, 88);
    docPDF.text(order.customer?.email || 'N/A', 14, 94);
    docPDF.text(order.customer?.phone || 'N/A', 14, 100);

    const addressLines = docPDF.splitTextToSize(order.shipping?.address || 'N/A', 150);
    docPDF.text(addressLines, 14, 106);

    // Items Table
    const items = order.items.map((item, index) => [
      index + 1,
      `${item.name}${item.pageType ? ` (${item.pageType})` : ''}`,
      item.quantity,
      `Rs.${item.price.toFixed(2)}`,
      `Rs.${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(docPDF, {
      startY: 116 + addressLines.length * 4,
      head: [['S.No', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: items,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
    });

    // Calculate totals
    const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = order.shipping?.cost || 0;
    const promoDiscount = order.promo?.discount || 0;
    const promoCode = order.promo?.code || null;
    const grandTotal = itemsTotal + shippingCost - promoDiscount;

    // Totals Section
    let y = docPDF.lastAutoTable.finalY + 10;
    docPDF.setFontSize(11);
    docPDF.setFont('helvetica', 'bold');
    docPDF.text('Order Summary', 14, y);

    docPDF.setFontSize(10);
    docPDF.setFont('helvetica', 'normal');
    y += 6;
    docPDF.text(`Subtotal: Rs.${itemsTotal.toFixed(2)}`, 140, y, { align: 'right' });
    y += 6;
    docPDF.text(`Shipping: Rs.${shippingCost.toFixed(2)}`, 140, y, { align: 'right' });
    y += 6;

    if (promoDiscount > 0) {
      docPDF.text(
        `Discount${promoCode ? ` (${promoCode})` : ''}: -Rs.${promoDiscount.toFixed(2)}`,
        140,
        y,
        { align: 'right' }
      );
      y += 6;
    }

    docPDF.setFontSize(12);
    docPDF.setFont('helvetica', 'bold');
    docPDF.text(`Grand Total: Rs.${grandTotal.toFixed(2)}`, 140, y + 2, { align: 'right' });

    // Footer
    docPDF.setFontSize(9);
    docPDF.setFont('helvetica', 'normal');
    docPDF.setTextColor(100);
    y += 14;
    docPDF.text('Thank you for shopping with us!', 14, y);
    docPDF.text('This is a system-generated invoice. No signature required.', 14, y + 6);
    docPDF.text('For queries, contact: notebookforu009@gmail.com', 14, y + 12);

    // Save the PDF
    docPDF.save(`Invoice_${order.orderId || order.id || 'Order'}.pdf`);
  } catch (error) {
    console.error('Error generating invoice:', error);
    alert('Failed to generate invoice. Please try again.');
  }
}
