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
    // Prevent multiple initializations
    if (useAuthStore.getState().initialized && supabase) {
      return;
    }

    if (!supabase) {
      set({ loading: false, initialized: true });
      return;
    }

    const fetchProfile = async (userId: string, userEmail?: string, userName?: string, userPhone?: string) => {
      try {
        // Add a timeout to the profile fetch to prevent stuck loading state
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        );

        const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
        
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
                  role: userEmail === 'support@sksfurniture.in' ? 'super_admin' : 'customer' 
                }
              ])
              .select()
              .single();
              
            if (createError) {
              console.error('Auto-create failed:', createError);
              return { id: userId, role: 'customer', email: userEmail || '', name: userName || 'User', created_at: new Date().toISOString() } as UserProfile;
            }
            return newProfile as UserProfile;
          }
          console.error('Error fetching profile:', error);
          return null;
        }
        return data as UserProfile;
      } catch (err) {
        console.error('fetchProfile error or timeout:', err);
        return null;
      }
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
        // Run profile and cart fetching in parallel to speed up initialization
        const [profile] = await Promise.all([
          fetchProfile(
            session.user.id, 
            session.user.email, 
            session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            session.user.user_metadata?.phone || session.user.phone
          ),
          useCartStore.getState().fetchFromSupabase(session.user.id)
        ]);
        
        // Ensure support@sksfurniture.in is always an admin
        if (session.user.email === 'support@sksfurniture.in' && profile) {
          profile.role = 'super_admin';
        }
        
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
      console.log('Auth event triggered:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        useCartStore.getState().clearCart(false);
        set({ user: null, profile: null, loading: false, initialized: true });
        return;
      }

      if (session?.user) {
        const currentUser = useAuthStore.getState().user;
        let currentProfile = useAuthStore.getState().profile;
        
        // Ensure support@sksfurniture.in is always an admin
        if (session.user.email === 'support@sksfurniture.in' && currentProfile && currentProfile.role !== 'super_admin') {
          currentProfile = { ...currentProfile, role: 'super_admin' };
        }
        
        // If we already have the user and profile, and it's just a token refresh or similar, 
        // don't set loading to true to avoid jarring UI shifts.
        if (currentUser?.id === session.user.id && currentProfile && event !== 'SIGNED_IN') {
          console.log('Session refreshed, keeping existing profile');
          set({ user: session.user, profile: currentProfile, loading: false, initialized: true });
          return;
        }

        console.log('Fetching profile for session user...');
        // Only set loading true if we don't have a profile yet or it's a fresh sign in
        if (!currentProfile || event === 'SIGNED_IN') {
          set({ loading: true });
        }
        
        try {
          const profilePromise = fetchProfile(
            session.user.id, 
            session.user.email, 
            session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            session.user.user_metadata?.phone || session.user.phone
          );
          
          const cartPromise = useCartStore.getState().fetchFromSupabase(session.user.id);

          const [profile] = await Promise.all([profilePromise, cartPromise]);
          
          // Ensure support@sksfurniture.in is always an admin
          if (session.user.email === 'support@sksfurniture.in' && profile) {
            profile.role = 'super_admin';
          }
          
          console.log('Profile fetched successfully:', profile?.role);
          set({ user: session.user, profile, loading: false, initialized: true });
        } catch (error) {
          console.error('Error in onAuthStateChange profile fetch:', error);
          set({ user: session.user, profile: null, loading: false, initialized: true });
        }
      } else {
        useCartStore.getState().clearCart(false);
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });
  },
}));
