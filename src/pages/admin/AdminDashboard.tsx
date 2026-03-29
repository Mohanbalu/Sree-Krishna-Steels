import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    revenueChange: 12.5,
    ordersChange: -2.4,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        // Fetch Products Count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch Orders and Revenue (only completed/paid orders for revenue)
        const { data: ordersData } = await supabase
          .from('orders')
          .select('total_amount, status, created_at, payment_status');

        // Fetch Customers Count
        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');

        let revenue = 0;
        ordersData?.forEach(order => {
          // Sum revenue for paid or delivered orders
          if (order.payment_status === 'paid' || order.status === 'delivered') {
            revenue += order.total_amount || 0;
          }
        });

        // Calculate real chart data (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const dailyData = last7Days.map(date => {
          const dayOrders = ordersData?.filter(o => o.created_at.startsWith(date)) || [];
          const dayRevenue = dayOrders.reduce((sum, o) => {
            if (o.payment_status === 'paid' || o.status === 'delivered') {
              return sum + (o.total_amount || 0);
            }
            return sum;
          }, 0);
          
          return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            total: dayRevenue,
            orders: dayOrders.length
          };
        });

        setChartData(dailyData);

        setStats(prev => ({
          ...prev,
          totalProducts: productsCount || 0,
          totalOrders: ordersData?.length || 0,
          totalRevenue: revenue,
          totalCustomers: customersCount || 0,
        }));

        // Fetch Recent Orders
        const { data: recent } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentOrders(recent || []);

        // Fetch Top Selling Products
        // This requires joining order_items and products
        const { data: topItems, error: topItemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity, title, price, image_url')
          .limit(100);

        if (topItemsError) {
          console.error('Error fetching top items:', topItemsError);
          // Fallback to empty if table doesn't exist or columns mismatch
          setTopProducts([]);
        } else {
          const productSales: Record<string, any> = {};
          topItems?.forEach(item => {
            if (!productSales[item.product_id]) {
              productSales[item.product_id] = { ...item, total_sold: 0 };
            }
            productSales[item.product_id].total_sold += item.quantity;
          });

          const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.total_sold - a.total_sold)
            .slice(0, 5);

          setTopProducts(sortedProducts);
        }

        setLoading(false);
      } catch (error) {
        handleSupabaseError(error, 'fetchDashboardData');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [topProducts, setTopProducts] = useState<any[]>([]);

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      change: stats.revenueChange,
      icon: TrendingUp, 
      color: 'text-brand-gold', 
      bg: 'bg-brand-gold/10' 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toLocaleString(), 
      change: stats.ordersChange,
      icon: ShoppingBag, 
      color: 'text-brand-brown', 
      bg: 'bg-brand-brown/10' 
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts.toLocaleString(), 
      change: 0,
      icon: Package, 
      color: 'text-brand-charcoal', 
      bg: 'bg-brand-charcoal/10' 
    },
    { 
      title: 'Total Customers', 
      value: stats.totalCustomers.toLocaleString(), 
      change: 5.2,
      icon: Users, 
      color: 'text-brand-gold', 
      bg: 'bg-brand-gold/10' 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <Calendar size={18} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-700">Mar 29, 2026</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-brand-brown/5 shadow-xl shadow-brand-brown/5 hover:shadow-2xl hover:border-brand-gold/50 transition-all duration-500 group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", stat.bg)}>
                <stat.icon className={stat.color} size={28} strokeWidth={1.5} />
              </div>
              {stat.change !== 0 && (
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                  stat.change > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                )}>
                  {stat.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
            <p className="text-3xl font-serif text-brand-brown tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] border border-brand-brown/5 shadow-2xl shadow-brand-brown/5"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-serif text-brand-brown mb-1">Revenue Overview</h2>
              <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Monthly performance analytics</p>
            </div>
            <select className="bg-brand-cream/30 border-none text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[400px] w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#8E9299', fontSize: 10, fontWeight: 600}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#8E9299', fontSize: 10, fontWeight: 600}} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1A1A1A', 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      color: '#FFF',
                      fontSize: '12px',
                      padding: '12px 16px'
                    }}
                    itemStyle={{fontWeight: 'bold', color: '#D4AF37'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#D4AF37" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[3rem] border border-brand-brown/5 shadow-2xl shadow-brand-brown/5"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-serif text-brand-brown mb-1">Orders by Day</h2>
              <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Daily transaction volume</p>
            </div>
            <select className="bg-brand-cream/30 border-none text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[400px] w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#8E9299', fontSize: 10, fontWeight: 600}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#8E9299', fontSize: 10, fontWeight: 600}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#F5F5F0', radius: 12}}
                    contentStyle={{
                      backgroundColor: '#1A1A1A', 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      color: '#FFF',
                      fontSize: '12px',
                      padding: '12px 16px'
                    }}
                    itemStyle={{fontWeight: 'bold', color: '#D4AF37'}}
                  />
                  <Bar dataKey="total" fill="#3D2B1F" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Orders Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-[3rem] border border-brand-brown/5 shadow-2xl shadow-brand-brown/5 overflow-hidden"
        >
          <div className="p-10 border-b border-brand-brown/5 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-serif text-brand-brown mb-1">Recent Orders</h2>
              <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Latest transactions across all channels</p>
            </div>
            <Link to="/admin/orders" className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold hover:text-brand-brown transition-colors">View All Orders</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-cream/30">
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-charcoal/40">Order ID</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-charcoal/40">Customer</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-charcoal/40">Amount</th>
                  <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-charcoal/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-brown/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-10 py-6 font-mono text-xs font-bold text-brand-gold">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-10 py-6">
                      <p className="font-bold text-brand-brown text-sm">{order.customer_name || 'Customer'}</p>
                      <p className="text-[10px] text-brand-charcoal/40 font-medium">{order.customer_phone}</p>
                    </td>
                    <td className="px-10 py-6 font-bold text-brand-brown text-sm">₹{order.total_amount.toLocaleString()}</td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[3rem] border border-brand-brown/5 shadow-2xl shadow-brand-brown/5 overflow-hidden"
        >
          <div className="p-10 border-b border-brand-brown/5">
            <h2 className="text-2xl font-serif text-brand-brown mb-1">Top Products</h2>
            <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Most popular items this month</p>
          </div>
          <div className="p-8 space-y-8">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-6 group">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-cream border border-brand-brown/5 shadow-lg shadow-brand-brown/5 group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-brand-gold text-brand-brown text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-brand-brown text-sm truncate group-hover:text-brand-gold transition-colors">{product.title}</p>
                  <p className="text-[10px] text-brand-charcoal/40 font-bold uppercase tracking-widest mt-1">{product.total_sold} units sold</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-brand-gold text-sm">₹{product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={24} className="text-brand-charcoal/20" />
                </div>
                <p className="text-brand-charcoal/40 text-[10px] font-bold uppercase tracking-widest">No sales data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'processing': return 'bg-blue-50 text-blue-700 border border-blue-100';
    case 'shipped': return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
    case 'delivered': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'cancelled': return 'bg-red-50 text-red-700 border border-red-100';
    default: return 'bg-gray-50 text-gray-700 border border-gray-100';
  }
}

