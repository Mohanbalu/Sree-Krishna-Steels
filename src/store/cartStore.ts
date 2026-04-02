import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: (sync?: boolean) => void;
  total: () => number;
  syncToSupabase: (userId: string, retryCount?: number) => Promise<void>;
  fetchFromSupabase: (userId: string, retryCount?: number) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        let newItems;
        if (existing) {
          newItems = get().items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        } else {
          newItems = [...get().items, item];
        }
        set({ items: newItems });
        
        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) get().syncToSupabase(userId);
      },
      removeItem: (id) => {
        const newItems = get().items.filter((i) => i.id !== id);
        set({ items: newItems });
        
        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) get().syncToSupabase(userId);
      },
      updateQuantity: (id, quantity) => {
        const newItems = get().items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
        );
        set({ items: newItems });
        
        // Sync to Supabase if logged in
        const userId = useAuthStore.getState().user?.id;
        if (userId) get().syncToSupabase(userId);
      },
      setItems: (items) => set({ items }),
      clearCart: (sync = true) => {
        set({ items: [] });
        if (sync) {
          const userId = useAuthStore.getState().user?.id;
          if (userId) get().syncToSupabase(userId);
        }
      },
      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      
      syncToSupabase: async (userId: string, retryCount = 0): Promise<void> => {
        if (!supabase) return;
        try {
          const items = get().items;
          
          const syncPromise = (async () => {
            // First, delete existing cart items for this user
            const { error: deleteError } = await supabase.from('cart_items').delete().eq('user_id', userId);
            if (deleteError) throw deleteError;
            
            if (items.length > 0) {
              const toInsert = items.map(item => ({
                user_id: userId,
                product_id: item.id,
                quantity: item.quantity,
                // We store metadata to handle static products easily
                metadata: {
                  title: item.title,
                  price: item.price,
                  image: item.image
                }
              }));
              const { error: insertError } = await supabase.from('cart_items').insert(toInsert);
              if (insertError) throw insertError;
            }
          })();

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cart sync timeout')), 15000) // Reduced to 15s
          );

          await Promise.race([syncPromise, timeoutPromise]);
        } catch (error: any) {
          // Retry on transient errors or timeouts
          if (retryCount < 2 && (error.code === '503' || error.code === '504' || error.message?.includes('timeout'))) {
            console.warn(`Cart sync failed (attempt ${retryCount + 1}) with ${error.code || 'timeout'}, retrying in 2s...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return get().syncToSupabase(userId, retryCount + 1);
          }
          console.error('Error syncing cart to Supabase:', error);
        }
      },

      fetchFromSupabase: async (userId: string, retryCount = 0): Promise<void> => {
        if (!supabase) return;
        try {
          const cartPromise = supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId);

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cart fetch timeout')), 15000) // Reduced to 15s
          );

          const { data, error } = await Promise.race([
            Promise.resolve(cartPromise),
            timeoutPromise
          ]) as any;
          
          if (error) {
            // Retry on transient errors or timeouts
            if (retryCount < 2 && (error.code === '503' || error.code === '504' || error.message?.includes('timeout'))) {
              console.warn(`Cart fetch failed (attempt ${retryCount + 1}) with ${error.code || 'timeout'}, retrying in 2s...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              return get().fetchFromSupabase(userId, retryCount + 1);
            }
            throw error;
          }
          
          if (data) {
            const items: CartItem[] = data.map(row => ({
              id: row.product_id,
              quantity: row.quantity,
              title: row.metadata?.title || 'Product',
              price: row.metadata?.price || 0,
              image: row.metadata?.image || ''
            }));
            set({ items });
          }
        } catch (error: any) {
          if (retryCount < 2 && error.message?.includes('timeout')) {
            console.warn(`Cart fetch timed out (attempt ${retryCount + 1}), retrying in 2s...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return get().fetchFromSupabase(userId, retryCount + 1);
          }
          console.error('Error fetching cart from Supabase:', error);
        }
      }
    }),
    { name: 'cart-storage' }
  )
);
