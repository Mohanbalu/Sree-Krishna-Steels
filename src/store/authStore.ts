import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useCartStore } from './cartStore';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer';
  created_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setProfile: (profile: UserProfile | null) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setProfile: (profile) => set({ profile }),
  initialize: async () => {
    if (!supabase) {
      set({ loading: false, initialized: true });
      return;
    }

    // Initial session check
    const { data: { session } } = await supabase.auth.getSession();
    
    const fetchProfile = async (userId: string, userEmail?: string, userName?: string, userPhone?: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If profile is missing (PGRST116), try to create it immediately
        if (error.code === 'PGRST116') {
          console.log('Profile missing in DB, auto-creating...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: userId, 
                name: userName || 'User', 
                email: userEmail,
                phone: userPhone,
                role: 'customer' 
              }
            ])
            .select()
            .single();
            
          if (createError) {
            console.error('Auto-create failed:', createError);
            return { id: userId, role: 'customer' } as UserProfile;
          }
          return newProfile as UserProfile;
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile;
    };

    if (session?.user) {
      const profile = await fetchProfile(
        session.user.id, 
        session.user.email, 
        session.user.user_metadata?.full_name || session.user.user_metadata?.name,
        session.user.user_metadata?.phone || session.user.phone
      );
      set({ user: session.user, profile, loading: false, initialized: true });
    } else {
      useCartStore.getState().clearCart();
      set({ user: null, profile: null, loading: false, initialized: true });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(
          session.user.id, 
          session.user.email, 
          session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          session.user.user_metadata?.phone || session.user.phone
        );
        set({ user: session.user, profile, loading: false });
      } else {
        useCartStore.getState().clearCart();
        set({ user: null, profile: null, loading: false });
      }
    });
  },
}));
