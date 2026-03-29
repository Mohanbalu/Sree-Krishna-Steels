import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PRODUCTS } from '@/src/constants';
import { Check, ArrowLeft, Phone, MessageSquare, ShieldCheck, Package, Ruler } from 'lucide-react';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h1 className="text-4xl font-serif mb-4">Product Not Found</h1>
        <Link to="/products" className="text-brand-gold hover:underline">Back to Collection</Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/919848082209?text=${encodeURIComponent(`Hi, I'm interested in the ${product.name}. Please provide more details.`)}`;

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-charcoal/60 hover:text-brand-brown mb-12 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-lg"
          >
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2 block">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-brand-gold mb-6">{product.price}</p>
            <p className="text-brand-charcoal/70 leading-relaxed text-lg mb-8">{product.fullDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-brand-gold/10">
              <Package className="text-brand-gold shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm text-brand-brown">Material</h4>
                <p className="text-xs text-brand-charcoal/60">{product.material}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-brand-gold/10">
              <Ruler className="text-brand-gold shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm text-brand-brown">Dimensions</h4>
                <p className="text-xs text-brand-charcoal/60">{product.size}</p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h4 className="font-serif text-xl text-brand-brown mb-4">Key Benefits</h4>
            <ul className="space-y-3">
              {product.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 text-brand-charcoal/80">
                  <div className="bg-brand-gold/20 p-1 rounded-full">
                    <Check size={14} className="text-brand-gold" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-8 border-t border-brand-gold/10">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-brand-brown text-white py-4 rounded-full font-bold text-center flex items-center justify-center gap-2 hover:bg-brand-charcoal transition-colors"
            >
              <MessageSquare size={20} /> Get Price on WhatsApp
            </a>
            <Link 
              to="/contact"
              className="flex-1 border-2 border-brand-brown text-brand-brown py-4 rounded-full font-bold text-center hover:bg-brand-brown hover:text-white transition-all"
            >
              Enquire Now
            </Link>
          </div>
          
          <div className="mt-8 flex items-center gap-6 text-xs text-brand-charcoal/40 font-semibold uppercase tracking-widest">
            <div className="flex items-center gap-1"><ShieldCheck size={14} /> 5 Year Warranty</div>
            <div className="flex items-center gap-1"><Package size={14} /> Free Installation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
