import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear local cart on logout (don't sync to Supabase so it's preserved for next login)
      useCartStore.getState().clearCart(false);
      
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to sign out');
      // Still navigate to home to clear local state
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Bulk Enquiry', path: '/bulk-enquiry' },
  ];

  const isHome = location.pathname === '/';
  const textColor = scrolled ? "text-brand-brown" : (isHome ? "text-white" : "text-brand-brown");

  return (
    <nav className={cn(
      "fixed w-full z-50 transition-all duration-500 px-8 py-6",
      scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm py-4" : "bg-transparent"
    )}>
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          onClick={() => window.scrollTo(0, 0)}
          className="flex items-center gap-5 shrink-0 group"
        >
          <div className="relative">
            <img 
              src="https://i.ibb.co/C3vGrKVv/Screenshot-2026-03-29-113001-removebg-preview.png" 
              alt="Sree Krishna Steels Logo" 
              className="w-14 h-14 object-contain transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -inset-2 bg-brand-gold/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "text-2xl font-serif font-bold tracking-tight leading-none transition-colors duration-500 whitespace-nowrap",
              textColor
            )}>SREE KRISHNA</span>
            <span className="text-[10px] font-sans tracking-[0.4em] text-brand-gold font-bold uppercase mt-1">STEELS</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-10">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.scrollTo(0, 0)}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-brand-gold relative group py-2",
                  location.pathname === link.path 
                    ? "text-brand-gold" 
                    : (scrolled ? "text-brand-charcoal" : (isHome ? "text-white" : "text-brand-charcoal"))
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-px bg-brand-gold transition-all duration-300 group-hover:w-full",
                  location.pathname === link.path ? "w-full" : ""
                )}></span>
              </Link>
            ))}
          </div>
          
          <div className="h-4 w-px bg-brand-gold/20"></div>

          <div className="flex items-center gap-6">
            {user && (
              <Link
                to="/cart"
                className={cn("relative p-2 transition-transform duration-300 hover:scale-110", textColor)}
              >
                <ShoppingCart size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-gold text-brand-brown text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {user && (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'staff') && (
              <Link
                to="/admin"
                className={cn("p-2 transition-transform duration-300 hover:scale-110", textColor)}
                title="Admin Dashboard"
              >
                <LayoutDashboard size={20} strokeWidth={1.5} />
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/orders"
                  className={cn("p-2 transition-transform duration-300 hover:scale-110", textColor)}
                  title="My Orders"
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={handleLogout}
                  className={cn("p-2 transition-transform duration-300 hover:scale-110", textColor)}
                  title="Logout"
                >
                  <LogOut size={20} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-brown text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold hover:text-brand-brown transition-all duration-500 shadow-xl shadow-brand-brown/10"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          {user && (
            <Link
              to="/cart"
              className={cn("relative p-2", textColor)}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-brown text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <button 
            className={cn("transition-colors duration-300", textColor)} 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-brand-cream border-t border-brand-gold/10 shadow-xl lg:hidden flex flex-col p-6 space-y-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                setIsOpen(false);
                window.scrollTo(0, 0);
              }}
              className="text-lg font-medium text-brand-charcoal hover:text-brand-gold"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-px w-full bg-brand-gold/10 my-2"></div>

          {user && (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'staff') && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-lg font-medium text-brand-charcoal hover:text-brand-gold"
            >
              <LayoutDashboard size={20} /> Admin Dashboard
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-medium text-brand-charcoal hover:text-brand-gold"
              >
                <User size={20} /> My Orders
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 text-lg font-medium text-brand-charcoal hover:text-brand-gold text-left"
              >
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="bg-brand-brown text-white text-center py-3 rounded-lg font-semibold"
            >
              Login
            </Link>
          )}
        </motion.div>
      )}
    </nav>
  );
}
