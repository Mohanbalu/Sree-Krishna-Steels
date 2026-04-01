import { createClient } from '@supabase/supabase-js';

import { toast } from 'sonner';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment settings.');
}

// Only create the client if we have the required parameters to avoid crashing the app on load
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // We'll handle null checks in the services or components

// Helper for error handling
export const handleSupabaseError = (error: any, operation: string) => {
  if (!supabase) {
    console.error('Supabase client is not initialized. Please check your environment variables.');
    toast.error('Database connection error. Please try again later.');
    return;
  }
  console.error(`Supabase Error [${operation}]:`, error);
  
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
