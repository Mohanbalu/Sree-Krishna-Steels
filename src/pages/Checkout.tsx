import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { toast } from 'sonner';
import { MapPin, Phone, User, CreditCard, ChevronRight, LocateFixed, Loader2, Mail } from 'lucide-react';
import { emailService } from '../services/emailService';
import { validatePhone } from '../lib/validation';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const subtotal = total();
  const gstAmount = 0; // Admin will assign later
  const deliveryFee = 0; // Admin will assign later
  const finalTotal = subtotal;

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod' as 'cod',
  });

  // Sync form data when profile loads
  React.useEffect(() => {
    if (profile || user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile?.name || '',
        phone: prev.phone || profile?.phone || '',
        email: prev.email || user?.email || '',
      }));
    }
  }, [profile, user]);

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
          console.log(`📍 Coordinates obtained: ${latitude}, ${longitude}. Fetching address...`);
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'FurnitureStoreApp/1.0'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Geocoding API responded with status: ${response.status}`);
          }

          const data = await response.json();
          console.log('🗺️ Geocoding data received:', data);

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

    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please provide a valid email address');
      return;
    }

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (!validatePhone(cleanedPhone)) {
      toast.error('Please enter a valid 10-digit phone number (starts with 6-9)');
      return;
    }

    setLoading(true);
    console.log('🚀 Starting order placement process...');
    try {
      if (!supabase) {
        throw new Error('Database connection not available. Please check your environment variables.');
      }

      // 0. Verify Stock
      console.log('🔍 Verifying stock for all items...');
      const { data: latestProducts, error: stockError } = await supabase
        .from('products')
        .select('id, title, stock')
        .in('id', items.map(i => i.id));

      if (stockError) throw stockError;

      for (const item of items) {
        const product = latestProducts?.find(p => p.id === item.id);
        if (!product) {
          throw new Error(`Product "${item.title}" no longer exists.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.title}". Available: ${product.stock}, Requested: ${item.quantity}`);
        }
      }

      // 1. Create the order
      console.log('📦 Creating order in Supabase...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: finalTotal,
            subtotal: subtotal,
            gst_amount: gstAmount,
            delivery_fee: deliveryFee,
            status: 'pending',
            payment_status: 'pending',
            shipping_address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
            address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
            payment_method: formData.paymentMethod,
            customer_name: formData.name,
            customer_phone: cleanedPhone,
            phone: cleanedPhone
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order Creation Error:', orderError);
        throw orderError;
      }

      if (!order) {
        throw new Error('Order was created but no data was returned.');
      }

      console.log('✅ Order created successfully:', order.id, 'Email:', formData.email);

      // 2. Create order items
      console.log('🛍️ Creating order items...');
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
        console.error('❌ Order Items Error:', itemsError);
        throw new Error(`Failed to save order items: ${itemsError.message}`);
      }

      console.log('✅ Order items created successfully');
      
      // Send mock email
      console.log('📧 Sending confirmation email to:', formData.email);
      await emailService.sendOrderConfirmation({
        order_id: order.id,
        user_id: user.id,
        customer_name: formData.name,
        customer_email: formData.email,
        subtotal: subtotal,
        gst_amount: gstAmount,
        delivery_fee: deliveryFee,
        total_amount: finalTotal,
        items: items.map(i => i.title)
      });
      
      console.log('🧹 Clearing cart and navigating...');
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      console.error('🛑 Checkout Process Failed:', error);
      handleSupabaseError(error, 'placeOrder');
    } finally {
      setLoading(false);
      console.log('🏁 Checkout process finished');
    }
  };

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-brand-brown mb-8 sm:mb-12">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">
          {/* Shipping Details */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-brand-gold/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-serif text-brand-brown flex items-center gap-3">
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
                    maxLength={10}
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: value });
                    }}
                  />
                  {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                    <p className="text-[10px] text-amber-600 font-medium">Must be 10 digits</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                    <Mail size={14} /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-brand-gold/10">
              <h2 className="text-xl sm:text-2xl font-serif text-brand-brown mb-6 sm:mb-8 flex items-center gap-3">
                <CreditCard className="text-brand-gold" /> Payment Method
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div
                  className="p-6 rounded-2xl border-2 border-brand-gold bg-brand-gold/5 flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center">
                    <Phone className="text-brand-gold" />
                  </div>
                  <span className="font-bold text-brand-brown">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-brand-gold/10 sticky top-32">
              <h2 className="text-xl sm:text-2xl font-serif text-brand-brown mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-brand-charcoal/60">{item.title} x {item.quantity}</span>
                    <span className="font-bold text-brand-brown">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-brand-gold/10 my-4"></div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-brand-charcoal/60">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-brand-charcoal/60">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-brand-charcoal/60">
                  <span>GST (18%)</span>
                  <span>₹{gstAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-px bg-brand-gold/10 my-4"></div>
              <div className="flex justify-between text-xl font-bold text-brand-brown mb-8">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
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
