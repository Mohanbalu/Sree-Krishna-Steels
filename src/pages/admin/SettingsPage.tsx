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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-brown tracking-tight mb-2">System Configuration</h1>
          <p className="text-brand-brown/60 font-medium">Refine your business parameters and operational preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-brand-brown text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-all duration-300 shadow-xl shadow-brand-brown/10 group active:scale-95 disabled:opacity-50"
        >
          <Save size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{loading ? 'Synchronizing...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-72 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-bold transition-all duration-500 group relative overflow-hidden ${
                activeTab === tab.id 
                ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/10' 
                : 'text-brand-brown/40 hover:text-brand-brown hover:bg-brand-cream/50'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-8 bg-brand-gold rounded-r-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-10 md:p-16 rounded-[3rem] border border-brand-brown/5 shadow-sm min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === 'business' && (
              <motion.div 
                key="business"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-serif text-brand-brown mb-2">Business Identity</h2>
                  <p className="text-brand-brown/40 text-sm">Define how your brand is presented to your clientele.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Establishment Name</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="text" 
                        defaultValue="Sree Krishna Collection" 
                        className="w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Concierge Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="email" 
                        defaultValue="support@sksfurniture.in" 
                        className="w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Direct Contact</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="text" 
                        defaultValue="+91 98480 82209" 
                        className="w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Digital Presence</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <input 
                        type="text" 
                        defaultValue="https://www.sksfurniture.in" 
                        className="w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-sm font-medium" 
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Flagship Location</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                      <textarea 
                        rows={3} 
                        defaultValue="789 Heritage Plaza, Silk Street, Kanchipuram, TN 631501" 
                        className="w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-sm font-medium resize-none" 
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
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-serif text-brand-brown mb-2">Financial Gateway</h2>
                  <p className="text-brand-brown/40 text-sm">Securely manage your transaction processing systems.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="group flex items-center justify-between p-8 bg-brand-cream/10 rounded-[2rem] border border-brand-brown/5 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-brown/5 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <CreditCard size={28} />
                      </div>
                      <div>
                        <div className="font-serif text-xl text-brand-brown">Stripe Integration</div>
                        <div className="text-xs text-brand-brown/40 font-medium flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Authenticated & Active
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-2.5 bg-brand-brown text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-gold transition-colors duration-300">
                      Manage Account
                    </button>
                  </div>

                  <div className="group flex items-center justify-between p-8 bg-brand-cream/10 rounded-[2rem] border border-brand-brown/5 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-brown/5 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 font-serif text-2xl font-bold">
                        P
                      </div>
                      <div>
                        <div className="font-serif text-xl text-brand-brown">PayPal Express</div>
                        <div className="text-xs text-brand-brown/40 font-medium mt-1">Awaiting Configuration</div>
                      </div>
                    </div>
                    <button className="px-6 py-2.5 border border-brand-brown/10 text-brand-brown text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-brown hover:text-white transition-all duration-300">
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
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-serif text-brand-brown mb-2">Communication Hub</h2>
                  <p className="text-brand-brown/40 text-sm">Tailor your administrative alert preferences.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'new_order', label: 'Acquisition Alerts', desc: 'Instant notification for every new collection purchase.' },
                    { id: 'low_stock', label: 'Inventory Thresholds', desc: 'Alerts when exclusive items fall below luxury stock levels.' },
                    { id: 'customer_signup', label: 'Client Onboarding', desc: 'Notification when a new premium client joins the base.' },
                  ].map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-8 bg-brand-cream/10 rounded-[2rem] border border-brand-brown/5 hover:border-brand-gold/30 transition-all duration-500">
                      <div className="max-w-md">
                        <div className="font-serif text-lg text-brand-brown mb-1">{item.label}</div>
                        <div className="text-xs text-brand-brown/40 font-medium leading-relaxed">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-14 h-7 bg-brand-brown/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[21px] after:w-[21px] after:transition-all duration-500 peer-checked:bg-brand-gold shadow-inner"></div>
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
                className="space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-serif text-brand-brown mb-2">Security Protocol</h2>
                  <p className="text-brand-brown/40 text-sm">Advanced safeguards for your administrative portal.</p>
                </div>

                <div className="space-y-8">
                  <div className="p-10 bg-brand-brown text-white rounded-[2.5rem] shadow-2xl shadow-brand-brown/20 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-brand-gold/20 rounded-2xl flex items-center justify-center text-brand-gold">
                          <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-serif">Two-Factor Authentication</h3>
                      </div>
                      <p className="text-white/60 text-sm mb-8 leading-relaxed max-w-md">Fortify your access with an additional layer of verification. Essential for high-privilege accounts.</p>
                      <button className="px-8 py-3 bg-brand-gold text-brand-brown text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-colors duration-300">
                        Initialize Protocol
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-8 bg-brand-cream/10 rounded-[2rem] border border-brand-brown/5">
                    <div>
                      <div className="font-serif text-lg text-brand-brown mb-1">Administrative Session Timeout</div>
                      <div className="text-xs text-brand-brown/40 font-medium">Automatic termination of inactive sessions.</div>
                    </div>
                    <select className="bg-white border border-brand-brown/10 rounded-xl px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-brown outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all">
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
