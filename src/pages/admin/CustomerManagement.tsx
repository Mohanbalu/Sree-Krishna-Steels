import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Search, Mail, Phone, ShoppingBag, ChevronRight, X, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, orders(id, total_amount, status, created_at, payment_status)')
          .eq('role', 'customer')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
        setLoading(false);
      } catch (error) {
        handleSupabaseError(error, 'fetchCustomers');
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Customer Management</h1>
          <p className="text-gray-500">Manage your customers and view their order history.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-brown font-bold text-xl">
                {customer.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-brand-gold transition-colors">{customer.name}</h3>
                <p className="text-xs text-gray-500">Joined {new Date(customer.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-brand-gold" />
                <span className="text-sm font-bold text-gray-700">{customer.orders?.length || 0} Orders</span>
              </div>
              <button 
                onClick={() => setSelectedCustomer(customer)}
                className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1"
              >
                View History <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order History Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-brand-brown text-white">
                <div>
                  <h2 className="text-2xl font-serif mb-1">Order History</h2>
                  <p className="text-white/70 text-sm">{selectedCustomer.name} • {selectedCustomer.email}</p>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow">
                {selectedCustomer.orders?.length > 0 ? (
                  <div className="space-y-6">
                    {selectedCustomer.orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order: any) => (
                      <div key={order.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-wrap justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Order ID</p>
                            <p className="font-mono text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Date</p>
                          <p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Amount</p>
                          <p className="font-bold text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Payment</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.payment_status || 'pending'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-bold">No orders found for this customer.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return <Clock size={16} />;
    case 'confirmed': return <Package size={16} />;
    case 'shipped': return <Truck size={16} />;
    case 'delivered': return <CheckCircle size={16} />;
    default: return <Clock size={16} />;
  }
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
