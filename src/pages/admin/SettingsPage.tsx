import { useState } from 'react';
import { Save, Building2, Mail, Phone, MapPin, Globe, CreditCard, Bell, Shield } from 'lucide-react';
import { motion } from 'motion/react';

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Settings</h1>
          <p className="text-gray-500">Manage your business information and application preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-brand-gold text-brand-brown px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20 disabled:opacity-50"
        >
          <Save size={20} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-brand-gold text-brand-brown shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          {activeTab === 'business' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Store Name</label>
                  <input type="text" defaultValue="Vibrant Admin" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Support Email</label>
                  <input type="email" defaultValue="support@vibrant.com" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number</label>
                  <input type="text" defaultValue="+1 (555) 000-0000" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Website URL</label>
                  <input type="text" defaultValue="https://vibrant.com" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700">Business Address</label>
                  <textarea rows={3} defaultValue="123 Luxury Lane, Fashion District, NY 10001" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Configuration</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Stripe Integration</div>
                      <div className="text-xs text-gray-500">Connected to live account</div>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-brand-gold hover:underline">Configure</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center font-bold">
                      P
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">PayPal</div>
                      <div className="text-xs text-gray-500">Not connected</div>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-brand-gold hover:underline">Connect</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { id: 'new_order', label: 'New Order Alerts', desc: 'Get notified when a customer places a new order.' },
                  { id: 'low_stock', label: 'Low Stock Alerts', desc: 'Get notified when a product stock falls below threshold.' },
                  { id: 'customer_signup', label: 'New Customer Signups', desc: 'Get notified when a new customer creates an account.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <div className="font-bold text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="p-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/10">
                  <div className="flex items-center gap-3 text-brand-brown font-bold mb-2">
                    <Shield size={18} />
                    Two-Factor Authentication
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account by requiring more than just a password to log in.</p>
                  <button className="bg-brand-brown text-white px-4 py-2 rounded-xl text-sm font-bold">Enable 2FA</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">Admin Session Timeout</div>
                      <div className="text-xs text-gray-500">Automatically log out after inactivity</div>
                    </div>
                    <select className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm font-bold">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
