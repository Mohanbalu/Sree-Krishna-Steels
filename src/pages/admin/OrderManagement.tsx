import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Package, Truck, CheckCircle, Clock, Search, Filter, Phone, MapPin, ChevronDown, ChevronUp, CreditCard, Calendar, User, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { emailService } from '../../services/emailService';
import { useAuthStore } from '../../store/authStore';

interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  order_items: any[];
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  payment_method: string;
  payment_status?: 'Pending' | 'Paid' | 'Failed';
  created_at: string;
  driver_name?: string;
  delivery_days?: number;
  customer_email?: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { profile } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*),
            profiles:user_id (email)
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

    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!orderId || orderId === 'undefined' || orderId.length < 10) {
      console.warn('⚠️ Invalid order ID provided to updateStatus:', orderId);
      return;
    }

    console.log(`🔄 Attempting to update order ${orderId} status to: ${newStatus}`);
    try {
      const { error, count } = await supabase
        .from('orders')
        .update({ status: newStatus }, { count: 'exact' })
        .eq('id', orderId);

      if (error) throw error;
      
      if (count === 0) {
        console.warn(`⚠️ Update matched 0 rows. User role: ${profile?.role}. Check RLS policies or if order exists.`);
        toast.error(`Failed to update status: Access denied for your role (${profile?.role?.replace('_', ' ') || 'unknown'}).`);
        return;
      }

      console.log('✅ Order status updated in DB. Rows affected:', count);
      
      // Update local state immediately
      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: newStatus as any
      } : o));
      
      toast.success(`Order status updated to ${newStatus}`);

      // Send status update email if email is available
      const order = orders.find(o => o.id === orderId);
      const orderEmail = order?.customer_email || (order as any)?.profiles?.email;
      
      if (orderEmail && orderEmail !== 'customer@example.com') {
        console.log('📧 Sending status update email to:', orderEmail);
        await emailService.sendOrderStatusUpdate(orderId, newStatus, orderEmail);
      } else {
        console.warn('⚠️ Skipping status update email: No valid customer email found for order:', orderId);
      }
    } catch (error: any) {
      console.error('❌ Update Status Error:', error);
      toast.error('Failed to update status: ' + (error.message || 'Unknown error'));
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    if (!orderId || orderId === 'undefined' || orderId.length < 10) {
      console.warn('⚠️ Invalid order ID provided to updatePaymentStatus:', orderId);
      return;
    }

    console.log(`🔄 Attempting to update order ${orderId} payment status to: ${newStatus}`);
    try {
      const { error, count } = await supabase
        .from('orders')
        .update({ payment_status: newStatus }, { count: 'exact' })
        .eq('id', orderId);

      if (error) throw error;
      
      if (count === 0) {
        console.warn(`⚠️ Update matched 0 rows for payment status. User role: ${profile?.role}.`);
        toast.error(`Failed to update payment status: Access denied for your role (${profile?.role?.replace('_', ' ') || 'unknown'}).`);
        return;
      }

      console.log('✅ Payment status updated in DB for order:', orderId, 'Rows affected:', count);
      
      // Update local state immediately
      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        payment_status: newStatus as any
      } : o));
      
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('❌ Update Payment Status Error:', error);
      toast.error('Failed to update payment status: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Confirmed': return <Package size={16} />;
      case 'Shipped': return <Truck size={16} />;
      case 'Delivered': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-1">
        <h1 className="text-4xl font-serif text-brand-brown tracking-tight">Orders</h1>
        <p className="text-gray-500 font-medium">Track and fulfill your premium client requests.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-brand-brown/5 shadow-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-brown/30" size={20} />
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Phone..."
            className="w-full pl-14 pr-6 py-4 bg-transparent border-none rounded-2xl focus:ring-0 text-brand-brown font-medium placeholder:text-brand-brown/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 p-1">
          <div className="flex items-center gap-3 bg-white rounded-[1.5rem] px-6 py-2 border border-brand-brown/5 shadow-sm min-w-[160px]">
            <Filter size={18} className="text-brand-brown/40" />
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-brand-brown outline-none w-full cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Fulfillment</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-[1.5rem] px-6 py-2 border border-brand-brown/5 shadow-sm min-w-[160px]">
            <CreditCard size={18} className="text-brand-brown/40" />
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-brand-brown outline-none w-full cursor-pointer"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Payment</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-brand-brown/5 overflow-hidden hover:shadow-xl hover:shadow-brand-brown/5 transition-all duration-500"
            >
              <div 
                className="p-8 flex flex-wrap justify-between items-center gap-8 cursor-pointer hover:bg-brand-cream/10 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-6">
                  <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner", getStatusColor(order.status))}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Order ID</p>
                    <p className="font-mono text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="min-w-[150px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Customer</p>
                  <p className="font-serif text-lg text-brand-brown">{order.customer_name || order.name || 'Unknown'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Total Value</p>
                  <p className="font-bold text-brand-gold text-lg">₹{order.total_amount.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-6">
                  {order.driver_name && (
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30">Driver</p>
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm bg-blue-50 text-blue-700 border border-blue-100">
                        {order.driver_name}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30">Payment</p>
                    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm", getPaymentStatusColor(order.payment_status || 'pending'))}>
                      {order.payment_status || 'pending'}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-brand-brown/5 mx-2" />
                  <div className={cn("p-2 rounded-xl bg-brand-brown/5 transition-transform duration-300", expandedOrder === order.id ? "rotate-180" : "")}>
                    <ChevronDown size={20} className="text-brand-brown/40" />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-brand-brown/5 bg-brand-cream/5"
                  >
                    <div className="p-10">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="space-y-10">
                          <div className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center justify-between">
                              <span className="flex items-center gap-2"><User size={14} /> Client Profile</span>
                              <Link 
                                to={`/admin/orders/${order.id}`}
                                className="text-brand-gold hover:underline flex items-center gap-1 normal-case tracking-normal font-bold"
                              >
                                View Full Dossier <ExternalLink size={12} />
                              </Link>
                            </h3>
                            <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-brand-brown/5 shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center text-brand-brown font-serif text-xl">
                                  {(order.customer_name || order.name || 'U').charAt(0)}
                                </div>
                                <div>
                                  <p className="text-lg font-serif text-brand-brown">{order.customer_name || order.name || 'Unknown'}</p>
                                  <p className="text-xs text-brand-brown/40 font-medium">Verified Customer</p>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-brand-brown/5 space-y-3">
                                <p className="flex items-center gap-3 text-sm text-brand-brown/70 font-medium">
                                  <Phone size={16} className="text-brand-gold" /> {order.customer_phone || order.phone || 'No phone'}
                                </p>
                                <p className="flex items-start gap-3 text-sm text-brand-brown/70 font-medium leading-relaxed">
                                  <MapPin size={16} className="text-brand-gold mt-1 shrink-0" /> {order.shipping_address}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center gap-2">
                              <CreditCard size={14} /> Status Management
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-brand-brown/30 uppercase tracking-[0.2em] ml-1">Fulfillment Stage</label>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <select
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                    value={order.status}
                                    className={cn("w-full px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] outline-none border border-brand-brown/5 focus:ring-2 focus:ring-brand-gold shadow-sm transition-all cursor-pointer", getStatusColor(order.status))}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-brand-brown/30 uppercase tracking-[0.2em] ml-1">Payment Verification</label>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <select
                                    onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                                    value={order.payment_status || 'Pending'}
                                    className={cn("w-full px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] outline-none border border-brand-brown/5 focus:ring-2 focus:ring-brand-gold shadow-sm transition-all cursor-pointer", getPaymentStatusColor(order.payment_status || 'Pending'))}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Failed">Failed</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 space-y-10">
                          <div className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center gap-2">
                              <Package size={14} /> Manifest
                            </h3>
                            <div className="space-y-4">
                              {order.order_items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 bg-white p-5 rounded-[2rem] border border-brand-brown/5 shadow-sm group hover:shadow-md transition-all duration-300">
                                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner">
                                    <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <p className="font-serif text-lg text-brand-brown">{item.title}</p>
                                    <p className="text-xs font-bold text-brand-brown/40 uppercase tracking-widest mt-1">
                                      QTY: {item.quantity} <span className="mx-2">×</span> ₹{item.price.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-brand-gold text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="mt-10 pt-8 border-t border-brand-brown/5 flex justify-between items-center px-6">
                                <div className="space-y-1">
                                  <span className="text-brand-brown/30 font-bold uppercase text-[10px] tracking-[0.3em]">Total Investment</span>
                                  <p className="text-xs text-brand-brown/40 font-medium italic">Including all premium services and taxes</p>
                                </div>
                                <span className="text-4xl font-serif text-brand-brown">₹{order.total_amount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center gap-2">
                              <Calendar size={14} /> Fulfillment Journey
                            </h3>
                            <div className="relative pl-10 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-brown/5">
                              {[
                                { status: 'pending', label: 'Order Initiated', desc: 'Client submitted the request' },
                                { status: 'confirmed', label: 'Quality Verification', desc: 'Order confirmed and items allocated' },
                                { status: 'shipped', label: 'In Transit', desc: 'Dispatched via premium courier' },
                                { status: 'delivered', label: 'Handover Complete', desc: 'Successfully delivered to client' },
                              ].map((step, idx) => {
                                const isCompleted = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status) >= ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(step.status);
                                return (
                                  <div key={step.status} className="relative">
                                    <div className={`absolute -left-10 w-6 h-6 rounded-full border-4 border-white shadow-xl z-10 transition-all duration-500 ${isCompleted ? 'bg-brand-gold scale-110' : 'bg-brand-brown/5'}`} />
                                    <div className="space-y-1">
                                      <p className={`text-sm font-bold uppercase tracking-widest ${isCompleted ? 'text-brand-brown' : 'text-brand-brown/30'}`}>{step.label}</p>
                                      <p className="text-xs text-brand-brown/40 font-medium">{step.desc}</p>
                                      {isCompleted && step.status === 'pending' && (
                                        <p className="text-[10px] text-brand-gold font-bold mt-1">
                                          {new Date(order.created_at).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
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
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
