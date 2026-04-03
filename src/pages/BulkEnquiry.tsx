import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Briefcase, TrendingUp, Handshake } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function BulkEnquiry() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    enquiryType: 'New Dealership',
    requirement: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappNumber = '919848082209';
    const text = `Hello Sree Krishna Steels & Furniture,\n\nI am interested in a *Bulk/Dealer Enquiry*:\n\n*Name:* ${formData.name}\n*Business:* ${formData.businessName}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone}\n*Type:* ${formData.enquiryType}\n*Requirement:* ${formData.requirement}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-4 block">Partnership Opportunities</span>
            <h1 className="text-5xl md:text-6xl font-serif text-brand-brown mb-8">Grow Your Business With Us</h1>
            <p className="text-brand-charcoal/70 text-lg leading-relaxed mb-12">
              We offer exclusive partnership programs for dealers, interior designers, and bulk buyers. Join our network and get access to premium furniture at competitive wholesale prices.
            </p>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="bg-brand-gold/10 p-4 rounded-2xl shrink-0">
                  <TrendingUp className="text-brand-gold" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-brand-brown mb-2">High Profit Margins</h3>
                  <p className="text-brand-charcoal/60 text-sm">Competitive pricing structures designed to help our partners thrive in their local markets.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-brand-gold/10 p-4 rounded-2xl shrink-0">
                  <Briefcase className="text-brand-gold" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-brand-brown mb-2">Priority Support</h3>
                  <p className="text-brand-charcoal/60 text-sm">Dedicated account managers to handle your orders and logistics seamlessly.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-brand-gold/10 p-4 rounded-2xl shrink-0">
                  <Handshake className="text-brand-gold" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-brand-brown mb-2">Custom Bulk Orders</h3>
                  <p className="text-brand-charcoal/60 text-sm">Ability to manufacture large quantities with specific customizations for projects.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-brand-gold/10 relative">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <CheckCircle2 className="text-brand-gold mx-auto mb-6" size={80} />
                <h2 className="text-3xl font-serif text-brand-brown mb-4">Thank You!</h2>
                <p className="text-brand-charcoal/60">Our partnership team will get in touch with you within 24-48 hours. We've redirected you to WhatsApp.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-brand-gold font-bold hover:underline"
                >
                  Send another enquiry
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-serif text-brand-brown mb-8">Dealer / Bulk Enquiry Form</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none" 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Business Name</label>
                      <input 
                        required 
                        type="text" 
                        className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none" 
                        placeholder="Furniture Mart"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Email Address</label>
                      <input 
                        required 
                        type="email" 
                        className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Phone Number</label>
                      <input 
                        required 
                        type="tel" 
                        className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none" 
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Enquiry Type</label>
                    <select 
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none appearance-none"
                      value={formData.enquiryType}
                      onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    >
                      <option>New Dealership</option>
                      <option>Bulk Order for Project</option>
                      <option>Interior Designer Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Your Requirement</label>
                    <textarea 
                      required 
                      rows={4} 
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none resize-none" 
                      placeholder="Tell us about your requirement..."
                      value={formData.requirement}
                      onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-[#25D366] text-white py-5 rounded-xl font-bold text-lg hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/20">
                    Submit Enquiry <FaWhatsapp size={22} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
