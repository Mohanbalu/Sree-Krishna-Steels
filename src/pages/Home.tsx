import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Truck, Settings, Phone, Quote, Play, Pin, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { REFERENCES } from '@/src/constants';
import { useState, useEffect, useMemo } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Store } from "lucide-react";
export default function Home() {
  const [dbFeatured, setDbFeatured] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
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

        if (error) throw error;
        setDbFeatured(data || []);
      } catch (error: any) {
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
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#660033]">
        <div className="absolute inset-0 z-0">
          {/* Plain background */}
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-12 bg-white/30"></div>
            <span className="text-gold-metallic font-cinzel font-bold tracking-[0.80em] uppercase text-base md:text-lg">
              Estd:1999
            </span>
            <div className="h-px w-12 bg-white/30"></div>
          </motion.div>

          <motion.h1 
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.8 }}
  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif text-gold-metallic mb-4 leading-tight tracking-tight uppercase font-bold flex flex-wrap items-center justify-center gap-x-2 md:gap-x-4 w-full mx-auto drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]"
>
  <span>Sree Krishna Steels & Furniture</span>
</motion.h1>

<motion.p
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3, duration: 0.8 }}
  className="text-gold-metallic font-cinzel font-semibold tracking-[0.5em] uppercase text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6"
>
  Netra Brand
</motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6 mb-12"
          >
            <p className="text-white/80 text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-[0.2em] uppercase">
              The complete customized furniture manufacturing unit
            </p>
            <p className="text-gold-metallic text-[12px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-cinzel font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase flex items-center justify-center gap-2 sm:gap-3 md:gap-6">
  DESIGN 
  <span className="text-[14px] md:text-[22px] align-middle leading-none">★</span> 
  DURABILITY 
  <span className="text-[14px] md:text-[22px] align-middle leading-none">★</span> 
  DEDICATION
</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link to="/products" className="group relative px-12 py-5 overflow-hidden rounded-full bg-white text-[#660033] font-bold text-sm uppercase tracking-[0.2em] transition-all duration-500 hover:bg-brand-gold hover:text-brand-brown">
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
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 sm:mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block"
            >
              Curated Selection
            </motion.span>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif text-brand-brown mb-6 leading-tight">The Signature <br /><span className="italic font-normal">Collection</span></h2>
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
                    {product.stock <= 0 && (
                      <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        Out of Stock
                      </span>
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
      <section className="bg-brand-brown py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">A Netra Brand</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-6">The Sree Krishna Edge</h2>
            <p className="text-brand-cream/60 max-w-2xl mx-auto text-sm sm:text-base">We don't just make furniture; we create legacies of comfort and durability for your home.</p>
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-brand-brown mb-4">What Our Clients Say</h2>
            <p className="text-brand-charcoal/60 text-sm sm:text-base">Real stories from people who transformed their homes with us.</p>
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

      {/* Location Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-brand-charcoal text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-brand-gold mb-4">Visit Our Showroom</h2>
            <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base">Experience our premium quality furniture in person at our manufacturing unit and showroom.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-brand-gold" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Our workshop Address</h3>
                  <p className="text-white/70 leading-relaxed">
                    SREE KRISHNA STEELS (Netra Brand),<br />
                    Plot no : 42-43, 100 Feets road,<br />
                    Auto Nagar, Jaggayyapeta,<br />
                    NTR District, Andhra Pradesh- 521175
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6">
  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
    <Store className="text-brand-gold" size={24} />
  </div>
  <div>
    <h3 className="text-xl font-bold mb-2">Our Showroom Address</h3>
    <p className="text-white/70 leading-relaxed">
      D FURNITURE,<br />
      Beside Bhupathi Residency,<br />
      Kodad Road,<br />
      Jaggayyapeta - 521175
    </p>
  </div>
</div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                  <Clock className="text-brand-gold" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Business Hours</h3>
                  <p className="text-white/70">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                  <p className="text-white/70">Sunday: Closed</p>
                </div>
              </div>

              <div className="pt-4">
                <a 
                  href="https://www.google.com/maps/place/SREE+KRISHNA+STEELS+(Netra+Brand),+Autonagar+sm+peta+plot+no:42,43+100+feet+road+ARC+Transport+back+side+SM+peta,+Shermohammedpet,+Andhra+Pradesh+521178/data=!4m2!3m1!1s0x3a35a9d03adec16b:0x8463fd1ff0bb6f95!18m1!1e1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-brand-gold text-brand-brown px-8 py-4 rounded-full font-bold hover:bg-white transition-colors"
                >
                  Get Directions <ExternalLink size={20} />
                </a>
              </div>
            </div>
            
            <div className="h-[400px] rounded-3xl overflow-hidden relative group shadow-2xl border border-white/10">
              <iframe 
                title="Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.23456789!2d80.12345678!3d16.12345678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35a9d03adec16b%3A0x8463fd1ff0bb6f95!2sSREE%20KRISHNA%20STEELS%20(Netra%20Brand)!5e0!3m2!1sen!2sin!4v1712134567890!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-[12px] border-brand-charcoal/50 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-brand-gold rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif text-brand-brown mb-8 leading-tight">Ready to upgrade your home?</h2>
            <p className="text-brand-brown/70 text-base sm:text-lg mb-8 sm:mb-12 max-w-xl mx-auto">Get a free consultation and a personalized quote for your dream furniture today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href="https://wa.me/919848082209?text=Hello%20Sree%20Krishna%20Steels%20%26%20Furniture,%20I'm%20interested%20in%20upgrading%20my%20home%20furniture.%20Please%20provide%20more%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-brown text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:shadow-2xl transition-all"
              >
                Enquire Now
              </a>
            <div className="flex flex-col items-center gap-2">
  <a href="tel:+919848082209" className="flex items-center justify-center gap-3 text-brand-brown font-bold text-lg sm:text-xl hover:underline">
    <Phone size={20} /> +91 98480 82209
  </a>
  <a href="tel:+919247256067" className="flex items-center justify-center gap-3 text-brand-brown font-bold text-lg sm:text-xl hover:underline">
    <Phone size={20} /> +91 92472 56067
  </a>
  <a href="tel:+919948545035" className="flex items-center justify-center gap-3 text-brand-brown font-bold text-lg sm:text-xl hover:underline">
    <Phone size={20} /> +91 99485 45035
    <span className="text-xs sm:text-sm font-medium text-brand-brown/70">(9 AM – 9 PM)</span>
  </a>
</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
