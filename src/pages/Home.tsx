import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Truck, Settings, Phone, Quote, Play, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { REFERENCES } from '@/src/constants';
import { useState, useEffect, useMemo } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';

export default function Home() {
  const [dbFeatured, setDbFeatured] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async (retryCount = 0) => {
      if (!supabase) return;
      try {
        const fetchPromise = supabase
          .from('products')
          .select(`
            *,
            product_images (
              image_url
            )
          `)
          .eq('is_active', true)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3);

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Featured products fetch timeout')), 60000)
        );

        const { data, error } = await Promise.race([
          Promise.resolve(fetchPromise),
          timeoutPromise
        ]) as any;

        if (error) throw error;
        setDbFeatured(data || []);
      } catch (error: any) {
        if (retryCount < 2 && error.message?.includes('timeout')) {
          console.warn(`Featured fetch timed out (attempt ${retryCount + 1}), retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchFeatured(retryCount + 1);
        }
        handleSupabaseError(error, 'fetchFeatured');
      }
    };

    fetchFeatured();
  }, []);

  const featuredProducts = useMemo(() => {
    return dbFeatured.map(p => ({
      ...p,
      title: p.name,
      image_url: p.product_images?.[0]?.image_url || p.image_url
    }));
  }, [dbFeatured]);

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-sky-600">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-600/80 via-sky-500/60 to-sky-700/90"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-12 bg-white/50"></div>
            <span className="text-gold-metallic font-cinzel font-bold tracking-[0.5em] uppercase text-xs md:text-sm">
              Est. 1999
            </span>
            <div className="h-px w-12 bg-white/50"></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-serif text-gold-metallic mb-8 leading-tight tracking-tight uppercase font-bold flex flex-wrap items-center justify-center gap-x-2 md:gap-x-4 w-full mx-auto pl-2 md:pl-4"
          >
            <span>Sree Krishna Steels & Furniture</span>
            <span className="text-[0.6em] opacity-90 font-cinzel font-normal align-middle">(Netra Brand)</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6 mb-12"
          >
            <p className="text-white/90 text-xl md:text-2xl font-light tracking-wide italic">
              Customized manufacturing unit
            </p>
            <p className="text-gold-metallic text-lg md:text-2xl font-cinzel font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-3 md:gap-6">
              DESIGN <span className="text-xs md:text-sm align-middle">★</span> DURABILITY <span className="text-xs md:text-sm align-middle">★</span> DEDICATION
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link to="/products" className="group relative px-12 py-5 overflow-hidden rounded-full bg-white text-sky-700 font-bold text-sm uppercase tracking-[0.2em] transition-all duration-500 hover:bg-brand-gold hover:text-brand-brown">
              <span className="relative z-10 flex items-center gap-3">
                Shop Collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
              </span>
            </Link>
            <a 
              href="https://wa.me/919848082209?text=Hello%20Sree%20Krishna%20Steels%20%26%20Furniture,%20I'd%20like%20to%20get%20a%20quote%20for%20some%20furniture."
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold text-sm uppercase tracking-[0.2em] hover:text-gold-metallic transition-colors duration-300 flex items-center gap-3 group"
            >
              Get a Quote <div className="w-8 h-px bg-white/30 group-hover:w-12 group-hover:bg-gold-metallic transition-all duration-300"></div>
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
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.is_pinned && (
                      <span className="bg-white/90 backdrop-blur-md text-brand-gold px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <Pin size={10} fill="currentColor" /> Featured
                      </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-md text-brand-brown px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      Best Seller
                    </span>
                    {product.reel_link && (
                      <div className="bg-brand-gold text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <Play size={10} fill="currentColor" /> Reel Available
                      </div>
                    )}
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
            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">A Netra Brand</span>
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
                href="https://wa.me/919848082209?text=Hello%20Sree%20Krishna%20Steels%20%26%20Furniture,%20I'm%20interested%20in%20upgrading%20my%20home%20furniture.%20Please%20provide%20more%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-brown text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all"
              >
                Enquire Now
              </a>
              <div className="flex flex-col items-center gap-2">
                <a href="tel:+919848082209" className="flex items-center justify-center gap-3 text-brand-brown font-bold text-xl hover:underline">
                  <Phone size={20} /> +91 98480 82209
                </a>
                <a href="tel:+919247256067" className="flex items-center justify-center gap-3 text-brand-brown font-bold text-xl hover:underline">
                  <Phone size={20} /> +91 92472 56067
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
