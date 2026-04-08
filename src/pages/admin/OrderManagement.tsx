import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Package, Truck, CheckCircle, Clock, Search, Filter, Phone, MapPin, ChevronDown, ChevronUp, CreditCard, Calendar, User, ExternalLink, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { emailService } from '../../services/emailService';
import { useAuthStore } from '../../store/authStore';

interface Order {
  id: string;
  user_id: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address: string;
  order_items: any[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status?: 'pending' | 'paid' | 'failed';
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
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{ id: string, status: string } | null>(null);
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

    if (newStatus === 'cancelled') {
      setOrderToCancel({ id: orderId, status: newStatus });
      setIsCancelModalOpen(true);
      return;
    }

    await performStatusUpdate(orderId, newStatus);
  };

  const performStatusUpdate = async (orderId: string, newStatus: string) => {
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

  const handleConfirmCancel = async () => {
    if (orderToCancel) {
      const order = orders.find(o => o.id === orderToCancel.id);
      
      // Restore stock
      if (order && order.order_items) {
        console.log('📈 Restoring stock for cancelled order...');
        for (const item of order.order_items) {
          const { error: restoreError } = await supabase.rpc('increment_stock', {
            row_id: item.product_id,
            count: item.quantity
          });

          if (restoreError) {
            console.warn(`⚠️ RPC increment failed for ${item.product_id}, falling back to manual update:`, restoreError);
            const { data: currentProduct } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single();
            
            if (currentProduct) {
              await supabase
                .from('products')
                .update({ stock: currentProduct.stock + item.quantity })
                .eq('id', item.product_id);
            }
          }
        }
      }

      await performStatusUpdate(orderToCancel.id, orderToCancel.status);
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
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
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      (order as any).phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'all' || order.payment_status?.toLowerCase() === paymentFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
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
    <div className="space-y-6 lg:space-y-10 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl lg:text-4xl font-serif text-brand-brown tracking-tight">Orders</h1>
        <p className="text-sm lg:text-base text-gray-500 font-medium">Track and fulfill your premium client requests.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl lg:rounded-[2rem] border border-brand-brown/5 shadow-sm">
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
        <div className="flex flex-wrap gap-2 lg:gap-3 p-1">
          <div className="flex items-center gap-3 bg-white rounded-xl lg:rounded-[1.5rem] px-4 lg:px-6 py-2 border border-brand-brown/5 shadow-sm flex-1 min-w-[140px]">
            <Filter size={18} className="text-brand-brown/40" />
            <select
              className="bg-transparent border-none focus:ring-0 text-xs lg:text-sm font-bold text-brand-brown outline-none w-full cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Fulfillment</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-brand-brown/5 overflow-hidden hover:shadow-xl hover:shadow-brand-brown/5 transition-all duration-500"
            >
              <div 
                className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 cursor-pointer hover:bg-brand-cream/10 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between lg:justify-start gap-6">
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className={cn("w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-[1.25rem] flex items-center justify-center shadow-inner", getStatusColor(order.status))}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Order ID</p>
                      <p className="font-mono text-xs lg:text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className={cn("p-2 rounded-xl bg-brand-brown/5 transition-transform duration-300 lg:hidden", expandedOrder === order.id ? "rotate-180" : "")}>
                    <ChevronDown size={18} className="text-brand-brown/40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:flex lg:items-center lg:gap-8 flex-grow">
                  <div className="min-w-0">
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Customer</p>
                    <p className="font-serif text-base lg:text-lg text-brand-brown truncate">{order.customer_name || order.name || 'Unknown'}</p>
                  </div>

                  <div className="text-right lg:text-left">
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Total Value</p>
                    <p className="font-bold text-brand-gold text-base lg:text-lg">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-brand-brown/5">
                  <div className="flex items-center gap-2 lg:gap-6">
                    {order.driver_name && (
                      <div className="flex flex-col items-start lg:items-end gap-1">
                        <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30">Driver</p>
                        <span className="px-3 lg:px-4 py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest shadow-sm bg-blue-50 text-blue-700 border border-blue-100">
                          {order.driver_name}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col items-start lg:items-end gap-1">
                      <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30">Payment</p>
                      <span className={cn("px-3 lg:px-4 py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest shadow-sm", getPaymentStatusColor(order.payment_status || 'pending'))}>
                        {order.payment_status || 'pending'}
                      </span>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-2">
                    <div className="h-10 w-px bg-brand-brown/5 mx-2" />
                    <div className={cn("p-2 rounded-xl bg-brand-brown/5 transition-transform duration-300", expandedOrder === order.id ? "rotate-180" : "")}>
                      <ChevronDown size={20} className="text-brand-brown/40" />
                    </div>
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
                    <div className="p-6 lg:p-10">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                        <div className="space-y-8 lg:space-y-10">
                          <div className="space-y-4 lg:space-y-6">
                            <h3 className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center justify-between">
                              <span className="flex items-center gap-2"><User size={14} /> Client Profile</span>
                              <Link 
                                to={`/admin/orders/${order.id}`}
                                className="text-brand-gold hover:underline flex items-center gap-1 normal-case tracking-normal font-bold"
                              >
                                View Full Dossier <ExternalLink size={12} />
                              </Link>
                            </h3>
                            <div className="space-y-4 bg-white p-5 lg:p-6 rounded-3xl lg:rounded-[2rem] border border-brand-brown/5 shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-brand-cream flex items-center justify-center text-brand-brown font-serif text-lg lg:text-xl">
                                  {(order.customer_name || order.name || 'U').charAt(0)}
                                </div>
                                <div>
                                  <p className="text-base lg:text-lg font-serif text-brand-brown">{order.customer_name || order.name || 'Unknown'}</p>
                                  <p className="text-[10px] lg:text-xs text-brand-brown/40 font-medium">Verified Customer</p>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-brand-brown/5 space-y-3">
                                <p className="flex items-center gap-3 text-xs lg:text-sm text-brand-brown/70 font-medium">
                                  <Phone size={16} className="text-brand-gold" /> {order.customer_phone || order.phone || 'No phone'}
                                </p>
                                <p className="flex items-start gap-3 text-xs lg:text-sm text-brand-brown/70 font-medium leading-relaxed">
                                  <MapPin size={16} className="text-brand-gold mt-1 shrink-0" /> {order.shipping_address}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 lg:space-y-6">
                            <h3 className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center gap-2">
                              <CreditCard size={14} /> Status Management
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[9px] lg:text-[10px] font-bold text-brand-brown/30 uppercase tracking-[0.2em] ml-1">Fulfillment Stage</label>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <select
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                    value={order.status}
                                    className={cn("w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] outline-none border border-brand-brown/5 focus:ring-2 focus:ring-brand-gold shadow-sm transition-all cursor-pointer", getStatusColor(order.status))}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] lg:text-[10px] font-bold text-brand-brown/30 uppercase tracking-[0.2em] ml-1">Payment Verification</label>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <select
                                    onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                                    value={order.payment_status || 'pending'}
                                    className={cn("w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] outline-none border border-brand-brown/5 focus:ring-2 focus:ring-brand-gold shadow-sm transition-all cursor-pointer", getPaymentStatusColor(order.payment_status || 'pending'))}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8 lg:space-y-10">
                          <div className="space-y-4 lg:space-y-6">
                            <h3 className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center gap-2">
                              <Package size={14} /> Manifest
                            </h3>
                            <div className="space-y-4">
                              {order.order_items.map((item, idx) => (
                                <Link 
                                  to={`/products/${item.product_id}`}
                                  key={idx} 
                                  className="flex items-center gap-4 lg:gap-6 bg-white p-4 lg:p-5 rounded-2xl lg:rounded-[2rem] border border-brand-brown/5 shadow-sm group hover:shadow-md transition-all duration-300"
                                >
                                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl overflow-hidden shadow-inner shrink-0">
                                    <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="font-serif text-base lg:text-lg text-brand-brown group-hover:text-brand-gold transition-colors truncate">{item.title}</p>
                                    <p className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest mt-1">
                                      QTY: {item.quantity} <span className="mx-1 lg:mx-2">×</span> ₹{item.price.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-brand-gold text-base lg:text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                                  </div>
                                </Link>
                              ))}
                              
                              <div className="mt-6 lg:mt-10 pt-6 lg:pt-8 border-t border-brand-brown/5 flex justify-between items-center px-4 lg:px-6">
                                <div className="space-y-1">
                                  <span className="text-brand-brown/30 font-bold uppercase text-[9px] lg:text-[10px] tracking-[0.3em]">Total Investment</span>
                                  <p className="text-[10px] text-brand-brown/40 font-medium italic hidden sm:block">Including all premium services and taxes</p>
                                </div>
                                <span className="text-2xl lg:text-4xl font-serif text-brand-brown">₹{order.total_amount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6 lg:space-y-8">
                            <h3 className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 flex items-center gap-2">
                              <Calendar size={14} /> Fulfillment Journey
                            </h3>
                            <div className="relative pl-8 lg:pl-10 space-y-8 lg:space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-brown/5">
                              {[
                                { status: 'pending', label: 'Order Initiated', desc: 'Client submitted the request' },
                                { status: 'processing', label: 'Processing', desc: 'Order confirmed and items allocated' },
                                { status: 'shipped', label: 'In Transit', desc: 'Dispatched via premium courier' },
                                { status: 'delivered', label: 'Handover Complete', desc: 'Successfully delivered to client' },
                              ].map((step, idx) => {
                                const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status?.toLowerCase()) >= ['pending', 'processing', 'shipped', 'delivered'].indexOf(step.status);
                                return (
                                  <div key={step.status} className="relative">
                                    <div className={`absolute -left-8 lg:-left-10 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-4 border-white shadow-xl z-10 transition-all duration-500 ${isCompleted ? 'bg-brand-gold scale-110' : 'bg-brand-brown/5'}`} />
                                    <div className="space-y-1">
                                      <p className={`text-[10px] lg:text-sm font-bold uppercase tracking-widest ${isCompleted ? 'text-brand-brown' : 'text-brand-brown/30'}`}>{step.label}</p>
                                      <p className="text-[10px] lg:text-xs text-brand-brown/40 font-medium">{step.desc}</p>
                                      {isCompleted && step.status === 'pending' && (
                                        <p className="text-[9px] lg:text-[10px] text-brand-gold font-bold mt-1">
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
            <p className="text-gray-500 mb-8">Are you sure you want to cancel this order? This action will notify the customer and cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setOrderToCancel(null);
                }}
                className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                No, Keep it
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Cancel Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
