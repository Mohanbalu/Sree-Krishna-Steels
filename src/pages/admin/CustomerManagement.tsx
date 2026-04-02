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
      setLoading(true);
      try {
        // Fetch profiles and orders in parallel to speed up loading
        const [
          { data: profilesData, error: profilesError },
          { data: ordersData, error: ordersError }
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('role', 'customer')
            .order('created_at', { ascending: false }),
          supabase
            .from('orders')
            .select('id, user_id, total_amount, status, created_at, payment_status')
        ]);

        if (profilesError) throw profilesError;

        if (ordersError) {
          console.warn('Could not fetch orders for customers:', ordersError);
        }

        // Map orders to customers
        const customersWithOrders = (profilesData || []).map(profile => ({
          ...profile,
          orders: (ordersData || []).filter(order => order.user_id === profile.id)
        }));

        setCustomers(customersWithOrders);
      } catch (error) {
        handleSupabaseError(error, 'fetchCustomers');
      } finally {
        setLoading(false);
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
    <div className="space-y-6 lg:space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-serif text-brand-brown tracking-tight">Customer Base</h1>
          <p className="text-sm lg:text-base text-brand-brown/60 font-medium">Manage your clientele and review their purchase history.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-brand-brown/10 shadow-sm w-full lg:w-80">
          <div className="pl-3 text-brand-gold">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-brand-brown/30 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl lg:rounded-[2rem] border border-brand-brown/5 shadow-sm hover:shadow-xl hover:shadow-brand-brown/5 transition-all duration-500 overflow-hidden group"
          >
            <div className="p-6 lg:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-brown font-serif text-xl lg:text-2xl border border-brand-brown/5 group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                  {customer.name?.charAt(0)}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-1">
                    <Clock size={10} />
                    <span>Member Since</span>
                  </div>
                  <p className="text-[10px] lg:text-xs font-medium text-brand-brown/40">
                    {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-serif text-brand-brown mb-1 group-hover:text-brand-gold transition-colors duration-300 truncate">{customer.name}</h3>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-brand-brown/50 font-medium">
                  <Mail size={14} className="text-brand-gold/50 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-brand-brown/50 font-medium mt-1">
                    <Phone size={14} className="text-brand-gold/50 shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-brand-cream/30 rounded-2xl border border-brand-brown/5">
                <div className="text-center border-r border-brand-brown/10">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/30 mb-1">Orders</p>
                  <p className="text-base lg:text-lg font-serif text-brand-brown">{customer.orders?.length || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/30 mb-1">Spent</p>
                  <p className="text-base lg:text-lg font-serif text-brand-brown truncate">
                    ₹{(customer.orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedCustomer(customer)}
              className="w-full py-4 bg-brand-brown text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-brand-gold transition-colors duration-300"
            >
              View Portfolio <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Order History Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl lg:rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-brand-brown/10"
            >
              <div className="p-6 lg:p-12 border-b border-brand-brown/5 flex justify-between items-start bg-brand-cream/20">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 bg-brand-brown rounded-2xl lg:rounded-[2rem] flex items-center justify-center text-white font-serif text-2xl lg:text-4xl shadow-xl shadow-brand-brown/20 shrink-0">
                    {selectedCustomer.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[8px] lg:text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-gold/20">
                        Premium Client
                      </span>
                    </div>
                    <h2 className="text-xl lg:text-3xl font-serif text-brand-brown mb-1 truncate">{selectedCustomer.name}</h2>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4 text-brand-brown/50 text-[10px] lg:text-sm font-medium">
                      <span className="flex items-center gap-1.5 truncate"><Mail size={12} /> {selectedCustomer.email}</span>
                      {selectedCustomer.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {selectedCustomer.phone}</span>}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 lg:p-3 hover:bg-brand-brown hover:text-white rounded-xl lg:rounded-2xl transition-all duration-300 text-brand-brown/40 border border-brand-brown/10 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 lg:p-12 overflow-y-auto flex-grow custom-scrollbar">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h3 className="text-lg lg:text-xl font-serif text-brand-brown">Purchase History</h3>
                  <div className="sm:text-right">
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/30 mb-1">Lifetime Value</p>
                    <p className="text-xl lg:text-2xl font-serif text-brand-gold">
                      ₹{(selectedCustomer.orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedCustomer.orders?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCustomer.orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order: any) => (
                      <div key={order.id} className="group bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-brand-brown/5 hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-brown/5 transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-6">
                        <div className="flex items-center gap-4 lg:gap-6">
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shrink-0 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Reference</p>
                            <p className="font-mono text-xs lg:text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-8 flex-grow">
                          <div className="min-w-0">
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Date</p>
                            <p className="font-serif text-sm lg:text-base text-brand-brown truncate">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>

                          <div className="text-right sm:text-left">
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Investment</p>
                            <p className="font-serif text-brand-brown text-base lg:text-lg truncate">₹{order.total_amount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-brand-brown/5">
                          <div className="min-w-[100px]">
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/30 mb-1">Payment</p>
                            <span className={`inline-flex items-center gap-1.5 px-2 lg:px-3 py-1 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-wider border ${
                              order.payment_status?.toLowerCase() === 'paid' 
                                ? 'bg-green-50 text-green-600 border-green-100' 
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              <span className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${order.payment_status?.toLowerCase() === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
                              {order.payment_status || 'Pending'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.2em] border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 lg:py-24 bg-brand-cream/10 rounded-3xl lg:rounded-[3rem] border border-dashed border-brand-brown/10">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag size={28} lg:size={32} className="text-brand-brown/20" />
                    </div>
                    <h4 className="text-lg lg:text-xl font-serif text-brand-brown mb-2">No Acquisitions Yet</h4>
                    <p className="text-brand-brown/40 text-xs lg:text-sm max-w-xs mx-auto">This client hasn't made any purchases in your collection yet.</p>
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
  const s = status?.toLowerCase();
  switch (s) {
    case 'pending': return <Clock size={16} />;
    case 'processing': return <Package size={16} />;
    case 'shipped': return <Truck size={16} />;
    case 'delivered': return <CheckCircle size={16} />;
    default: return <Clock size={16} />;
  }
}

function getStatusColor(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'pending': return 'bg-orange-100 text-orange-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'shipped': return 'bg-purple-100 text-purple-700';
    case 'delivered': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
