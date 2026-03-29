import { motion } from 'motion/react';
import { Shield, Users, Factory, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero */}
      <section className="px-6 max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-6xl font-serif text-brand-brown mb-8">Legacy of Excellence in Furniture</h1>
            <p className="text-brand-charcoal/70 text-lg leading-relaxed mb-6">
              Founded with a vision to revolutionize the furniture industry, Sree Krishna Steels has grown from a small workshop to a leading manufacturer of premium furniture.
            </p>
            <p className="text-brand-charcoal/70 text-lg leading-relaxed">
              We combine the strength of high-grade steel with the timeless beauty of premium wood to create furniture that isn't just functional, but a statement of luxury and durability.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" 
                alt="Manufacturing Process" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-brand-gold p-8 rounded-3xl shadow-xl hidden md:block">
              <p className="text-brand-brown text-4xl font-serif font-bold">25+</p>
              <p className="text-brand-brown/70 font-semibold uppercase tracking-widest text-xs">Years of Experience</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Strengths */}
      <section className="bg-brand-brown py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <Factory className="text-brand-gold mb-6" size={48} />
            <h3 className="text-2xl font-serif text-white mb-4">Manufacturing Strength</h3>
            <p className="text-brand-cream/60 leading-relaxed">Our state-of-the-art facility is equipped with advanced machinery for precision cutting, welding, and finishing.</p>
          </div>
          <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <Users className="text-brand-gold mb-6" size={48} />
            <h3 className="text-2xl font-serif text-white mb-4">Skilled Artisans</h3>
            <p className="text-brand-cream/60 leading-relaxed">Our team consists of master craftsmen who bring decades of experience in traditional and modern furniture making.</p>
          </div>
          <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <Award className="text-brand-gold mb-6" size={48} />
            <h3 className="text-2xl font-serif text-white mb-4">Quality Assurance</h3>
            <p className="text-brand-cream/60 leading-relaxed">Every piece undergoes rigorous testing for structural integrity, finish quality, and ergonomic comfort.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-serif text-brand-brown mb-12">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <h4 className="text-2xl font-serif text-brand-gold italic">Integrity</h4>
            <p className="text-brand-charcoal/60">We believe in transparent pricing and using exactly the materials we promise. No compromises on quality.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-serif text-brand-gold italic">Innovation</h4>
            <p className="text-brand-charcoal/60">Constantly evolving our designs and manufacturing techniques to stay ahead of modern living trends.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-serif text-brand-gold italic">Customer First</h4>
            <p className="text-brand-charcoal/60">Your satisfaction is our priority. We offer extensive customization to ensure our furniture fits your life perfectly.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-serif text-brand-gold italic">Sustainability</h4>
            <p className="text-brand-charcoal/60">Sourcing materials responsibly and minimizing waste in our production processes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
