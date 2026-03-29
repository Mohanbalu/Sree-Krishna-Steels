import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '@/src/constants';
import { cn } from '@/src/lib/utils';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCat = searchParams.get('cat') || 'All';

  const categories = ['All', 'Beds', 'Sofas', 'Dining Tables', 'Dressing Tables'];

  const filteredProducts = useMemo(() => {
    if (currentCat === 'All') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === currentCat);
  }, [currentCat]);

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
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/10 transition-colors"></div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-serif text-brand-brown">{product.name}</h3>
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-2">{product.category}</span>
              </div>
              <p className="text-brand-charcoal/60 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-brand-brown font-bold text-lg">{product.price}</p>
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
