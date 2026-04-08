import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Trash2, AlertTriangle, Search, X, Play, Pin } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const currentCat = searchParams.get('cat') || 'All';

  const [categories, setCategories] = useState(['All', 'Beds', 'Sofas', 'Dining Tables', 'Wardrobes', 'Office Furniture', 'Steel Almirahs', 'Iron Safe']);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const fetchProducts = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            image_url
          )
        `)
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbProducts(data || []);
      
      // Dynamically update categories from database
      if (data) {
        const dbCats = Array.from(new Set(data.map((p: any) => p.category))).filter(Boolean);
        setCategories(prev => {
          const combined = Array.from(new Set(['All', ...prev, ...dbCats]));
          return combined;
        });
      }
    } catch (error: any) {
      handleSupabaseError(error, 'fetchProducts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    if (supabase) {
      // Subscribe to changes
      const channel = supabase
        .channel('products-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      // First delete associated images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productToDelete);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      handleSupabaseError(error, 'deleteProduct');
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const allProducts = useMemo(() => {
    const formattedDbProducts = dbProducts.map(p => ({
      ...p,
      title: p.title || p.name,
      image: p.product_images?.[0]?.image_url || p.image_url || '',
      images: p.product_images?.map((img: any) => img.image_url) || []
    }));

    return formattedDbProducts;
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    if (currentCat !== 'All') {
      filtered = filtered.filter(p => p.category === currentCat);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title || p.name || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [currentCat, allProducts, searchTerm]);

  // No full-page loading spinner if we have static products to show
  // Only show spinner if we have no products at all and we are loading
  const showSpinner = loading && dbProducts.length === 0;

  if (showSpinner) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-brand-brown mb-6">Our Collection</h1>
        <p className="text-brand-charcoal/60 max-w-2xl mx-auto text-sm sm:text-base">Explore our range of premium furniture, meticulously designed for modern homes and lasting comfort.</p>
        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-brand-gold animate-pulse">
            <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
            <span className="text-xs font-bold uppercase tracking-widest">Updating Collection...</span>
          </div>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-8 mb-16">
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-0 bg-brand-gold/5 blur-2xl rounded-full group-focus-within:bg-brand-gold/10 transition-all"></div>
          <div className="relative flex items-center bg-white rounded-3xl shadow-xl shadow-brand-brown/5 border border-brand-brown/5 overflow-hidden">
            <div className="pl-6 text-brand-brown/30">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder="Search for beds, sofas..."
              className="w-full px-4 sm:px-6 py-4 sm:py-6 bg-transparent border-none focus:ring-0 text-brand-brown font-medium placeholder:text-brand-brown/30 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="pr-6 text-brand-brown/30 hover:text-brand-brown transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchParams(cat === 'All' ? {} : { cat })}
              className={cn(
                "px-4 sm:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all border",
                currentCat === cat 
                  ? "bg-brand-brown text-white border-brand-brown shadow-lg" 
                  : "bg-white text-brand-charcoal border-brand-charcoal/10 hover:border-brand-gold"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group"
          >
            <div className="relative group">
              <Link to={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden rounded-3xl mb-6 bg-white shadow-sm">
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.title || product.name}
                    className={cn(
                      "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                      product.stock <= 0 && "grayscale opacity-60"
                    )}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/10 transition-colors"></div>
                  
                  {product.reel_link && (
                    <div className="absolute bottom-4 left-4 bg-brand-gold text-white p-2 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                      <Play size={12} fill="currentColor" /> Reel Available
                    </div>
                  )}

                  {product.is_pinned && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-brand-gold p-2 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                      <Pin size={12} fill="currentColor" /> Featured
                    </div>
                  )}

                  {product.stock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-red-600 text-white px-6 py-2 rounded-full shadow-2xl text-xs font-bold uppercase tracking-[0.2em] transform -rotate-12 border-2 border-white">
                        Out of Stock
                      </div>
                    </div>
                  )}
                </div>
              </Link>

              {isAdmin && !product.isStatic && (
                <button
                  onClick={(e) => confirmDelete(e, product.id)}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 z-10"
                  title="Delete Product"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <Link to={`/products/${product.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-serif text-brand-brown">{product.title || product.name}</h3>
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-2">{product.category}</span>
                </div>
                <p className="text-brand-charcoal/60 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-brand-brown font-bold text-lg">
                    {typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price}
                  </p>
                  <span className="text-brand-gold font-semibold text-sm group-hover:underline">View Details</span>
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-brand-charcoal/40 text-xl italic">No products found in this category yet. Stay tuned!</p>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-charcoal/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-serif text-brand-brown mb-4">Delete Product?</h2>
            <p className="text-gray-500 mb-8">This action cannot be undone. All product data will be permanently removed from the store.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
