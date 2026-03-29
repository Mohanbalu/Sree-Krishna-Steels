import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
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
    
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If profile is missing, it might be the trigger delay. 
        // We'll return a minimal profile object to prevent crashes.
        if (error.code === 'PGRST116') {
          return { id: userId, role: 'customer' } as UserProfile;
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile;
    };

    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      set({ user: session.user, profile, loading: false, initialized: true });
    } else {
      set({ user: null, profile: null, loading: false, initialized: true });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ user: session.user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },
}));
