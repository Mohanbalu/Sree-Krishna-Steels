import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, Save, Loader2, Package, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { profile, setProfile, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const isGoogleUser = user?.app_metadata?.provider === 'google' || 
                     user?.identities?.some(id => id.provider === 'google');
  
  const hasPassword = user?.identities?.some(id => id.provider === 'email');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!profile?.email) return;
    
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password setup link sent to your email!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="pt-32 pb-24 px-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Missing Info Banner */}
        {!profile.phone && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-amber-800">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-sm">Complete your profile</p>
              <p className="text-xs opacity-80">Please add your phone number to receive order updates via WhatsApp.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Info */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-gold/10 text-center">
              <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand-gold/20">
                <User size={40} className="text-brand-gold" />
              </div>
              <h2 className="text-2xl font-serif text-brand-brown">{profile.name}</h2>
              <p className="text-brand-charcoal/60 text-sm capitalize">{profile.role.replace('_', ' ')}</p>
              
              <div className="mt-8 pt-8 border-t border-brand-gold/10 space-y-4">
                <Link 
                  to="/orders" 
                  className="flex items-center justify-center gap-2 w-full bg-brand-brown text-white py-3 rounded-xl font-bold hover:bg-brand-charcoal transition-colors"
                >
                  <Package size={18} /> View My Orders
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-gold/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal/40 mb-6">Account Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-charcoal/70">
                  <Mail size={18} className="text-brand-gold" />
                  <span className="text-sm truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-brand-charcoal/70">
                  <Phone size={18} className={profile.phone ? "text-brand-gold" : "text-red-400"} />
                  <span className={`text-sm ${!profile.phone ? "text-red-400 italic" : ""}`}>
                    {profile.phone || "No phone number"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-brand-charcoal/70">
                  <Calendar size={18} className="text-brand-gold" />
                  <span className="text-sm">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-gold/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal/40 mb-6">Security</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-emerald-500 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-brand-brown">Login Method</p>
                    <p className="text-xs text-brand-charcoal/60">{isGoogleUser ? 'Google Account' : 'Email & Password'}</p>
                  </div>
                </div>

                {!hasPassword && isGoogleUser && (
                  <div className="pt-2">
                    <p className="text-xs text-brand-charcoal/60 mb-4">
                      You are logged in with Google. Set a password to enable manual login with your email.
                    </p>
                    <button
                      onClick={handleSetPassword}
                      disabled={passwordLoading}
                      className="w-full flex items-center justify-center gap-2 bg-brand-cream text-brand-brown py-3 rounded-xl text-xs font-bold hover:bg-brand-gold/10 transition-colors border border-brand-gold/20 disabled:opacity-50"
                    >
                      {passwordLoading ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
                      Set Account Password
                    </button>
                  </div>
                )}

                {hasPassword && (
                  <button
                    onClick={handleSetPassword}
                    disabled={passwordLoading}
                    className="w-full flex items-center justify-center gap-2 bg-brand-cream text-brand-brown py-3 rounded-xl text-xs font-bold hover:bg-brand-gold/10 transition-colors border border-brand-gold/20 disabled:opacity-50"
                  >
                    {passwordLoading ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-brand-gold/10">
              <h1 className="text-3xl font-serif text-brand-brown mb-8">Edit Profile</h1>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                      <User size={14} /> Full Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                      <Mail size={14} /> Email Address
                    </label>
                    <input
                      disabled
                      type="email"
                      className="w-full bg-brand-cream border-none rounded-xl p-4 opacity-60 cursor-not-allowed outline-none"
                      value={formData.email}
                    />
                    <p className="text-[10px] text-brand-charcoal/40 italic">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                      <Phone size={14} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      className={`w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none ${!formData.phone ? "ring-1 ring-amber-200" : ""}`}
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {!formData.phone && (
                      <p className="text-[10px] text-amber-600 font-medium">Required for order updates</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Updating...
                      </>
                    ) : (
                      <>
                        Save Changes <Save size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
