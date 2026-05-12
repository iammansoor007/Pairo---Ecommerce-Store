import pairoEvents from '../events';
import QueueService from '../queue';
import { sendOrderConfirmation, sendAdminOrderNotification } from '../email';

/**
 * Initialize Order Listeners
 */
export function initOrderListeners() {
  // 1. ORDER_CREATED
  pairoEvents.on('ORDER_CREATED', (order) => {
    // Email Customer (Queue for reliability)
    QueueService.push('SEND_CUSTOMER_CONFIRMATION', async () => {
      await sendOrderConfirmation(order);
    }, { retries: 3, referenceId: order._id });

    // Email Admin (Queue for reliability)
    QueueService.push('SEND_ADMIN_NOTIFICATION', async () => {
      await sendAdminOrderNotification(order);
    }, { retries: 3, referenceId: order._id });

    // Update Analytics (Non-blocking)
    // In the future, we could trigger a cache revalidation here
  });

  // 2. ORDER_CANCELLED
  pairoEvents.on('ORDER_CANCELLED', (order) => {
     QueueService.push('SEND_CANCELLATION_EMAIL', async () => {
        // We'll need to add sendCancellationEmail to email.js
        console.log(`Sending cancellation email for order ${order.orderNumber}`);
     }, { retries: 3, referenceId: order._id });
  });

  // 3. ORDER_STATUS_UPDATED
  pairoEvents.on('ORDER_STATUS_UPDATED', ({ order, oldStatus, newStatus }) => {
    console.log(`Order ${order.orderNumber} status changed from ${oldStatus} to ${newStatus}`);
    // Future: Trigger status-specific emails (Shipped, Delivered)
  });

  console.log("✔ Order Listeners Initialized");
}
