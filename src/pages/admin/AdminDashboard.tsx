import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Package, ShoppingBag, Users, TrendingUp, ChevronRight, Clock, CheckCircle, Truck } from 'lucide-react';
import { motion } from 'motion/react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total_amount, status');

        if (productsError) throw productsError;
        if (ordersError) throw ordersError;

        let revenue = 0;
        let pending = 0;
        ordersData?.forEach(order => {
          revenue += order.total_amount || 0;
          if (order.status === 'pending') pending++;
        });

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: ordersData?.length || 0,
          totalRevenue: revenue,
          pendingOrders: pending,
        });
      } catch (error) {
        handleSupabaseError(error, 'fetchStats');
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentOrders(data || []);
        setLoading(false);
      } catch (error) {
        handleSupabaseError(error, 'fetchRecentOrders');
      }
    };

    fetchStats();
    fetchRecentOrders();

    const ordersSubscription = supabase
      .channel('admin_dashboard_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
        fetchRecentOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

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
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif text-brand-brown">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link
              to="/admin/products"
              className="bg-brand-brown text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-charcoal transition-colors flex items-center gap-2"
            >
              <Package size={20} /> Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="bg-brand-gold text-brand-brown px-6 py-2.5 rounded-xl font-bold hover:bg-brand-gold/80 transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={20} /> Manage Orders
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-brand-gold/10"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">{stat.title}</p>
              <p className="text-3xl font-serif text-brand-brown">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-xl border border-brand-gold/10 overflow-hidden">
          <div className="p-8 border-b border-brand-gold/10 flex justify-between items-center">
            <h2 className="text-2xl font-serif text-brand-brown">Recent Orders</h2>
            <Link to="/admin/orders" className="text-brand-gold font-bold text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-cream/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Order ID</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Customer</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Amount</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Status</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/10">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-cream/20 transition-colors">
                    <td className="px-8 py-4 font-mono text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-8 py-4">
                      <p className="font-bold text-brand-brown">{order.customer_name}</p>
                      <p className="text-xs text-brand-charcoal/40">{order.customer_phone}</p>
                    </td>
                    <td className="px-8 py-4 font-bold text-brand-brown">₹{order.total_amount.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <Link to="/admin/orders" className="text-brand-gold hover:text-brand-brown transition-colors">
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-700';
    case 'confirmed': return 'bg-blue-100 text-blue-700';
    case 'shipped': return 'bg-purple-100 text-purple-700';
    case 'delivered': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
