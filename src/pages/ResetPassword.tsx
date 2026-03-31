import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes to detect the recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event, session ? 'Session active' : 'No session');
      if (event === 'PASSWORD_RECOVERY') {
        // The user is now in recovery mode and logged in
        console.log('Password recovery mode active');
      } else if (event === 'SIGNED_IN' && !session) {
        // This shouldn't happen but good to handle
        console.log('Signed in but no session, navigating to login');
        navigate('/login');
      }
    });

    // Check current session as well
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session check:', session ? 'Session found' : 'No session');
      if (!session) {
        // Give it a moment to process the URL fragment
        console.log('Waiting for session from URL fragment...');
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          console.log('Retry session check:', retrySession ? 'Session found' : 'No session');
          if (!retrySession) {
            toast.error('Invalid or expired reset link.');
            navigate('/login');
          }
        }, 1500);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    console.log('Starting password update...');
    try {
      // Ensure we have a session before updating
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found. Please try the reset link again.');
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('Supabase updateUser error:', error);
        throw error;
      }
      
      console.log('Password updated successfully');
      toast.success('Password updated successfully!');
      
      // Small delay before signing out to ensure toast is seen and state is stable
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          console.log('Signed out after password reset');
          navigate('/login');
        } catch (signOutError) {
          console.error('Error signing out after reset:', signOutError);
          navigate('/login');
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('Password reset catch block:', error);
      toast.error(error.message || 'An error occurred while updating your password.');
      setLoading(false); // Manually set it here in case the finally block is somehow skipped or delayed
    } finally {
      // We don't set loading to false here if we are navigating away soon, 
      // but if there was an error, the catch block handles it.
      // If successful, the timeout will handle the transition.
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 flex items-center justify-center bg-brand-cream min-h-screen">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Reset Password</h1>
          <p className="text-brand-charcoal/60">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
              <Lock size={14} /> New Password
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

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
              <Lock size={14} /> Confirm New Password
            </label>
            <input
              required
              type={showPassword ? "text" : "password"}
              className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Updating...' : (
              <>
                Update Password <Save size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
