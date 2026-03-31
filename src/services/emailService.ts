import { toast } from 'sonner';

/**
 * Mock email service to simulate sending emails.
 * In a real application, this would call a backend API that uses a service like SendGrid, Mailgun, or AWS SES.
 */
export const emailService = {
  sendOrderConfirmation: async (orderData: any) => {
    console.log('📧 Sending Order Confirmation Email:', orderData);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Confirmation email sent to ${orderData.customer_email || 'customer'}`);
    return { success: true };
  },

  sendDeliveryAssignment: async (orderId: string, driverName: string, deliveryDays: number, customerEmail: string) => {
    console.log(`📧 Sending Delivery Assignment Email for Order #${orderId}:`, { driverName, deliveryDays, customerEmail });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Delivery update email sent to customer`);
    return { success: true };
  },

  sendOrderStatusUpdate: async (orderId: string, status: string, customerEmail: string) => {
    console.log(`📧 Sending Status Update Email for Order #${orderId}:`, { status, customerEmail });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Status update email sent to customer`);
    return { success: true };
  }
};
