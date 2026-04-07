import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: (sync?: boolean) => void;
  total: () => number;
  syncToSupabase: (userId: string) => Promise<void>;
  fetchFromSupabase: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        let newItems;
        if (existing) {
          // Ensure we don't exceed stock
          const newQuantity = Math.min(existing.quantity + item.quantity, item.stock);
          newItems = get().items.map((i) =>
            i.id === item.id ? { ...i, quantity: newQuantity } : i
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
        const item = get().items.find(i => i.id === id);
        if (!item) return;

        const newQuantity = Math.min(Math.max(1, quantity), item.stock);
        const newItems = get().items.map((i) =>
          i.id === id ? { ...i, quantity: newQuantity } : i
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
      
      syncToSupabase: async (userId: string): Promise<void> => {
        if (!supabase) return;
        try {
          const items = get().items;
          
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
                image: item.image,
                stock: item.stock
              }
            }));
            const { error: insertError } = await supabase.from('cart_items').insert(toInsert);
            if (insertError) throw insertError;
          }
        } catch (error: any) {
          handleSupabaseError(error, 'syncCartToSupabase');
        }
      },

      fetchFromSupabase: async (userId: string): Promise<void> => {
        if (!supabase) return;
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId);
          
          if (error) throw error;
          
          if (data) {
            const items: CartItem[] = data.map(row => ({
              id: row.product_id,
              quantity: row.quantity,
              title: row.metadata?.title || 'Product',
              price: row.metadata?.price || 0,
              image: row.metadata?.image || '',
              stock: row.metadata?.stock || 999 // Fallback if missing
            }));
            set({ items });
          }
        } catch (error: any) {
          handleSupabaseError(error, 'fetchCartFromSupabase');
        }
      }
    }),
    { name: 'cart-storage' }
  )
);
