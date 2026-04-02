import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, ArrowLeft, Phone, MessageSquare, ShieldCheck, Package, Ruler, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      // Guard against invalid or missing ID
      if (!id || id === 'undefined' || id === '[object Object]') {
        console.warn('Invalid product ID provided:', id);
        setLoading(false);
        return;
      }

      try {
        // Try Supabase if client exists
        if (supabase) {
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              product_images (
                image_url
              )
            `)
            .eq('id', id)
            .single();
          
          if (data) {
            setProduct({
              ...data,
              title: data.name,
              images: data.product_images?.map((img: any) => img.image_url) || [],
              image: data.product_images?.[0]?.image_url || ''
            });
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        handleSupabaseError(error, `fetchProduct/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold mx-auto"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h1 className="text-4xl font-serif mb-4 text-brand-brown">Product Not Found</h1>
        <Link to="/products" className="text-brand-gold font-bold hover:underline">Back to Collection</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const price = typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price;
  const numericPrice = typeof product.price === 'number' ? product.price : parseInt(product.price.replace(/[^0-9]/g, ''));

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    addItem({
      id: product.id,
      title: product.title || product.name,
      price: numericPrice,
      quantity: quantity,
      image: product.image || product.images?.[0]
    });
    toast.success('Added to cart!');
  };

  const whatsappUrl = `https://wa.me/919949666666?text=${encodeURIComponent(`Hi, I'm interested in the ${product.title || product.name}. Please provide more details.`)}`;

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-brand-charcoal/60 hover:text-brand-brown mb-12 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border border-brand-gold/10"
          >
            <img 
              src={images[activeImage]} 
              alt={product.title || product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2 block">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4">{product.title || product.name}</h1>
            <p className="text-3xl font-bold text-brand-gold mb-6">{price}</p>
            <p className="text-brand-charcoal/70 leading-relaxed text-lg mb-8">{product.description || product.fullDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-3 p-5 bg-white rounded-3xl shadow-sm border border-brand-gold/10">
              <Package className="text-brand-gold shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm text-brand-brown uppercase tracking-wider">Material</h4>
                <p className="text-sm text-brand-charcoal/60">{product.material || 'Premium Quality'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 bg-white rounded-3xl shadow-sm border border-brand-gold/10">
              <Ruler className="text-brand-gold shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm text-brand-brown uppercase tracking-wider">Dimensions</h4>
                <p className="text-sm text-brand-charcoal/60">{product.size || 'Standard Size'}</p>
              </div>
            </div>
          </div>

          {product.benefits && (
            <div className="mb-10">
              <h4 className="font-serif text-xl text-brand-brown mb-4">Key Benefits</h4>
              <ul className="space-y-3">
                {product.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-brand-charcoal/80">
                    <div className="bg-brand-gold/20 p-1 rounded-full">
                      <Check size={14} className="text-brand-gold" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6 mt-auto pt-8 border-t border-brand-gold/10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-brand-cream rounded-2xl p-2 border border-brand-gold/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl hover:bg-white transition-colors flex items-center justify-center"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl hover:bg-white transition-colors flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-grow bg-brand-brown text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-charcoal transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-brown/20"
              >
                <ShoppingCart size={22} /> Add to Cart
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white border-2 border-brand-gold text-brand-gold py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:bg-brand-gold hover:text-white transition-all"
              >
                <MessageSquare size={20} /> Enquire on WhatsApp
              </a>
              {product.reel_link && (
                <a 
                  href={product.reel_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-brand-gold/10 text-brand-gold py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:bg-brand-gold/20 transition-all"
                >
                  Watch Reel
                </a>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-6 text-xs text-brand-charcoal/40 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1"><ShieldCheck size={14} /> 5 Year Warranty</div>
            <div className="flex items-center gap-1"><Package size={14} /> Free Installation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
