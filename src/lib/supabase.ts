import { createClient } from '@supabase/supabase-js';

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
    return;
  }
  console.error(`Supabase Error [${operation}]:`, error);
  throw error;
};
