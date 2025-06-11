import nodemailer from 'nodemailer';
import { Order, OrderItem } from '@shared/schema';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bhautikkhunt4117@gmail.com',
    pass: 'itde ukag ubdv yskn'
  }
});

interface EmailOrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export async function sendOrderConfirmationEmail(order: Order) {
  try {
    const orderItems = order.orderItems as EmailOrderItem[];
    
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> #${order.id}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Customer Information</h2>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Shipping Address:</strong><br>${order.shippingAddress}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6;">
            <h3 style="color: #333; margin: 0;">Total Amount: ₹${order.totalAmount}</h3>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #e8f5e8; border-radius: 8px;">
          <p style="color: #2d5016; margin: 0; font-weight: bold;">Thank you for your order!</p>
          <p style="color: #2d5016; margin: 5px 0 0 0;">We'll send you updates as your order progresses.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'bhautikkhunt4117@gmail.com',
      to: order.customerEmail,
      subject: `Order Confirmation - Order #${order.id}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.customerEmail}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

export async function sendOrderStatusUpdateEmail(order: Order, previousStatus: string) {
  try {
    const orderItems = order.orderItems as EmailOrderItem[];
    
    let statusMessage = '';
    let statusColor = '#333';
    
    switch (order.status.toLowerCase()) {
      case 'processing':
        statusMessage = 'Your order is being processed and will be shipped soon.';
        statusColor = '#0066cc';
        break;
      case 'shipped':
        statusMessage = 'Great news! Your order has been shipped and is on its way to you.';
        statusColor = '#28a745';
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered. We hope you enjoy your purchase!';
        statusColor = '#28a745';
        break;
      case 'canceled':
      case 'cancelled':
        statusMessage = 'Your order has been canceled. If you have any questions, please contact us.';
        statusColor = '#dc3545';
        break;
      default:
        statusMessage = `Your order status has been updated to: ${order.status}`;
        statusColor = '#333';
    }

    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Order Status Update</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h2 style="color: ${statusColor}; margin-top: 0;">Status: ${order.status}</h2>
          <p style="color: #555; font-size: 16px;">${statusMessage}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> #${order.id}</p>
          <p><strong>Previous Status:</strong> ${previousStatus}</p>
          <p><strong>Updated Status:</strong> ${order.status}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Customer Information</h2>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Shipping Address:</strong><br>${order.shippingAddress}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6;">
            <h3 style="color: #333; margin: 0;">Total Amount: ₹${order.totalAmount}</h3>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #e8f5e8; border-radius: 8px;">
          <p style="color: #2d5016; margin: 0;">Thank you for shopping with us!</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'bhautikkhunt4117@gmail.com',
      to: order.customerEmail,
      subject: `Order Status Update - Order #${order.id} - ${order.status}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${order.customerEmail} - Status: ${order.status}`);
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    throw error;
  }
}