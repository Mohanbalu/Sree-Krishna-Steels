import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const { user, initialized } = useAuthStore();

  if (!initialized || !user) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-brand-gold" />
        </div>
        <h1 className="text-3xl font-serif text-brand-brown mb-4">Your cart is empty</h1>
        <p className="text-brand-charcoal/60 mb-8 max-w-md">
          Looks like you haven't added any furniture to your cart yet. 
          Explore our collection and find something you love!
        </p>
        <Link
          to="/products"
          className="bg-brand-brown text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-charcoal transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-brand-brown mb-12">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gold/10 flex gap-6 items-center"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-brand-brown">{item.title}</h3>
                  <p className="text-brand-gold font-bold">₹{item.price.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-4 bg-brand-cream rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:text-brand-gold transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:text-brand-gold transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-brand-charcoal/40 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-gold/10 sticky top-32">
              <h2 className="text-2xl font-serif text-brand-brown mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-brand-charcoal/60">
                  <span>Subtotal</span>
                  <span>₹{total().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-brand-charcoal/60">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="h-px bg-brand-gold/10 my-4"></div>
                <div className="flex justify-between text-xl font-bold text-brand-brown">
                  <span>Total</span>
                  <span>₹{total().toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2"
              >
                Checkout <ArrowRight size={20} />
              </Link>

              <p className="mt-6 text-center text-xs text-brand-charcoal/40">
                Secure checkout powered by Sree Krishna Steels
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
