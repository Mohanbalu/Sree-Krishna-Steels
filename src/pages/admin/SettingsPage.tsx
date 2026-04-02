import { useState } from 'react';
import { Save, Building2, Mail, Phone, MapPin, Globe, CreditCard, Bell, Shield, Lock, Smartphone, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-serif text-brand-brown tracking-tight">System Configuration</h1>
          <p className="text-sm lg:text-base text-brand-brown/60 font-medium">Refine your business parameters and operational preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto bg-brand-brown text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-all duration-300 shadow-xl shadow-brand-brown/10 group active:scale-95 disabled:opacity-50"
        >
          <Save size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{loading ? 'Synchronizing...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Tabs - Horizontal scroll on mobile, vertical on desktop */}
        <div className="w-full lg:w-72 flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 lg:w-full flex items-center gap-3 lg:gap-4 px-5 lg:px-6 py-3 lg:py-5 rounded-xl lg:rounded-2xl font-bold transition-all duration-500 group relative overflow-hidden ${
                activeTab === tab.id 
                ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/10' 
                : 'text-brand-brown/40 hover:text-brand-brown hover:bg-brand-cream/50'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'} />
              <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="hidden lg:block absolute left-0 w-1 h-8 bg-brand-gold rounded-r-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-6 md:p-10 lg:p-16 rounded-3xl lg:rounded-[3rem] border border-brand-brown/5 shadow-sm min-h-[400px] lg:min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'business' && (
              <motion.div 
                key="business"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 lg:space-y-10"
              >
                <div>
                  <h2 className="text-2xl lg:text-3xl font-serif text-brand-brown mb-2">Business Identity</h2>
                  <p className="text-brand-brown/40 text-xs lg:text-sm">Define how your brand is presented to your clientele.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Establishment Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="text" 
                        defaultValue="Sree Krishna Collection" 
                        className="w-full pl-12 pr-4 py-3.5 lg:py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-xs lg:text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Concierge Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="email" 
                        defaultValue="support@sksfurniture.in" 
                        className="w-full pl-12 pr-4 py-3.5 lg:py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-xs lg:text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Direct Contact</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="text" 
                        defaultValue="+91 98480 82209" 
                        className="w-full pl-12 pr-4 py-3.5 lg:py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-xs lg:text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Digital Presence</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="text" 
                        defaultValue="https://www.sksfurniture.in" 
                        className="w-full pl-12 pr-4 py-3.5 lg:py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-xs lg:text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Flagship Location</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <textarea 
                        rows={3} 
                        defaultValue="789 Heritage Plaza, Silk Street, Kanchipuram, TN 631501" 
                        className="w-full pl-12 pr-4 py-3.5 lg:py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-xs lg:text-sm font-medium resize-none" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div 
                key="payments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 lg:space-y-10"
              >
                <div>
                  <h2 className="text-2xl lg:text-3xl font-serif text-brand-brown mb-2">Financial Gateway</h2>
                  <p className="text-brand-brown/40 text-xs lg:text-sm">Securely manage your transaction processing systems.</p>
                </div>
                
                <div className="space-y-4 lg:space-y-6">
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 lg:p-8 bg-brand-cream/10 rounded-2xl lg:rounded-[2rem] border border-brand-brown/5 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-brown/5 transition-all duration-500 gap-6">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <CreditCard size={24} lg:size={28} />
                      </div>
                      <div>
                        <div className="font-serif text-lg lg:text-xl text-brand-brown">Stripe Integration</div>
                        <div className="text-[10px] lg:text-xs text-brand-brown/40 font-medium flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Authenticated & Active
                        </div>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-2.5 bg-brand-brown text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold transition-colors duration-300">
                      Manage Account
                    </button>
                  </div>

                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 lg:p-8 bg-brand-cream/10 rounded-2xl lg:rounded-[2rem] border border-brand-brown/5 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-brown/5 transition-all duration-500 gap-6">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-50 text-amber-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 font-serif text-xl lg:text-2xl font-bold">
                        P
                      </div>
                      <div>
                        <div className="font-serif text-lg lg:text-xl text-brand-brown">PayPal Express</div>
                        <div className="text-[10px] lg:text-xs text-brand-brown/40 font-medium mt-1">Awaiting Configuration</div>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-2.5 border border-brand-brown/10 text-brand-brown text-[9px] lg:text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-brown hover:text-white transition-all duration-300">
                      Connect Gateway
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 lg:space-y-10"
              >
                <div>
                  <h2 className="text-2xl lg:text-3xl font-serif text-brand-brown mb-2">Communication Hub</h2>
                  <p className="text-brand-brown/40 text-xs lg:text-sm">Tailor your administrative alert preferences.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'new_order', label: 'Acquisition Alerts', desc: 'Instant notification for every new collection purchase.' },
                    { id: 'low_stock', label: 'Inventory Thresholds', desc: 'Alerts when exclusive items fall below luxury stock levels.' },
                    { id: 'customer_signup', label: 'Client Onboarding', desc: 'Notification when a new premium client joins the base.' },
                  ].map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-6 lg:p-8 bg-brand-cream/10 rounded-2xl lg:rounded-[2rem] border border-brand-brown/5 hover:border-brand-gold/30 transition-all duration-500 gap-4">
                      <div className="max-w-md">
                        <div className="font-serif text-base lg:text-lg text-brand-brown mb-1">{item.label}</div>
                        <div className="text-[10px] lg:text-xs text-brand-brown/40 font-medium leading-relaxed">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-12 lg:w-14 h-6 lg:h-7 bg-brand-brown/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] lg:after:top-[4px] after:left-[3px] lg:after:left-[4px] after:bg-white after:rounded-full after:h-[18px] lg:after:h-[21px] after:w-[18px] lg:after:w-[21px] after:transition-all duration-500 peer-checked:bg-brand-gold shadow-inner"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 lg:space-y-10"
              >
                <div>
                  <h2 className="text-2xl lg:text-3xl font-serif text-brand-brown mb-2">Security Protocol</h2>
                  <p className="text-brand-brown/40 text-xs lg:text-sm">Advanced safeguards for your administrative portal.</p>
                </div>

                <div className="space-y-6 lg:space-y-8">
                  <div className="p-8 lg:p-10 bg-brand-brown text-white rounded-3xl lg:rounded-[2.5rem] shadow-2xl shadow-brand-brown/20 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-brand-gold/20 rounded-xl lg:rounded-2xl flex items-center justify-center text-brand-gold">
                          <Shield size={20} lg:size={24} />
                        </div>
                        <h3 className="text-lg lg:text-xl font-serif">Two-Factor Authentication</h3>
                      </div>
                      <p className="text-white/60 text-xs lg:text-sm mb-8 leading-relaxed max-w-md">Fortify your access with an additional layer of verification. Essential for high-privilege accounts.</p>
                      <button className="w-full sm:w-auto px-8 py-3 bg-brand-gold text-brand-brown text-[9px] lg:text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-colors duration-300">
                        Initialize Protocol
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 lg:p-8 bg-brand-cream/10 rounded-2xl lg:rounded-[2rem] border border-brand-brown/5 gap-4">
                    <div>
                      <div className="font-serif text-base lg:text-lg text-brand-brown mb-1">Administrative Session Timeout</div>
                      <div className="text-[10px] lg:text-xs text-brand-brown/40 font-medium">Automatic termination of inactive sessions.</div>
                    </div>
                    <select className="w-full sm:w-auto bg-white border border-brand-brown/10 rounded-xl px-6 py-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-brand-brown outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all">
                      <option>30 Minutes</option>
                      <option>1 Hour</option>
                      <option>4 Hours</option>
                      <option>Indefinite</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
