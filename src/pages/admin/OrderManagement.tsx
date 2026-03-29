import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Package, Truck, CheckCircle, Clock, Search, Filter, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  order_items: any[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  payment_method: string;
  created_at: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
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
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      handleSupabaseError(error, 'updateStatus');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'confirmed': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-brand-brown mb-12">Order Management</h1>

        <div className="flex flex-wrap gap-6 mb-12">
          <div className="relative flex-grow lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40" size={20} />
            <input
              type="text"
              placeholder="Search by Order ID, Name, or Phone..."
              className="w-full bg-white border border-brand-gold/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-gold outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 bg-white border border-brand-gold/10 rounded-xl px-4 py-2">
            <Filter size={20} className="text-brand-charcoal/40" />
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-brand-brown outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl border border-brand-gold/10 overflow-hidden"
              >
                <div 
                  className="p-8 flex flex-wrap justify-between items-center gap-6 cursor-pointer hover:bg-brand-cream/10 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", getStatusColor(order.status))}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Order ID</p>
                      <p className="font-mono text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Customer</p>
                    <p className="font-bold text-brand-brown">{order.customer_name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Amount</p>
                    <p className="font-bold text-brand-brown">₹{order.total_amount.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      value={order.status}
                      className={cn("px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider outline-none border-none focus:ring-2 focus:ring-brand-gold", getStatusColor(order.status))}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-brand-gold/10 bg-brand-cream/20"
                    >
                      <div className="p-8 grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4">Customer Details</h3>
                            <div className="space-y-3">
                              <p className="flex items-center gap-3 text-brand-brown font-medium">
                                <Phone size={16} className="text-brand-gold" /> {order.customer_phone}
                              </p>
                              <p className="flex items-start gap-3 text-brand-brown font-medium">
                                <MapPin size={16} className="text-brand-gold mt-1 shrink-0" /> {order.address}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4">Payment Info</h3>
                            <p className="text-brand-brown font-medium uppercase text-sm tracking-wider">
                              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4">Order Items</h3>
                          <div className="space-y-4">
                            {order.order_items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-brand-gold/10">
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-grow">
                                  <p className="font-bold text-brand-brown text-sm">{item.title}</p>
                                  <p className="text-[10px] text-brand-charcoal/40">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                </div>
                                <p className="font-bold text-brand-brown text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
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
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
