import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Truck, Settings, Phone, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS, REFERENCES } from '@/src/constants';

export default function Home() {
  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920" 
            alt="Luxury Living Room" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-brown/40 backdrop-brightness-75"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-gold font-semibold tracking-[0.3em] uppercase text-sm mb-4 block"
          >
            Direct from Manufacturer
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif text-white mb-8 leading-[1.1]"
          >
            Premium Furniture for <br /> <span className="italic font-normal">Modern Living</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light"
          >
            Crafting elegance and durability with high-grade steel and premium wood. Transform your home with Sree Krishna Steels.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/products" className="bg-brand-gold text-brand-brown px-10 py-4 rounded-full font-bold text-lg hover:bg-white transition-all flex items-center gap-2 group">
              Explore Collection <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="https://wa.me/919848082209?text=Hello%20Sree%20Krishna%20Steels,%20I'd%20like%20to%20get%20a%20quote%20for%20some%20furniture."
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
            >
              Get a Quote
            </a>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <div className="w-px h-12 bg-white/30 mx-auto"></div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4">Best Sellers</h2>
            <p className="text-brand-charcoal/60 max-w-md">Our most loved pieces, crafted with precision and designed for comfort.</p>
          </div>
          <Link to="/products" className="text-brand-gold font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            View All Products <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {PRODUCTS.filter(p => p.isBestSeller).map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <Link to={`/products/${product.id}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-brand-gold text-brand-brown px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Best Seller
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-brand-brown mb-2">{product.name}</h3>
                <p className="text-brand-charcoal/60 text-sm mb-4 line-clamp-2">{product.description}</p>
                <p className="text-brand-gold font-bold text-lg">{product.price}</p>
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
                href="https://wa.me/919848082209?text=Hello%20Sree%20Krishna%20Steels,%20I'm%20interested%20in%20upgrading%20my%20home%20furniture.%20Please%20provide%20more%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-brown text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all"
              >
                Enquire Now
              </a>
              <a href="tel:+919848082209" className="flex items-center justify-center gap-3 text-brand-brown font-bold text-xl hover:underline">
                <Phone /> +91 98480 82209
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
