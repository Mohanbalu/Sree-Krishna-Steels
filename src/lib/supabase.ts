import { createClient } from '@supabase/supabase-js';

import { toast } from 'sonner';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

const isPlaceholder = supabaseUrl.includes('your-project-id') || supabaseAnonKey === 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey || isPlaceholder) {
  console.warn('Supabase environment variables are missing or using placeholders. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}

// Only create the client if we have the required parameters and they aren't placeholders
export const supabase = (supabaseUrl && supabaseAnonKey && !isPlaceholder) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Helper for error handling
export const handleSupabaseError = (error: any, operation: string) => {
  if (!supabase) {
    console.error('Supabase client is not initialized. Please check your environment variables in the Secrets panel.');
    toast.error('Database connection error: Supabase is not configured. Please set your environment variables.');
    return;
  }
  
  console.error(`Supabase Error [${operation}]:`, error);
  
  // Handle network errors (Failed to fetch)
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    toast.error('Network error: Could not connect to Supabase. Please check your internet connection or verify if your Supabase project is active (not paused).', {
      duration: 5000
    });
    return;
  }

  // Provide user-friendly messages for common errors
  const message = error?.message || 'An unexpected error occurred';
  
  if (message.includes('Refresh Token Not Found') || message.includes('Invalid Refresh Token')) {
    console.warn('Auth session expired, logging out...');
    toast.error('Your session has expired. Please log in again.');
    // We can't easily call useAuthStore.getState().signOut() here due to circular dependency
    // but we can clear local storage and reload or just let the next auth check handle it
    localStorage.clear();
    window.location.href = '/login';
    return;
  }

  toast.error(`Error: ${message}`);
  
  throw error;
};
