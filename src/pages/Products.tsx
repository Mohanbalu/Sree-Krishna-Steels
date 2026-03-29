import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { supabase, handleSupabaseError } from '../lib/supabase';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentCat = searchParams.get('cat') || 'All';

  const categories = ['All', 'Beds', 'Sofas', 'Dining Tables', 'Wardrobes', 'Office Furniture', 'Steel Almirahs'];

  useEffect(() => {
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
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDbProducts(data || []);
      } catch (error) {
        handleSupabaseError(error, 'fetchProducts');
      } finally {
        setLoading(false);
      }
    };

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

  const allProducts = useMemo(() => {
    // Merge DB products with static products, prioritizing DB products
    const staticProducts = PRODUCTS.map(p => ({
      ...p,
      title: p.name,
      image: p.images[0],
      isStatic: true
    }));
    
    const formattedDbProducts = dbProducts.map(p => ({
      ...p,
      image: p.product_images?.[0]?.image_url || '',
      images: p.product_images?.map((img: any) => img.image_url) || []
    }));

    return [...formattedDbProducts, ...staticProducts];
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    if (currentCat === 'All') return allProducts;
    return allProducts.filter(p => p.category === currentCat);
  }, [currentCat, allProducts]);

  if (loading && dbProducts.length === 0) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-serif text-brand-brown mb-6">Our Collection</h1>
        <p className="text-brand-charcoal/60 max-w-2xl mx-auto">Explore our range of premium furniture, meticulously designed for modern homes and lasting comfort.</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSearchParams(cat === 'All' ? {} : { cat })}
            className={cn(
              "px-8 py-3 rounded-full text-sm font-semibold transition-all border",
              currentCat === cat 
                ? "bg-brand-brown text-white border-brand-brown shadow-lg" 
                : "bg-white text-brand-charcoal border-brand-charcoal/10 hover:border-brand-gold"
            )}
          >
            {cat}
          </button>
        ))}
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
            <Link to={`/products/${product.id}`}>
              <div className="relative aspect-square overflow-hidden rounded-3xl mb-6 bg-white shadow-sm">
                <img
                  src={product.image || product.images?.[0]}
                  alt={product.title || product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/10 transition-colors"></div>
              </div>
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
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-brand-charcoal/40 text-xl italic">No products found in this category yet. Stay tuned!</p>
        </div>
      )}
    </div>
  );
}
