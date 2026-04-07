import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

/**
 * Mock email service to simulate sending emails.
 * In a real application, this would call a backend API that uses a service like SendGrid, Mailgun, or AWS SES.
 */
export const emailService = {
  sendOrderConfirmation: async (orderData: any) => {
    console.log('📧 Sending Order Confirmation Email:', orderData);
    
    // Log to Supabase notifications table for admin visibility
    try {
      const breakdown = `Subtotal: ₹${orderData.subtotal.toLocaleString()} | GST (18%): ₹${orderData.gst_amount.toLocaleString()} | Delivery: ₹${orderData.delivery_fee.toLocaleString()}`;
      await supabase.from('notifications').insert([{
        type: 'order_confirmation',
        message: `Order #${orderData.order_id} confirmed for ${orderData.customer_name}. Total: ₹${orderData.total_amount.toLocaleString()} (${breakdown})`,
        user_id: orderData.user_id || null,
        created_at: new Date().toISOString(),
        read: false
      }]);
    } catch (err) {
      console.warn('Could not log notification:', err);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Confirmation email sent to ${orderData.customer_email || 'customer'}`);
    return { success: true };
  },

  sendDeliveryAssignment: async (orderId: string, driverName: string, deliveryDays: number, customerEmail: string) => {
    console.log(`📧 Sending Delivery Assignment Email for Order #${orderId}:`, { driverName, deliveryDays, customerEmail });
    
    // Log to Supabase
    try {
      await supabase.from('notifications').insert([{
        type: 'delivery_assignment',
        message: `Order #${orderId} assigned to ${driverName}. Expected delivery in ${deliveryDays} days.`,
        created_at: new Date().toISOString(),
        read: false
      }]);
    } catch (err) {
      console.warn('Could not log notification:', err);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Delivery update email sent to customer`);
    return { success: true };
  },

  sendOrderStatusUpdate: async (orderId: string, status: string, customerEmail: string) => {
    console.log(`📧 Sending Status Update Email for Order #${orderId}:`, { status, customerEmail });
    
    // Log to Supabase
    try {
      await supabase.from('notifications').insert([{
        type: 'status_update',
        message: `Order #${orderId} status updated to ${status}.`,
        created_at: new Date().toISOString(),
        read: false
      }]);
    } catch (err) {
      console.warn('Could not log notification:', err);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Status update email sent to customer`);
    return { success: true };
  }
};
