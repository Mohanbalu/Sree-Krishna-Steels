import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Package, Truck, CheckCircle, Clock, Search, Filter, Phone, MapPin, ChevronDown, ChevronUp, CreditCard, Calendar, User, ExternalLink } from 'lucide-react';
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
  payment_status?: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
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
    } catch (error: any) {
      toast.error('Failed to update status: ' + (error.message || 'Unknown error'));
      console.error('Update Status Error:', error);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error('Failed to update payment status: ' + (error.message || 'Unknown error'));
      console.error('Update Payment Status Error:', error);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-brand-brown mb-2">Order Management</h1>
        <p className="text-gray-500">Track and manage customer orders and fulfillment.</p>
      </div>

      <div className="flex flex-wrap gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Phone..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
          <Filter size={18} className="text-gray-400" />
          <select
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none"
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
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
          <CreditCard size={18} className="text-gray-400" />
          <select
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div 
                className="p-6 flex flex-wrap justify-between items-center gap-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getStatusColor(order.status))}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Order ID</p>
                    <p className="font-mono text-sm font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Customer</p>
                  <p className="font-bold text-gray-900">{order.customer_name}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Amount</p>
                  <p className="font-bold text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getPaymentStatusColor(order.payment_status || 'pending'))}>
                    {order.payment_status || 'pending'}
                  </span>
                  <div className="h-8 w-px bg-gray-100 mx-2" />
                  {expandedOrder === order.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                              <span className="flex items-center gap-2"><User size={14} /> Customer Information</span>
                              <Link 
                                to={`/admin/orders/${order.id}`}
                                className="text-brand-gold hover:underline flex items-center gap-1 normal-case tracking-normal"
                              >
                                Full Details <ExternalLink size={12} />
                              </Link>
                            </h3>
                            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                              <p className="text-sm font-bold text-gray-900">{order.customer_name}</p>
                              <p className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={14} className="text-brand-gold" /> {order.customer_phone}
                              </p>
                              <p className="flex items-start gap-3 text-sm text-gray-600">
                                <MapPin size={14} className="text-brand-gold mt-1 shrink-0" /> {order.address}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                              <CreditCard size={14} /> Payment & Fulfillment
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Status</label>
                                <select
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => updateStatus(order.id, e.target.value)}
                                  value={order.status}
                                  className={cn("w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border-none focus:ring-2 focus:ring-brand-gold", getStatusColor(order.status))}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Status</label>
                                <select
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                                  value={order.payment_status || 'pending'}
                                  className={cn("w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border-none focus:ring-2 focus:ring-brand-gold", getPaymentStatusColor(order.payment_status || 'pending'))}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                  <option value="failed">Failed</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Package size={14} /> Order Items
                          </h3>
                          <div className="space-y-3">
                            {order.order_items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded-xl"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-grow">
                                  <p className="font-bold text-gray-900">{item.title}</p>
                                  <p className="text-xs text-gray-500">Quantity: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center px-4">
                              <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total Amount</span>
                              <span className="text-2xl font-serif text-brand-brown">₹{order.total_amount.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="mt-12">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                              <Calendar size={14} /> Fulfillment Timeline
                            </h3>
                            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                              {[
                                { status: 'pending', label: 'Order Placed', date: order.created_at },
                                { status: 'confirmed', label: 'Confirmed', date: null },
                                { status: 'shipped', label: 'Shipped', date: null },
                                { status: 'delivered', label: 'Delivered', date: null },
                              ].map((step, idx) => {
                                const isCompleted = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status) >= ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(step.status);
                                return (
                                  <div key={step.status} className="relative">
                                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 transition-colors ${isCompleted ? 'bg-brand-gold' : 'bg-gray-200'}`} />
                                    <div>
                                      <p className={`text-sm font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                      <p className="text-xs text-gray-500">
                                        {step.date ? new Date(step.date).toLocaleString() : (isCompleted ? 'Updated just now' : 'Waiting...')}
                                      </p>
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
