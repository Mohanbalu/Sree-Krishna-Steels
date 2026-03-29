import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Bulk Enquiry', path: '/bulk-enquiry' },
    { name: 'Contact', path: '/contact' },
  ];

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
              scrolled ? "text-brand-brown" : (location.pathname === '/' ? "text-white" : "text-brand-brown")
            )}>SREE KRISHNA</span>
            <span className="text-xs font-sans tracking-[0.3em] text-brand-gold font-semibold">STEELS</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => window.scrollTo(0, 0)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-gold uppercase tracking-wider whitespace-nowrap",
                location.pathname === link.path 
                  ? "text-brand-gold" 
                  : (scrolled ? "text-brand-charcoal" : (location.pathname === '/' ? "text-white" : "text-brand-charcoal"))
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => window.scrollTo(0, 0)}
            className="bg-brand-brown text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold transition-colors shadow-lg shadow-brand-brown/20 whitespace-nowrap"
          >
            Enquire Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={cn(
            "lg:hidden transition-colors duration-300",
            scrolled ? "text-brand-brown" : (location.pathname === '/' ? "text-white" : "text-brand-brown")
          )} 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
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
          <Link
            to="/contact"
            onClick={() => {
              setIsOpen(false);
              window.scrollTo(0, 0);
            }}
            className="bg-brand-brown text-white text-center py-3 rounded-lg font-semibold"
          >
            Enquire Now
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
