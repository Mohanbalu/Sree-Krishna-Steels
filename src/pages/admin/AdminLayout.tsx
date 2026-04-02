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
  X,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to sign out');
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

  const SidebarContent = () => (
    <>
      <div className="p-8 flex items-center justify-between">
        {(isSidebarOpen || isMobileMenuOpen) && (
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
        {!isMobileMenuOpen && (
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hidden lg:block"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        )}
        {isMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500 group relative",
                isActive 
                  ? "bg-brand-gold text-brand-brown shadow-xl shadow-brand-gold/20" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", isActive ? "text-brand-brown" : "group-hover:text-brand-gold transition-colors")} />
              {(isSidebarOpen || isMobileMenuOpen) && (
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
              )}
              {isActive && (isSidebarOpen || isMobileMenuOpen) && (
                <ChevronRight size={14} className="ml-auto opacity-50" />
              )}
              {isActive && !isSidebarOpen && !isMobileMenuOpen && (
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
            (!isSidebarOpen && !isMobileMenuOpen) && "justify-center"
          )}
        >
          <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
          {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-brand-cream/20 flex">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-brand-brown text-white hidden lg:flex flex-col relative z-50 shadow-2xl"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-brand-brown text-white z-[70] flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-brand-brown/5 h-20 lg:h-24 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:gap-12 flex-grow">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-brand-brown/5 rounded-xl transition-all lg:hidden"
            >
              <Menu size={24} className="text-brand-brown" />
            </button>
            <h1 className="text-xl lg:text-2xl font-serif text-brand-brown whitespace-nowrap min-w-fit">
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

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4 pl-4 lg:pl-6 border-l border-brand-brown/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-brown leading-tight">{profile?.name}</p>
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-0.5">{profile?.role?.replace('_', ' ')}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-brand-gold text-brand-brown rounded-xl lg:rounded-2xl flex items-center justify-center font-serif font-bold text-base lg:text-lg shadow-lg shadow-brand-gold/10 shrink-0">
                {profile?.name?.[0]}
              </div>
            </div>
          </div>
        </header>


        {/* Page Content */}
        <div className="p-4 lg:p-8 overflow-y-auto">
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
