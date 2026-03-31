import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronLeft,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear cart on logout
      useCartStore.getState().clearCart();
      
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to sign out');
      // Still navigate to login to clear local session state
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  // Only show User Management for super_admin
  if (profile?.role === 'super_admin') {
    menuItems.splice(4, 0, { icon: Users, label: 'Admins', path: '/admin/manage-admins' });
  }

  return (
    <div className="min-h-screen bg-brand-cream/20 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-brand-brown text-white flex flex-col relative z-50 shadow-2xl"
      >
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <img 
                  src="https://i.ibb.co/C3vGrKVv/Screenshot-2026-03-29-113001-removebg-preview.png" 
                  alt="Logo" 
                  className="w-10 h-10 object-contain brightness-0 invert"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -inset-1 bg-brand-gold/20 rounded-full blur-lg"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm tracking-tight leading-none">SREE KRISHNA</span>
                <span className="text-[8px] tracking-[0.4em] text-brand-gold font-bold uppercase mt-1">ADMIN</span>
              </div>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500 group relative",
                  isActive 
                    ? "bg-brand-gold text-brand-brown shadow-xl shadow-brand-gold/20" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-brand-brown" : "group-hover:text-brand-gold transition-colors")} />
                {isSidebarOpen && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                )}
                {isActive && isSidebarOpen && (
                  <ChevronRight size={14} className="ml-auto opacity-50" />
                )}
                {isActive && !isSidebarOpen && (
                  <div className="absolute left-0 w-1 h-6 bg-brand-gold rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 px-4 py-4 rounded-2xl text-white/30 hover:text-white hover:bg-red-500/10 transition-all w-full group",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
            {isSidebarOpen && <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-brand-brown/5 h-24 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-12 flex-grow">
            <h1 className="text-2xl font-serif text-brand-brown whitespace-nowrap min-w-fit">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div className="relative w-full max-w-md hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/30" size={16} />
              <input 
                type="text" 
                placeholder="Search analytics, orders, products..."
                className="w-full pl-12 pr-6 py-3 bg-brand-cream/30 border border-brand-brown/5 rounded-2xl text-sm focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-3 text-brand-charcoal/40 hover:text-brand-gold hover:bg-brand-gold/5 rounded-2xl transition-all">
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-brand-gold rounded-full border-2 border-white shadow-sm"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-brand-brown/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-brown leading-tight">{profile?.name}</p>
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-0.5">{profile?.role?.replace('_', ' ')}</p>
              </div>
              <div className="w-12 h-12 bg-brand-gold text-brand-brown rounded-2xl flex items-center justify-center font-serif font-bold text-lg shadow-lg shadow-brand-gold/10 shrink-0">
                {profile?.name?.[0]}
              </div>
            </div>
          </div>
        </header>


        {/* Page Content */}
        <div className="p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
