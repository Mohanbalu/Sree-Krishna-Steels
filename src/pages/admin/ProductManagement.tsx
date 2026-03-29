import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Link as LinkIcon, Package, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  reel_link?: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Beds',
    image_url: '',
    reel_link: '',
  });

  const categories = ['Beds', 'Sofas', 'Dining Tables', 'Wardrobes', 'Office Furniture', 'Steel Almirahs'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        handleSupabaseError(error, 'fetchProducts');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to changes
    const channel = supabase
      .channel('products-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        image_url: formData.image_url,
        reel_link: formData.reel_link,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([data])
          .select()
          .single();

        if (error) throw error;

        // Also add to product_images for the main image
        await supabase
          .from('product_images')
          .insert([{ product_id: newProduct.id, image_url: data.image_url }]);

        toast.success('Product added successfully!');
      }
      closeModal();
    } catch (error) {
      handleSupabaseError(error, 'saveProduct');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully!');
    } catch (error) {
      handleSupabaseError(error, 'deleteProduct');
    }
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image_url: product.image_url,
        reel_link: product.reel_link || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        category: 'Beds',
        image_url: '',
        reel_link: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 px-6 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-6 mb-12">
          <h1 className="text-4xl font-serif text-brand-brown">Product Management</h1>
          <div className="flex gap-4 flex-grow lg:flex-grow-0">
            <div className="relative flex-grow lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-white border border-brand-gold/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-gold outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => openModal()}
              className="bg-brand-brown text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-charcoal transition-colors flex items-center gap-2"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-xl border border-brand-gold/10 overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-brand-brown hover:text-brand-gold transition-colors shadow-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:text-red-700 transition-colors shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-brand-brown/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-1 line-clamp-1">{product.title}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-brand-gold font-bold">₹{product.price.toLocaleString()}</p>
                    <p className="text-xs font-bold text-brand-charcoal/40">Stock: {product.stock}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-charcoal/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-brand-gold/10 flex justify-between items-center">
                <h2 className="text-2xl font-serif text-brand-brown">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Product Title</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                      placeholder="Luxury Teak Bed"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Category</label>
                    <select
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Price (₹)</label>
                    <input
                      required
                      type="number"
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                      placeholder="45000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                      placeholder="10"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Description</label>
                  <textarea
                    required
                    className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none min-h-[100px]"
                    placeholder="Describe the product features, material, and dimensions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                      <ImageIcon size={14} /> Product Image
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex-grow bg-brand-cream border-2 border-dashed border-brand-gold/20 rounded-xl p-4 text-center cursor-pointer hover:border-brand-gold transition-colors"
                      >
                        {uploading ? 'Uploading...' : (formData.image_url ? 'Change Image' : 'Upload Image')}
                      </label>
                    </div>
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40 flex items-center gap-2">
                      <LinkIcon size={14} /> Instagram Reel Link (Optional)
                    </label>
                    <input
                      type="url"
                      className="w-full bg-brand-cream border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                      placeholder="https://instagram.com/reels/..."
                      value={formData.reel_link}
                      onChange={(e) => setFormData({ ...formData, reel_link: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'} <Package size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
