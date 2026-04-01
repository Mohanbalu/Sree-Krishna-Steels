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
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    try {
      // Clear local state immediately for a snappy UI
      set({ user: null, profile: null });
      useCartStore.getState().clearCart(false);
      
      if (supabase) {
        // Don't await this to avoid blocking the UI, but still call it
        supabase.auth.signOut().catch(err => console.error('Supabase signOut error:', err));
      }
    } catch (error) {
      console.error('Logout error in store:', error);
    }
  },
  initialize: async () => {
    if (!supabase) {
      set({ loading: false, initialized: true });
      return;
    }

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

    // Initial session check
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        if (sessionError.message.includes('Refresh Token Not Found') || sessionError.message.includes('Invalid Refresh Token')) {
          console.warn('Stale session found, clearing...');
          await supabase.auth.signOut();
          set({ loading: false, initialized: true });
          return;
        }
        throw sessionError;
      }
      
      if (session?.user) {
        const profile = await fetchProfile(
          session.user.id, 
          session.user.email, 
          session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          session.user.user_metadata?.phone || session.user.phone
        );
        // Fetch cart from Supabase on initial load
        await useCartStore.getState().fetchFromSupabase(session.user.id);
        set({ user: session.user, profile, loading: false, initialized: true });
      } else {
        useCartStore.getState().clearCart(false);
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, profile: null, loading: false, initialized: true });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        useCartStore.getState().clearCart(false);
        set({ user: null, profile: null, loading: false });
        return;
      }

      if (session?.user) {
        const profile = await fetchProfile(
          session.user.id, 
          session.user.email, 
          session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          session.user.user_metadata?.phone || session.user.phone
        );
        // Fetch cart from Supabase on login
        await useCartStore.getState().fetchFromSupabase(session.user.id);
        set({ user: session.user, profile, loading: false });
      } else {
        useCartStore.getState().clearCart(false);
        set({ user: null, profile: null, loading: false });
      }
    });
  },
}));
