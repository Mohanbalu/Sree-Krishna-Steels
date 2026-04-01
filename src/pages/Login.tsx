import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Chrome, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGoogleHint, setShowGoogleHint] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowGoogleHint(false);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message === 'Invalid login credentials') {
          setShowGoogleHint(true);
          toast.error('Invalid credentials. See the hint below.');
        } else {
          throw error;
        }
        return;
      }
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email first.');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 flex items-center justify-center bg-brand-cream min-h-screen">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Welcome Back</h1>
          <p className="text-brand-charcoal/60">Login to your Sree Krishna account</p>
        </div>

        {showGoogleHint && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs font-bold">Google Login detected?</p>
              <p className="text-[11px] leading-relaxed opacity-90">
                If you usually login with Google, you don't have a manual password yet. 
                Please use the <strong>Google button</strong> below or click 
                <button 
                  onClick={handleForgotPassword}
                  className="mx-1 text-brand-gold font-bold hover:underline"
                >
                  Forgot Password
                </button>
                to set one.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-bold text-brand-gold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : (
              <>
                Login <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-gold/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-brand-charcoal/40">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mt-6 w-full bg-white border border-brand-gold/20 text-brand-brown py-4 rounded-xl font-bold text-lg hover:bg-brand-cream transition-colors flex items-center justify-center gap-2"
          >
            <Chrome size={20} /> Google
          </button>
        </div>

        <p className="mt-8 text-center text-brand-charcoal/60 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-gold font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
