import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { toast } from 'sonner';
import { MapPin, Phone, User, CreditCard, ChevronRight, LocateFixed, Loader2 } from 'lucide-react';
import { emailService } from '../services/emailService';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod' as 'cod' | 'online',
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();

          if (data.address) {
            const addr = data.address;
            const streetAddress = [
              addr.road,
              addr.suburb,
              addr.neighbourhood,
            ].filter(Boolean).join(', ');

            setFormData(prev => ({
              ...prev,
              address: streetAddress || prev.address,
              city: addr.city || addr.town || addr.village || prev.city,
              pincode: addr.postcode || prev.pincode,
            }));
            toast.success('Location updated successfully!');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          toast.error('Failed to get address from coordinates');
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Please allow location access to use this feature');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable');
            break;
          case error.TIMEOUT:
            toast.error('The request to get user location timed out');
            break;
          default:
            toast.error('An unknown error occurred while getting location');
        }
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: total(),
            status: 'pending',
            shipping_address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
            payment_method: formData.paymentMethod,
            customer_name: formData.name,
            customer_phone: formData.phone
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        image_url: item.image
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order Items Error:', itemsError);
        throw new Error(`Failed to save order items: ${itemsError.message}`);
      }
      
      // WhatsApp Integration
      const message = `*New Order from Sree Krishna Steels*%0A%0A` +
        `*Order ID:* ${order.id}%0A` +
        `*Customer:* ${formData.name}%0A` +
        `*Phone:* ${formData.phone}%0A` +
        `*Address:* ${formData.address}, ${formData.city} - ${formData.pincode}%0A%0A` +
        `*Items:*%0A` +
        items.map(item => `- ${item.title} x ${item.quantity} (₹${(item.price * item.quantity).toLocaleString()})`).join('%0A') +
        `%0A%0A*Total Amount:* ₹${total().toLocaleString()}%0A` +
        `*Payment Method:* ${formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`;

      window.open(`https://wa.me/919949666666?text=${message}`, '_blank');
      
      // Send mock email
      await emailService.sendOrderConfirmation({
        order_id: order.id,
        customer_name: formData.name,
        customer_email: user.email,
        total_amount: total(),
        items: items.map(i => i.title)
      });
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      handleSupabaseError(error, 'placeOrder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-brand-brown mb-12">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">
          {/* Shipping Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-gold/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-serif text-brand-brown flex items-center gap-3">
                  <MapPin className="text-brand-gold" /> Shipping Details
                </h2>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-brand-brown transition-colors disabled:opacity-50"
                >
                  {locating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Locating...
                    </>
                  ) : (
                    <>
                      <LocateFixed size={14} /> Use Current Location
                    </>
                  )}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                    <User size={14} /> Full Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                    <MapPin size={14} /> Street Address
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="House No, Street Name"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">City</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="Vijayawada"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Pincode</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="520001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-gold/10">
              <h2 className="text-2xl font-serif text-brand-brown mb-8 flex items-center gap-3">
                <CreditCard className="text-brand-gold" /> Payment Method
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                    formData.paymentMethod === 'cod' 
                      ? "border-brand-gold bg-brand-gold/5" 
                      : "border-brand-gold/10 hover:border-brand-gold/30"
                  )}
                >
                  <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center">
                    <Phone className="text-brand-gold" />
                  </div>
                  <span className="font-bold text-brand-brown">Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'online' })}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                    formData.paymentMethod === 'online' 
                      ? "border-brand-gold bg-brand-gold/5" 
                      : "border-brand-gold/10 hover:border-brand-gold/30"
                  )}
                >
                  <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center">
                    <CreditCard className="text-brand-gold" />
                  </div>
                  <span className="font-bold text-brand-brown">Online Payment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-gold/10 sticky top-32">
              <h2 className="text-2xl font-serif text-brand-brown mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-brand-charcoal/60">{item.title} x {item.quantity}</span>
                    <span className="font-bold text-brand-brown">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-brand-gold/10 my-4"></div>
              <div className="flex justify-between text-xl font-bold text-brand-brown mb-8">
                <span>Total</span>
                <span>₹{total().toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    Place Order <ChevronRight size={20} />
                  </>
                )}
              </button>

              <p className="mt-6 text-center text-xs text-brand-charcoal/40 italic">
                By clicking "Place Order", you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
