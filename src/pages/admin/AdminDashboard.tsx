import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar
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

  useEffect(() => {
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
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      change: stats.ordersChange,
      icon: ShoppingBag, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      change: 0,
      icon: Package, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      title: 'Total Customers', 
      value: stats.totalCustomers, 
      change: 5.2,
      icon: Users, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Revenue Trends</h2>
            <select className="bg-gray-50 border-none text-sm font-bold rounded-lg px-3 py-1 focus:ring-2 focus:ring-brand-gold">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                  itemStyle={{fontWeight: 'bold', color: '#5D4037'}}
                />
                <Area type="monotone" dataKey="total" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Orders by Day</h2>
            <select className="bg-gray-50 border-none text-sm font-bold rounded-lg px-3 py-1 focus:ring-2 focus:ring-brand-gold">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                  itemStyle={{fontWeight: 'bold', color: '#5D4037'}}
                />
                <Bar dataKey="total" fill="#5D4037" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button className="text-brand-gold font-bold text-sm hover:underline">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Amount</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 font-mono text-sm font-bold text-brand-brown">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-8 py-4">
                      <p className="font-bold text-gray-900">{order.customer_name || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{order.customer_phone}</p>
                    </td>
                    <td className="px-8 py-4 font-bold text-gray-900">₹{order.total_amount.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
          </div>
          <div className="p-6 space-y-6">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-12 h-12 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -top-2 -left-2 w-5 h-5 bg-brand-gold text-brand-brown text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-gray-900 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500">{product.total_sold} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-brown">₹{product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500 italic">
                No sales data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-orange-100 text-orange-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'shipped': return 'bg-purple-100 text-purple-700';
    case 'delivered': return 'bg-emerald-100 text-emerald-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

