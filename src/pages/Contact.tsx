import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappNumber = '919848082209';
    const text = `Hello Sree Krishna Steels,\n\nI have a quick enquiry:\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Message:* ${formData.message}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-serif text-brand-brown mb-6">Get In Touch</h1>
          <p className="text-brand-charcoal/60 max-w-2xl mx-auto">Have questions about our products or need a custom quote? We're here to help you create your perfect space.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-brand-gold/10 text-center">
            <div className="bg-brand-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="text-brand-gold" size={32} />
            </div>
            <h3 className="text-xl font-serif text-brand-brown mb-4">Call Us</h3>
            <p className="text-brand-charcoal/60">+91 98480 82209</p>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-brand-gold/10 text-center">
            <div className="bg-brand-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="text-brand-gold" size={32} />
            </div>
            <h3 className="text-xl font-serif text-brand-brown mb-4">Email Us</h3>
            <p className="text-brand-charcoal/60 mb-2">sales@sreekrishnasteels.com</p>
            <p className="text-brand-charcoal/60">info@sreekrishnasteels.com</p>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-brand-gold/10 text-center">
            <div className="bg-brand-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="text-brand-gold" size={32} />
            </div>
            <h3 className="text-xl font-serif text-brand-brown mb-4">Visit Us</h3>
            <p className="text-brand-charcoal/60 mb-2">Main Road, Jaggaiahpet</p>
            <p className="text-brand-charcoal/60">NTR District, Andhra Pradesh - 521175</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <div className="bg-brand-brown p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 relative z-10"
              >
                <CheckCircle2 className="text-brand-gold mx-auto mb-6" size={80} />
                <h2 className="text-3xl font-serif text-white mb-4">Message Sent!</h2>
                <p className="text-brand-cream/60">Thank you for reaching out. We've redirected you to WhatsApp.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-brand-gold font-bold hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <div className="relative z-10">
                <h2 className="text-3xl font-serif text-white mb-8">Quick Enquiry</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-cream/40">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-white/10 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-gold outline-none placeholder:text-white/20" 
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-cream/40">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full bg-white/10 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-gold outline-none placeholder:text-white/20" 
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-cream/40">Message</label>
                    <textarea 
                      required 
                      rows={4} 
                      className="w-full bg-white/10 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-gold outline-none resize-none placeholder:text-white/20" 
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-brand-gold text-brand-brown py-5 rounded-xl font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-2">
                    Send Message <Send size={20} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="h-full min-h-[500px] rounded-[3rem] overflow-hidden shadow-xl border border-brand-gold/10 relative group">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
              alt="Location Map Placeholder" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-brown/20 flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-xs">
                <MapPin className="text-brand-gold mx-auto mb-4" size={40} />
                <h4 className="font-serif text-xl text-brand-brown mb-2">Our Showroom</h4>
                <p className="text-brand-charcoal/60 text-sm mb-6">Visit us to experience our premium collection in person at Jaggaiahpet.</p>
                <a 
                  href="https://www.google.com/maps/place/Jaggaiahpet,+Andhra+Pradesh/@16.8985619,80.1032325,16.88z/data=!4m6!3m5!1s0x3a35a827dab5b061:0xe71bc8a82fcc172a!8m2!3d16.898534!4d80.103347!16zL20vMGY0X3hz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-brand-brown text-white px-6 py-2 rounded-full text-sm font-bold"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
