import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

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
              <Lock size={14} /> Password
            </label>
            <input
              required
              type="password"
              className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
