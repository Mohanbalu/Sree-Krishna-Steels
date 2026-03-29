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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
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
      "fixed w-full z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-brand-cream/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-8">
        <Link 
          to="/" 
          onClick={() => window.scrollTo(0, 0)}
          className="flex items-center gap-4 shrink-0"
        >
          <img 
            src="https://i.ibb.co/C3vGrKVv/Screenshot-2026-03-29-113001-removebg-preview.png" 
            alt="Sree Krishna Steels Logo" 
            className="w-16 h-16 object-contain transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className={cn(
              "text-2xl font-serif font-bold tracking-tighter leading-none transition-colors duration-300 whitespace-nowrap",
              textColor
            )}>SREE KRISHNA</span>
            <span className="text-xs font-sans tracking-[0.3em] text-brand-gold font-semibold">STEELS</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => window.scrollTo(0, 0)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-gold uppercase tracking-wider whitespace-nowrap",
                location.pathname === link.path 
                  ? "text-brand-gold" 
                  : (scrolled ? "text-brand-charcoal" : (isHome ? "text-white" : "text-brand-charcoal"))
              )}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-6 w-px bg-brand-gold/20 mx-2"></div>

          <Link
            to="/cart"
            className={cn("relative p-2 transition-colors hover:text-brand-gold", textColor)}
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-brown text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={cn("p-2 transition-colors hover:text-brand-gold", textColor)}
                  title="Admin Dashboard"
                >
                  <LayoutDashboard size={22} />
                </Link>
              )}
              <Link
                to="/orders"
                className={cn("p-2 transition-colors hover:text-brand-gold", textColor)}
                title="My Orders"
              >
                <User size={22} />
              </Link>
              <button
                onClick={handleLogout}
                className={cn("p-2 transition-colors hover:text-brand-gold", textColor)}
                title="Logout"
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-brand-brown text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold transition-colors shadow-lg shadow-brand-brown/20 whitespace-nowrap"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
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

          {user ? (
            <>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-brand-charcoal hover:text-brand-gold"
                >
                  <LayoutDashboard size={20} /> Admin Dashboard
                </Link>
              )}
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
