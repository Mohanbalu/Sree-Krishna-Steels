import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Truck, Settings, Phone, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS, REFERENCES } from '@/src/constants';
import { useState, useEffect, useMemo } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';

export default function Home() {
  const [dbFeatured, setDbFeatured] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_best_seller', true)
          .limit(3);

        if (error) throw error;
        setDbFeatured(data || []);
      } catch (error) {
        handleSupabaseError(error, 'fetchFeatured');
      }
    };

    fetchFeatured();
  }, []);

  const featuredProducts = useMemo(() => {
    if (dbFeatured.length > 0) return dbFeatured;
    return PRODUCTS.filter(p => p.isBestSeller).map(p => ({
      ...p,
      title: p.name,
      image_url: p.images[0]
    }));
  }, [dbFeatured]);

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920" 
            alt="Luxury Living Room" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-brown/60 via-brand-brown/40 to-brand-brown/80"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-12 bg-brand-gold/50"></div>
            <span className="text-brand-gold font-bold tracking-[0.5em] uppercase text-[10px]">
              Est. 1995 • Premium Quality
            </span>
            <div className="h-px w-12 bg-brand-gold/50"></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-9xl font-serif text-white mb-10 leading-[0.9] tracking-tighter"
          >
            Timeless <br /> 
            <span className="italic font-normal text-brand-gold">Elegance</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-white/70 text-lg md:text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed"
          >
            Crafting the finest steel and wood furniture for those who appreciate the art of living well.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link to="/products" className="group relative px-12 py-5 overflow-hidden rounded-full bg-brand-gold text-brand-brown font-bold text-sm uppercase tracking-[0.2em] transition-all duration-500 hover:bg-white">
              <span className="relative z-10 flex items-center gap-3">
                Shop Collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
              </span>
            </Link>
            <a 
              href="https://wa.me/919949666666?text=Hello%20Sree%20Krishna%20Steels,%20I'd%20like%20to%20get%20a%20quote%20for%20some%20furniture."
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold text-sm uppercase tracking-[0.2em] hover:text-brand-gold transition-colors duration-300 flex items-center gap-3 group"
            >
              Get a Quote <div className="w-8 h-px bg-white/30 group-hover:w-12 group-hover:bg-brand-gold transition-all duration-300"></div>
            </a>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-brand-gold/50 to-transparent"></div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-32 px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block"
            >
              Curated Selection
            </motion.span>
            <h2 className="text-5xl md:text-7xl font-serif text-brand-brown mb-6 leading-tight">The Signature <br /><span className="italic font-normal">Collection</span></h2>
          </div>
          <Link to="/products" className="group flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-charcoal hover:text-brand-gold transition-colors">
            View All <div className="w-12 h-px bg-brand-charcoal/20 group-hover:w-20 group-hover:bg-brand-gold transition-all duration-500"></div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {featuredProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/products/${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] mb-8 bg-brand-cream shadow-2xl shadow-brand-brown/5">
                  <img 
                    src={product.image_url || product.images?.[0]} 
                    alt={product.title || product.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-brown/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md text-brand-brown px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      Best Seller
                    </span>
                  </div>
                </div>
                <div className="space-y-3 px-2">
                  <div className="flex justify-between items-baseline gap-4">
                    <h3 className="text-3xl font-serif text-brand-brown group-hover:text-brand-gold transition-colors duration-300">{product.title || product.name}</h3>
                    <p className="text-brand-gold font-bold text-xl">
                      {typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price}
                    </p>
                  </div>
                  <p className="text-brand-charcoal/50 text-sm leading-relaxed line-clamp-2 font-light">{product.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-brand-brown py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">The Sree Krishna Edge</h2>
            <p className="text-brand-cream/60 max-w-2xl mx-auto">We don't just make furniture; we create legacies of comfort and durability for your home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: <Shield className="text-brand-gold" size={40} />, title: "Unmatched Quality", desc: "Rigorous quality checks at every stage of manufacturing." },
              { icon: <Truck className="text-brand-gold" size={40} />, title: "Direct Delivery", desc: "From our factory to your doorstep, ensuring zero damage." },
              { icon: <Settings className="text-brand-gold" size={40} />, title: "Customization", desc: "Tailor-made furniture to fit your specific space and style." },
              { icon: <Star className="text-brand-gold" size={40} />, title: "Expert Craftsmanship", desc: "Decades of experience in steel and wood fabrication." },
            ].map((feature, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="flex justify-center">{feature.icon}</div>
                <h4 className="text-xl font-serif text-white">{feature.title}</h4>
                <p className="text-brand-cream/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* References Section */}
      <section className="py-24 px-6 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4">What Our Clients Say</h2>
            <p className="text-brand-charcoal/60">Real stories from people who transformed their homes with us.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REFERENCES.map((ref, idx) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gold/10 relative"
              >
                <Quote className="text-brand-gold/20 absolute top-6 right-6" size={40} />
                <p className="text-brand-charcoal/70 italic mb-8 relative z-10">"{ref.content}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={ref.image} 
                    alt={ref.name} 
                    className="w-12 h-12 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-brand-brown">{ref.name}</h4>
                    <p className="text-xs text-brand-gold font-semibold uppercase tracking-wider">{ref.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-brand-gold rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif text-brand-brown mb-8">Ready to upgrade your home?</h2>
            <p className="text-brand-brown/70 text-lg mb-12 max-w-xl mx-auto">Get a free consultation and a personalized quote for your dream furniture today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href="https://wa.me/919949666666?text=Hello%20Sree%20Krishna%20Steels,%20I'm%20interested%20in%20upgrading%20my%20home%20furniture.%20Please%20provide%20more%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-brown text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all"
              >
                Enquire Now
              </a>
              <a href="tel:+919949666666" className="flex items-center justify-center gap-3 text-brand-brown font-bold text-xl hover:underline">
                <Phone /> +91 99496 66666
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
