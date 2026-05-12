import nodemailer from 'nodemailer';

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // TLS on port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Order Confirmation Email to Customer
 */
export async function sendOrderConfirmation(order) {
  if (!process.env.EMAIL_SERVER) {
    console.log(`[Email Simulation] Confirmation → ${order.customer?.email}`);
    return;
  }

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <small style="color:#666;">${item.selectedVariant?.title || ''}</small>
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">$${((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: auto; color: #1a1a1a;">
      <div style="background: #1a1a1a; padding: 30px; text-align: center;">
        <h1 style="color: #fff; margin: 0; letter-spacing: -1px; font-size: 28px;">PAIRO</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 20px; margin-bottom: 8px;">Order Confirmed ✓</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Hi ${order.shippingAddress?.fullName?.split(' ')[0] || 'there'}, thank you for your acquisition.<br/>
          Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being prepared for dispatch.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #888;">Product</th>
              <th style="padding: 10px; font-size: 11px; text-transform: uppercase; color: #888;">Qty</th>
              <th style="text-align: right; padding: 10px; font-size: 11px; text-transform: uppercase; color: #888;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 14px 10px; text-align: right; font-weight: 700;">Total Paid</td>
              <td style="padding: 14px 10px; text-align: right; font-weight: 700;">$${(order.financials?.total || 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div style="background: #f9f9f9; border-left: 4px solid #1a1a1a; padding: 20px; border-radius: 4px; margin-top: 30px;">
          <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Shipping To</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #333;">
            ${order.shippingAddress?.fullName || ''}<br/>
            ${order.shippingAddress?.street || ''}<br/>
            ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.zip || ''}<br/>
            ${order.shippingAddress?.country || ''}
          </p>
        </div>
      </div>
      <div style="border-top: 1px solid #eee; padding: 20px 30px; text-align: center;">
        <p style="font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
          Pairo Excellence • Global Acquisition Logistics
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"PAIRO Store" <${process.env.EMAIL_FROM}>`,
      to: order.customer?.email,
      subject: `Order Confirmed: #${order.orderNumber}`,
      html,
    });
    console.log(`[Gmail] ✅ Confirmation sent to ${order.customer?.email} | MsgID: ${info.messageId}`);
  } catch (err) {
    console.error('[Gmail] ❌ Failed to send confirmation:', err.message);
    throw err;
  }
}

/**
 * Send Admin Notification for New Order
 */
export async function sendAdminOrderNotification(order) {
  if (!process.env.EMAIL_SERVER) {
    console.log(`[Email Simulation] Admin notified of Order ${order.orderNumber}`);
    return;
  }

  if (!process.env.ADMIN_EMAIL) {
    console.warn('[Gmail] ADMIN_EMAIL not set — skipping admin notification.');
    return;
  }

  const html = `
    <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 500px; margin: auto; color: #1a1a1a;">
      <div style="background: #1a1a1a; padding: 20px 30px;">
        <h2 style="color: #fff; margin: 0; font-size: 18px;">🛍 New Order Received</h2>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border: 1px solid #eee;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Order Number</td><td style="padding: 8px 0; font-weight: 700;">#${order.orderNumber}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Customer</td><td style="padding: 8px 0;">${order.shippingAddress?.fullName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${order.customer?.email || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Items</td><td style="padding: 8px 0;">${(order.items || []).length}</td></tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 700; font-size: 16px;">Total</td>
            <td style="padding: 12px 0; font-weight: 700; font-size: 16px;">$${(order.financials?.total || 0).toLocaleString()}</td>
          </tr>
        </table>
        <div style="margin-top: 24px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/orders/${order._id}"
             style="background: #1a1a1a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 700;">
            View Order in Dashboard →
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"PAIRO System" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛍 New Order: #${order.orderNumber} — $${(order.financials?.total || 0).toLocaleString()}`,
      html,
    });
    console.log(`[Gmail] ✅ Admin notified | MsgID: ${info.messageId}`);
  } catch (err) {
    console.error('[Gmail] ❌ Failed to send admin notification:', err.message);
    throw err;
  }
}
