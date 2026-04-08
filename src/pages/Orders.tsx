import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Package, Truck, CheckCircle, Clock, ChevronRight, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_items: any[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  payment_method: string;
  shipping_address: string;
  customer_name: string;
  customer_phone: string;
  driver_name?: string;
  delivery_days?: number;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        handleSupabaseError(error, 'fetchOrders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to changes
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔔 Real-time order change received in Orders.tsx:', payload);
        fetchOrders();
        if (payload.eventType === 'UPDATE') {
          const newStatus = (payload.new as any).status;
          toast.info(`Order status updated to ${newStatus}!`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return <Clock className="text-orange-500" />;
      case 'processing': return <Package className="text-blue-500" />;
      case 'shipped': return <Truck className="text-purple-500" />;
      case 'delivered': return <CheckCircle className="text-green-500" />;
      case 'cancelled': return <XCircle className="text-red-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressWidth = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return '0%';
      case 'processing': return '33%';
      case 'shipped': return '66%';
      case 'delivered': return '100%';
      default: return '0%';
    }
  };

  const isStepCompleted = (currentStatus: string, step: string) => {
    if (currentStatus.toLowerCase() === 'cancelled') return false;
    const stages = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = stages.indexOf(currentStatus.toLowerCase());
    const stepIndex = stages.indexOf(step.toLowerCase());
    return stepIndex <= currentIndex;
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderToCancel);

      if (error) throw error;
      
      toast.success('Order cancelled successfully');
      setOrders(prev => prev.map(o => o.id === orderToCancel ? { ...o, status: 'cancelled' } : o));
    } catch (error) {
      handleSupabaseError(error, 'cancelOrder');
    } finally {
      setCancelling(false);
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const confirmCancel = (id: string) => {
    setOrderToCancel(id);
    setIsCancelModalOpen(true);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-brand-brown mb-8 sm:mb-12">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-brand-gold/10 text-center">
            <Package size={64} className="text-brand-gold/20 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-brand-brown mb-4">No orders yet</h2>
            <p className="text-brand-charcoal/60 mb-8">
              When you place an order, it will appear here for you to track.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl shadow-xl border border-brand-gold/10 overflow-hidden"
                >
                  <div className="p-6 border-b border-brand-gold/10 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Order ID</p>
                      <p className="font-mono text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Date</p>
                      <p className="text-sm font-bold text-brand-brown">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2", getStatusColor(order.status))}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  {/* Order Progress Tracker */}
                  <div className="px-4 sm:px-8 py-6 border-b border-brand-gold/5 bg-brand-cream/10 overflow-x-auto custom-scrollbar">
                    <div className="relative flex items-center justify-between min-w-[300px]">
                      {/* Background Line */}
                      <div className="absolute left-0 top-2 -translate-y-1/2 w-full h-1 bg-brand-gold/10 rounded-full z-0"></div>
                      
                      {/* Active Progress Line */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: getProgressWidth(order.status) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute left-0 top-2 -translate-y-1/2 h-1 bg-brand-gold rounded-full z-0 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                      ></motion.div>
                      
                      {/* Steps */}
                      {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                          <motion.div 
                            initial={false}
                            animate={{ 
                              scale: isStepCompleted(order.status, step) ? 1.2 : 1,
                              backgroundColor: isStepCompleted(order.status, step) ? '#D4AF37' : '#FFFFFF'
                            }}
                            className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all duration-500",
                              isStepCompleted(order.status, step) 
                                ? "border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]" 
                                : "border-brand-gold/20"
                            )}
                          >
                            {isStepCompleted(order.status, step) && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full h-full flex items-center justify-center"
                              >
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </motion.div>
                            )}
                          </motion.div>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-[0.15em] transition-colors duration-500",
                            isStepCompleted(order.status, step) ? "text-brand-gold" : "text-brand-charcoal/30"
                          )}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {order.order_items.map((item, idx) => (
                      <Link 
                        to={`/products/${item.product_id}`} 
                        key={idx} 
                        className="flex items-center gap-4 p-2 rounded-2xl hover:bg-brand-cream/30 transition-all duration-300 group"
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow">
                          <h4 className="font-bold text-brand-brown group-hover:text-brand-gold transition-colors">{item.title}</h4>
                          <p className="text-xs text-brand-charcoal/60">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                        <p className="font-bold text-brand-brown">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>

                  <div className="p-6 bg-brand-cream/50 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-brand-brown">₹{order.total_amount.toLocaleString()}</p>
                      </div>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => confirmCancel(order.id)}
                          className="text-red-500 text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <XCircle size={14} /> Cancel Order
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      className="text-brand-gold font-bold text-sm flex items-center gap-1 hover:underline"
                    >
                      {expandedOrderId === order.id ? 'Hide Details' : 'View Details'} 
                      <ChevronRight size={16} className={cn("transition-transform", expandedOrderId === order.id && "rotate-90")} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedOrderId === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-brand-gold/10"
                      >
                        <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Shipping Information</h5>
                            <div className="space-y-2">
                              <p className="text-sm font-bold text-brand-brown">{order.customer_name}</p>
                              <p className="text-sm text-brand-charcoal/70 leading-relaxed">{order.shipping_address}</p>
                              <p className="text-sm text-brand-charcoal/70">{order.customer_phone}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Order Details</h5>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-brand-charcoal/40 uppercase font-bold">Payment Method</span>
                                <span className="text-sm font-bold text-brand-brown uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</span>
                              </div>
                              {order.driver_name && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-brand-charcoal/40 uppercase font-bold">Assigned Driver</span>
                                  <span className="text-sm font-bold text-brand-brown">{order.driver_name}</span>
                                </div>
                              )}
                              {order.delivery_days && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-brand-charcoal/40 uppercase font-bold">Est. Delivery</span>
                                  <span className="text-sm font-bold text-brand-brown">{order.delivery_days} Days</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-charcoal/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-serif text-brand-brown mb-4">Cancel Order?</h2>
            <p className="text-gray-500 mb-8">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                disabled={cancelling}
              >
                No, Keep it
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
