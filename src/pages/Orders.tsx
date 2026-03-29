import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  id: string;
  order_items: any[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  created_at: string;
  payment_method: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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
      }, fetchOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-orange-500" />;
      case 'confirmed': return <Package className="text-blue-500" />;
      case 'shipped': return <Truck className="text-purple-500" />;
      case 'delivered': return <CheckCircle className="text-green-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-brand-brown mb-12">My Orders</h1>

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

                  <div className="p-6 space-y-4">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow">
                          <h4 className="font-bold text-brand-brown">{item.title}</h4>
                          <p className="text-xs text-brand-charcoal/60">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                        <p className="font-bold text-brand-brown">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-brand-cream/50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-brand-brown">₹{order.total_amount.toLocaleString()}</p>
                    </div>
                    <button className="text-brand-gold font-bold text-sm flex items-center gap-1 hover:underline">
                      View Details <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
