import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-brown text-brand-cream pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link 
            to="/" 
            onClick={() => window.scrollTo(0, 0)}
            className="flex items-center gap-3"
          >
            <img 
              src="https://i.ibb.co/C3vGrKVv/Screenshot-2026-03-29-113001-removebg-preview.png" 
              alt="Sree Krishna Steels Logo" 
              className="w-16 h-16 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tighter text-white leading-none">SREE KRISHNA</span>
              <span className="text-xs font-sans tracking-[0.3em] text-brand-gold font-semibold">STEELS</span>
            </div>
          </Link>
          <p className="text-brand-cream/70 text-sm leading-relaxed">
            Premium furniture manufacturers dedicated to bringing elegance and durability to your modern living spaces. Direct from factory to your home.
          </p>
          <div className="flex space-x-4">
            <a href="https://www.instagram.com/sreekrishnasteelsofficial/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors"><Instagram size={20} /></a>
            <a href="https://www.youtube.com/@sreekrishnasteelsfurniture" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors"><Youtube size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold mb-6 text-brand-gold">Quick Links</h4>
          <ul className="space-y-4 text-sm text-brand-cream/70">
            <li><Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/products" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Our Products</Link></li>
            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/bulk-enquiry" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Bulk Enquiry</Link></li>
            <li><Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold mb-6 text-brand-gold">Categories</h4>
          <ul className="space-y-4 text-sm text-brand-cream/70">
            <li><Link to="/products?cat=Beds" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Premium Beds</Link></li>
            <li><Link to="/products?cat=Sofas" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Luxury Sofas</Link></li>
            <li><Link to="/products?cat=Dining Tables" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Dining Tables</Link></li>
            <li><Link to="/products?cat=Dressing Tables" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors">Dressing Tables</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold mb-6 text-brand-gold">Contact Info</h4>
          <ul className="space-y-4 text-sm text-brand-cream/70">
            <li className="flex items-start space-x-3">
              <MapPin size={18} className="text-brand-gold shrink-0" />
              <span>Main Road, Jaggaiahpet, NTR District, Andhra Pradesh - 521175</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={18} className="text-brand-gold shrink-0" />
              <span>+91 98480 82209</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={18} className="text-brand-gold shrink-0" />
              <span>sales@sreekrishnasteels.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center text-xs text-brand-cream/40">
        <p>&copy; {new Date().getFullYear()} Sree Krishna Steels. All Rights Reserved. Designed for Excellence.</p>
      </div>
    </footer>
  );
}
