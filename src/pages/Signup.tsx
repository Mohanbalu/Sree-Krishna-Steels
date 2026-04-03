import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { validatePhone } from '../lib/validation';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAILS = ['support@sksfurniture.in', 'mohanbalu292@gmail.com'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      toast.error('Admin accounts must be created by the system administrator.');
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (!validatePhone(cleanedPhone)) {
      toast.error('Please enter a valid 10-digit phone number (starts with 6-9)');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: cleanedPhone,
          },
        },
      });

      if (error) throw error;

      // Create profile immediately if user was created
      if (data.user) {
        try {
          await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                name: name,
                email: email,
                phone: cleanedPhone,
                role: 'customer'
              }
            ]);
        } catch (profileError) {
          console.warn('Could not create profile during signup (might be RLS), authStore will retry on login:', profileError);
        }
      }

      toast.success('Account created! Please check your email for verification.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 flex items-center justify-center bg-brand-cream min-h-screen">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Create Account</h1>
          <p className="text-brand-charcoal/60">Join the Sree Krishna family today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
              <User size={14} /> Full Name
            </label>
            <input
              required
              type="text"
              className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
              <Mail size={14} /> Email Address
            </label>
            <input
              required
              type="email"
              className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
              <Phone size={14} /> Phone Number
            </label>
            <input
              required
              type="tel"
              maxLength={10}
              className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPhone(value);
              }}
            />
            {phone && phone.length > 0 && phone.length < 10 && (
              <p className="text-[10px] text-amber-600 font-medium">Must be 10 digits</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
              <Lock size={14} /> Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                className="w-full bg-brand-cream border-none rounded-xl p-4 pr-12 focus:ring-2 focus:ring-brand-gold outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-gold transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : (
              <>
                Sign Up <UserPlus size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-brand-charcoal/60 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-gold font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
