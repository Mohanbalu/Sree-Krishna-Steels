import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  User,
  Printer,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        handleSupabaseError(error, 'fetchOrder');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      handleSupabaseError(error, 'updateStatus');
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setOrder(prev => prev ? { ...prev, payment_status: newStatus as any } : null);
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      handleSupabaseError(error, 'updatePaymentStatus');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-serif text-brand-brown mb-1">Order Details</h1>
            <p className="text-gray-500 font-mono text-sm">#{order.id.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <Printer size={18} /> Print Invoice
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-brown text-white rounded-xl text-sm font-bold hover:bg-brand-brown/90 transition-all shadow-lg shadow-brand-brown/20">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package size={20} className="text-brand-gold" /> Order Items
              </h2>
            </div>
            <div className="p-8 space-y-6">
              {order.order_items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-2xl shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow">
                    <p className="font-bold text-lg text-gray-900 mb-1">{item.title}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-brand-brown">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold uppercase text-sm tracking-widest">Total Amount</span>
                <span className="text-3xl font-serif text-brand-brown">₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Calendar size={20} className="text-brand-gold" /> Fulfillment Timeline
            </h2>
            <div className="relative pl-10 space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {[
                { status: 'pending', label: 'Order Placed', date: order.created_at, desc: 'The order has been successfully placed by the customer.' },
                { status: 'confirmed', label: 'Order Confirmed', date: null, desc: 'The order has been reviewed and confirmed by our team.' },
                { status: 'shipped', label: 'Order Shipped', date: null, desc: 'The package has been handed over to the courier partner.' },
                { status: 'delivered', label: 'Order Delivered', date: null, desc: 'The customer has received the package.' },
              ].map((step, idx) => {
                const isCompleted = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status) >= ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(step.status);
                const isCurrent = order.status === step.status;

                return (
                  <div key={step.status} className="relative">
                    <div className={`absolute -left-10 w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-brand-gold text-brand-brown' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle size={16} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                    </div>
                    <div className={`${isCurrent ? 'bg-brand-gold/5 p-6 rounded-2xl border border-brand-gold/10' : ''}`}>
                      <p className={`text-lg font-bold mb-1 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {step.date ? new Date(step.date).toLocaleString() : (isCompleted ? 'Updated just now' : 'Pending...')}
                      </p>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Status Controls */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Update Status</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Order Status</label>
                <select
                  onChange={(e) => updateStatus(e.target.value)}
                  value={order.status}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider outline-none border-none focus:ring-2 focus:ring-brand-gold transition-all ${getStatusColor(order.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Payment Status</label>
                <select
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  value={order.payment_status || 'pending'}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider outline-none border-none focus:ring-2 focus:ring-brand-gold transition-all ${getPaymentStatusColor(order.payment_status || 'pending')}`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <User size={14} /> Customer Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-brown font-bold text-xl">
                  {order.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">Customer ID: {order.user_id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-brand-gold" />
                  <span className="font-medium">{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-brand-gold mt-1 shrink-0" />
                  <span className="font-medium leading-relaxed">{order.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard size={16} className="text-brand-gold" />
                  <span className="font-medium uppercase tracking-wider">{order.payment_method}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-orange-100 text-orange-700';
    case 'confirmed': return 'bg-blue-100 text-blue-700';
    case 'shipped': return 'bg-purple-100 text-purple-700';
    case 'delivered': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getPaymentStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
