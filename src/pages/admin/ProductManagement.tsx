import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Link as LinkIcon, Package, Search, Upload, Filter, AlertTriangle, Eye, EyeOff } from 'lucide-react';
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
  is_active?: boolean;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Beds',
    image_url: '',
    reel_link: '',
    is_active: true,
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

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1); // Skip header
      
      const newProducts = rows.map(row => {
        const [title, description, price, stock, category, image_url] = row.split(',');
        return {
          title: title?.trim(),
          description: description?.trim(),
          price: Number(price),
          stock: Number(stock),
          category: category?.trim(),
          image_url: image_url?.trim(),
          is_active: true
        };
      }).filter(p => p.title);

      if (newProducts.length === 0) {
        toast.error('No valid products found in CSV');
        return;
      }

      try {
        const { error } = await supabase.from('products').insert(newProducts);
        if (error) throw error;
        toast.success(`Successfully uploaded ${newProducts.length} products!`);
      } catch (error) {
        handleSupabaseError(error, 'bulkUpload');
      }
    };
    reader.readAsText(file);
  };

  const toggleStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      
      if (error) throw error;
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      handleSupabaseError(error, 'toggleStatus');
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
        is_active: formData.is_active,
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
        is_active: product.is_active ?? true,
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
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Product Management</h1>
          <p className="text-gray-500">Manage your inventory, prices, and product visibility.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="hidden"
              id="bulk-upload"
            />
            <label
              htmlFor="bulk-upload"
              className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Upload size={20} /> Bulk Upload
            </label>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-brand-gold text-brand-brown px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
          <Filter size={18} className="text-gray-400" />
          <select
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${!product.is_active ? 'grayscale opacity-50' : ''}`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={() => openModal(product)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-brand-brown hover:text-brand-gold transition-colors shadow-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => toggleStatus(product)}
                    className={`p-2 bg-white/90 backdrop-blur-sm rounded-xl transition-colors shadow-lg ${product.is_active ? 'text-green-600' : 'text-gray-400'}`}
                    title={product.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 hover:text-red-700 transition-colors shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                  <span className="bg-brand-brown/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {product.category}
                  </span>
                  {product.stock < 5 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <AlertTriangle size={10} /> Low Stock
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-brand-gold font-bold">₹{product.price.toLocaleString()}</p>
                  <p className={`text-xs font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>
                    Stock: {product.stock}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-charcoal/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-brand-brown">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Title</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="Luxury Teak Bed"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Price (₹)</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="45000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Stock Quantity</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Description</label>
                <textarea
                  required
                  className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none min-h-[100px]"
                  placeholder="Describe the product features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
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
                      className="flex-grow bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand-gold transition-colors"
                    >
                      {uploading ? 'Uploading...' : (formData.image_url ? 'Change Image' : 'Upload Image')}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <LinkIcon size={14} /> Instagram Reel Link
                  </label>
                  <input
                    type="url"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    placeholder="https://instagram.com/reels/..."
                    value={formData.reel_link}
                    onChange={(e) => setFormData({ ...formData, reel_link: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Product is active and visible to customers</label>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-brand-brown/20"
              >
                {editingProduct ? 'Update Product' : 'Add Product'} <Package size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
