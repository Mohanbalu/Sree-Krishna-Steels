import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Link as LinkIcon, Package, Search, Upload, Filter, AlertTriangle, Eye, EyeOff, Pin } from 'lucide-react';
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
  is_pinned?: boolean;
  images?: string[];
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Beds',
    image_url: '',
    image_urls: [] as string[],
    reel_link: '',
    is_active: true,
    is_pinned: false,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [categories, setCategories] = useState(['Beds', 'Sofas', 'Dining Tables', 'Wardrobes', 'Office Furniture', 'Steel Almirahs']);

  const fetchProducts = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            image_url
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      
      if (data) {
        const uniqueCats = Array.from(new Set(data.map((p: any) => p.category)));
        setCategories(prev => Array.from(new Set([...prev, ...uniqueCats])));
      }
    } catch (error: any) {
      handleSupabaseError(error, 'fetchProducts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('products-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading('Uploading image...');
    
    try {
      const uploadFile = async (f: File) => {
        const fileExt = f.name.split('.').pop() || 'jpg';
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, f);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        setUploadProgress(100);
        return publicUrl;
      };

      const publicUrl = await uploadFile(file);

      setFormData(prev => {
        const newImageUrls = [...prev.image_urls, publicUrl];
        return { 
          ...prev, 
          image_urls: newImageUrls,
          image_url: prev.image_url || publicUrl
        };
      });

      toast.success('Image added!', { id: toastId });
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message, { id: toastId });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        // Robust CSV parsing (handles quotes and commas within quotes)
        const parseCSV = (str: string) => {
          const arr: string[][] = [];
          let quote = false;
          let row = 0, col = 0;
          for (let c = 0; c < str.length; c++) {
            const cc = str[c], nc = str[c+1];
            arr[row] = arr[row] || [];
            arr[row][col] = arr[row][col] || '';
            if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
            if (cc === '"') { quote = !quote; continue; }
            if (cc === ',' && !quote) { ++col; continue; }
            if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
            if (cc === '\n' && !quote) { ++row; col = 0; continue; }
            if (cc === '\r' && !quote) { ++row; col = 0; continue; }
            arr[row][col] += cc;
          }
          return arr;
        };

        const rows = parseCSV(text).slice(1); // Skip header
        
        const productsToInsert = rows.map(row => {
          const [title, description, price, stock, category, image_url, reel_link] = row;
          if (!title?.trim()) return null;
          return {
            title: title.trim(),
            description: description?.trim() || '',
            price: Number(price) || 0,
            stock: Number(stock) || 0,
            category: category?.trim() || 'Beds',
            image_url: image_url?.trim() || '',
            reel_link: reel_link?.trim() || '',
            is_active: true
          };
        }).filter((p): p is NonNullable<typeof p> => p !== null);

        if (productsToInsert.length === 0) {
          toast.error('No valid products found in CSV');
          return;
        }

        // Insert products
        const { data: insertedProducts, error } = await supabase
          .from('products')
          .insert(productsToInsert)
          .select();

        if (error) throw error;

        // Insert into product_images for each product
        const imageInserts = insertedProducts.map((p: any) => ({
          product_id: p.id,
          image_url: p.image_url
        })).filter((img: any) => img.image_url);

        if (imageInserts.length > 0) {
          const { error: imgError } = await supabase
            .from('product_images')
            .insert(imageInserts);
          if (imgError) throw imgError;
        }

        toast.success(`Successfully uploaded ${insertedProducts.length} products!`);
      } catch (error) {
        handleSupabaseError(error, 'bulkUpload');
      } finally {
        setSubmitting(false);
        // Reset input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ['title', 'description', 'price', 'stock', 'category', 'image_url', 'reel_link'];
    const sample = ['Luxury Teak Bed', 'Handcrafted teak wood bed with premium finish', '45000', '10', 'Beds', 'https://example.com/image.jpg', 'https://instagram.com/reels/...'];
    const csvContent = [headers, sample].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleStatus = async (product: Product) => {
    if (!product?.id || product.id === 'undefined') {
      console.error('Invalid product ID provided to toggleStatus:', product?.id);
      toast.error('Could not toggle status: Invalid Product ID');
      return;
    }

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

  const togglePin = async (product: Product) => {
    if (!product?.id || product.id === 'undefined') {
      console.error('Invalid product ID provided to togglePin:', product?.id);
      toast.error('Could not toggle pin: Invalid Product ID');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_pinned: !product.is_pinned })
        .eq('id', product.id);
      
      if (error) throw error;
      toast.success(`Product ${!product.is_pinned ? 'pinned' : 'unpinned'}`);
    } catch (error) {
      handleSupabaseError(error, 'togglePin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      toast.error('Database connection not initialized. Please check your environment variables.');
      return;
    }

    // Manual validation for better feedback in iframe
    if (!formData.title.trim()) {
      toast.error('Product title is required');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.image_url) {
      toast.error('Please upload a product image');
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: isAddingNewCategory ? newCategory : formData.category,
        image_url: formData.image_url,
        reel_link: formData.reel_link,
        is_active: formData.is_active,
        is_pinned: formData.is_pinned,
      };

      if (isAddingNewCategory && newCategory) {
        setCategories(prev => Array.from(new Set([...prev, newCategory])));
      }

      if (editingProduct) {
        if (!editingProduct.id || editingProduct.id === 'undefined') {
          throw new Error('Invalid product ID for editing');
        }

        const { data: updatedProduct, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single();
        
        if (error) throw error;

        // Update local state directly
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updatedProduct } : p));
        toast.success('Product updated successfully!');
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;

        // Update local state directly
        setProducts(prev => [newProduct, ...prev]);
        toast.success('Product added successfully!');
      }

      closeModal();
    } catch (error: any) {
      console.error('Save Product Error:', error);
      const errorMessage = error.message || error.details || 'Unknown error';
      toast.error(`Failed to save product: ${errorMessage}`);
      if (error.hint) console.info('Hint:', error.hint);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete || productToDelete === 'undefined') {
      console.error('Invalid product ID provided to handleDelete:', productToDelete);
      toast.error('Could not delete product: Invalid Product ID');
      setIsDeleteModalOpen(false);
      return;
    }

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
      toast.success('Product deleted successfully!');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      handleSupabaseError(error, 'deleteProduct');
    }
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openModal = async (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      
      // Images are already pre-fetched in fetchProducts
      const images = product.product_images?.map((img: any) => img.image_url) || [product.image_url];

      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image_url: product.image_url,
        image_urls: images,
        reel_link: product.reel_link || '',
        is_active: product.is_active ?? true,
        is_pinned: product.is_pinned ?? false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        category: categories[0] || 'Beds',
        image_url: '',
        image_urls: [],
        reel_link: '',
        is_active: true,
        is_pinned: false,
      });
    }
    setIsAddingNewCategory(false);
    setNewCategory('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           p.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchTerm, categoryFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-serif text-brand-brown tracking-tight">Inventory</h1>
          <p className="text-sm lg:text-base text-gray-500 font-medium">Manage your premium collection and stock levels.</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:gap-3 w-full lg:w-auto">
          <button
            onClick={downloadTemplate}
            className="flex-1 lg:flex-none bg-white text-brand-brown border border-brand-brown/10 px-4 lg:px-6 py-3 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-cream transition-all shadow-sm"
          >
            <ImageIcon size={16} className="opacity-60" />
            <span className="text-[10px] lg:text-xs uppercase tracking-widest">Template</span>
          </button>
          <div className="flex-1 lg:flex-none relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="hidden"
              id="bulk-upload"
              disabled={submitting}
            />
            <label
              htmlFor="bulk-upload"
              className={`w-full bg-white text-brand-brown border border-brand-brown/10 px-4 lg:px-6 py-3 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-cream transition-all cursor-pointer shadow-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload size={16} className="opacity-60" /> 
              <span className="text-[10px] lg:text-xs uppercase tracking-widest">{submitting ? 'Processing...' : 'Bulk Import'}</span>
            </label>
          </div>
          <button
            onClick={() => openModal()}
            disabled={submitting}
            className="w-full lg:w-auto bg-brand-brown text-white px-6 lg:px-8 py-3 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-charcoal transition-all shadow-xl shadow-brand-brown/20 disabled:opacity-50"
          >
            <Plus size={18} />
            <span className="text-[10px] lg:text-xs uppercase tracking-widest">Add Product</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 lg:gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl lg:rounded-[2rem] border border-brand-brown/5 shadow-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 text-brand-brown/30" size={18} lg:size={20} />
          <input
            type="text"
            placeholder="Search by title or category..."
            className="w-full pl-12 lg:pl-14 pr-4 lg:pr-6 py-3 lg:py-4 bg-transparent border-none rounded-xl lg:rounded-2xl focus:ring-0 text-brand-brown text-sm lg:text-base font-medium placeholder:text-brand-brown/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl lg:rounded-[1.5rem] px-4 lg:px-6 py-2 border border-brand-brown/5 shadow-sm min-w-full md:min-w-[200px]">
          <Filter size={16} className="text-brand-brown/40" />
          <select
            className="bg-transparent border-none focus:ring-0 text-[10px] lg:text-sm font-bold text-brand-brown outline-none w-full cursor-pointer uppercase tracking-widest"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-brand-cream/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Search size={32} className="text-brand-brown/20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-brand-brown">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters, or add a new product.</p>
              </div>
              <button 
                onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
                className="text-brand-gold font-bold uppercase tracking-widest text-xs hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredProducts.slice(0, displayLimit).map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-white rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-brand-brown/5 overflow-hidden hover:shadow-2xl hover:shadow-brand-brown/10 transition-all duration-500"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${!product.is_active ? 'grayscale opacity-40' : ''}`}
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-3 lg:top-4 right-3 lg:right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                  <button
                    onClick={() => openModal(product)}
                    className="p-2.5 lg:p-3 bg-white/90 backdrop-blur-md rounded-xl lg:rounded-2xl text-brand-brown hover:bg-brand-gold hover:text-white transition-all shadow-xl"
                  >
                    <Edit2 size={16} lg:size={18} />
                  </button>
                  <button
                    onClick={() => togglePin(product)}
                    className={`p-2.5 lg:p-3 bg-white/90 backdrop-blur-md rounded-xl lg:rounded-2xl transition-all shadow-xl ${product.is_pinned ? 'text-brand-gold' : 'text-gray-400'}`}
                    title={product.is_pinned ? 'Unpin' : 'Pin to Top'}
                  >
                    <Pin size={16} lg:size={18} fill={product.is_pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => toggleStatus(product)}
                    className={`p-2.5 lg:p-3 bg-white/90 backdrop-blur-md rounded-xl lg:rounded-2xl transition-all shadow-xl ${product.is_active ? 'text-green-600' : 'text-gray-400'}`}
                    title={product.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {product.is_active ? <Eye size={16} lg:size={18} /> : <EyeOff size={16} lg:size={18} />}
                  </button>
                  <button
                    onClick={() => confirmDelete(product.id)}
                    className="p-2.5 lg:p-3 bg-white/90 backdrop-blur-md rounded-xl lg:rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  >
                    <Trash2 size={16} lg:size={18} />
                  </button>
                </div>

                <div className="absolute bottom-3 lg:bottom-4 left-3 lg:left-4 flex flex-wrap gap-1.5 lg:gap-2">
                  <span className="bg-white/90 backdrop-blur-md text-brand-brown px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.2em]">
                    {product.category}
                  </span>
                  {product.stock < 5 && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <AlertTriangle size={10} lg:size={12} /> Low Stock
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-5 lg:p-6 space-y-2 lg:space-y-3">
                <div className="flex justify-between items-start gap-3 lg:gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-serif text-lg lg:text-xl text-brand-brown truncate leading-tight">{product.title}</h3>
                    {product.is_pinned && <Pin size={14} className="text-brand-gold fill-brand-gold shrink-0" />}
                  </div>
                  <div className="text-right">
                    <p className="text-brand-gold font-bold text-base lg:text-lg whitespace-nowrap">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-brand-brown/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className={`text-[8px] lg:text-[10px] font-bold uppercase tracking-widest ${product.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>
                    Stock: <span className="text-brand-brown">{product.stock}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )))}
        </AnimatePresence>
      </div>

      {filteredProducts.length > displayLimit && (
        <div className="flex justify-center pt-10">
          <button 
            onClick={() => setDisplayLimit(prev => prev + 12)}
            className="px-8 py-3 bg-white border border-brand-brown/10 rounded-2xl font-bold text-brand-brown hover:bg-brand-cream transition-all shadow-sm uppercase tracking-widest text-xs"
          >
            Load More Products
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-brand-charcoal/60 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] max-w-3xl sm:rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-brand-brown/5 flex flex-col"
          >
            <div className="px-5 sm:px-8 lg:px-10 py-5 sm:py-6 lg:py-8 border-b border-brand-brown/5 flex justify-between items-center bg-brand-cream/30 shrink-0">
              <div className="space-y-0.5 sm:space-y-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-brand-brown leading-tight">
                  {editingProduct ? 'Refine Product' : 'New Collection Item'}
                </h2>
                <p className="text-[8px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-brand-brown/40">
                  {editingProduct ? 'Update existing inventory details' : 'Add a new piece to your catalog'}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 sm:p-3 hover:bg-brand-brown/5 rounded-xl lg:rounded-2xl transition-all text-brand-brown/40 hover:text-brand-brown">
                <X size={18} sm:size={20} lg:size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
              <div className="p-5 sm:p-8 lg:p-10 space-y-6 lg:space-y-8 overflow-y-auto flex-grow custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8">
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 ml-1">Title</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-brown text-sm font-medium transition-all"
                      placeholder="e.g. Royal Teak Bed"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 ml-1">Category</label>
                    <div className="space-y-2">
                      <select
                        className="w-full bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-brown text-sm font-bold transition-all cursor-pointer"
                        value={isAddingNewCategory ? 'new' : formData.category}
                        onChange={(e) => {
                          if (e.target.value === 'new') {
                            setIsAddingNewCategory(true);
                          } else {
                            setIsAddingNewCategory(false);
                            setFormData({ ...formData, category: e.target.value });
                          }
                        }}
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="new">+ Add New Category</option>
                      </select>
                      {isAddingNewCategory && (
                        <motion.input
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          type="text"
                          className="w-full bg-brand-cream/20 border border-brand-gold/30 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-brown text-sm font-medium transition-all"
                          placeholder="Enter new category name"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 ml-1">Price (₹)</label>
                    <input
                      required
                      type="number"
                      className="w-full bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-brown text-sm font-bold transition-all"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 ml-1">Initial Stock</label>
                    <input
                      required
                      type="number"
                      className="w-full bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-brown text-sm font-bold transition-all"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 ml-1">Description</label>
                  <textarea
                    required
                    className="w-full bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-brown text-sm font-medium min-h-[100px] lg:min-h-[120px] transition-all resize-none"
                    placeholder="Crafted with precision..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 ml-1 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ImageIcon size={12} /> Product Gallery
                      </span>
                      <span className="text-[8px] text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded-full border border-brand-gold/10">
                        Auto-Optimized
                      </span>
                    </label>
                    {uploading && (
                      <div className="w-full h-1 bg-brand-brown/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-brand-gold"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.image_urls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-brand-brown/10 group bg-brand-cream/10">
                        <img 
                          src={url} 
                          alt={`Product ${index + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image_url: url }))}
                            className={`p-2 rounded-xl transition-all ${formData.image_url === url ? 'bg-brand-gold text-white' : 'bg-white/90 text-brand-brown hover:bg-brand-gold hover:text-white'}`}
                            title="Set as main image"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => {
                              const newUrls = prev.image_urls.filter((_, i) => i !== index);
                              return {
                                ...prev,
                                image_urls: newUrls,
                                image_url: prev.image_url === url ? (newUrls[0] || '') : prev.image_url
                              };
                            })}
                            className="p-2 bg-white/90 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Remove image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {formData.image_url === url && (
                          <div className="absolute top-2 left-2 bg-brand-gold text-white text-[8px] font-bold uppercase px-2 py-1 rounded-full shadow-lg">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <label className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-brand-gold hover:bg-brand-gold/5 ${uploading ? 'opacity-50 cursor-not-allowed' : 'border-brand-brown/10'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-gold border-t-transparent" />
                      ) : (
                        <>
                          <Plus size={24} className="text-brand-brown/30" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40">Add Images</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 ml-1 flex items-center gap-2">
                      <LinkIcon size={12} /> Social Media (Reel)
                    </label>
                    <input
                      type="url"
                      className="w-full bg-brand-cream/20 border border-brand-brown/5 rounded-xl lg:rounded-2xl px-4 lg:px-5 py-3 lg:py-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-brown text-sm font-medium transition-all"
                      placeholder="https://instagram.com/reels/..."
                      value={formData.reel_link}
                      onChange={(e) => setFormData({ ...formData, reel_link: e.target.value })}
                    />
                    <p className="text-[9px] lg:text-[10px] text-brand-brown/30 italic px-1">Optional: Link to a video showcase</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex items-center gap-4 p-4 lg:p-6 bg-brand-cream/20 rounded-xl lg:rounded-[1.5rem] border border-brand-brown/5">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="peer w-5 h-5 lg:w-6 lg:h-6 rounded-lg border-brand-brown/10 text-brand-gold focus:ring-brand-gold transition-all cursor-pointer"
                      />
                    </div>
                    <label htmlFor="is_active" className="text-xs lg:text-sm font-bold text-brand-brown/80 cursor-pointer select-none">
                      Publish to Storefront
                      <span className="block text-[8px] lg:text-[10px] font-medium text-brand-brown/40 uppercase tracking-widest mt-0.5">Visible to all customers</span>
                    </label>
                  </div>

                  <div className={`flex-1 flex items-center gap-4 p-4 lg:p-6 rounded-xl lg:rounded-[1.5rem] border transition-all ${formData.is_pinned ? 'bg-brand-gold/10 border-brand-gold/30' : 'bg-brand-cream/20 border-brand-brown/5'}`}>
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        id="is_pinned"
                        checked={formData.is_pinned}
                        onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                        className="peer w-5 h-5 lg:w-6 lg:h-6 rounded-lg border-brand-brown/10 text-brand-gold focus:ring-brand-gold transition-all cursor-pointer"
                      />
                    </div>
                    <label htmlFor="is_pinned" className="flex items-center gap-2 text-xs lg:text-sm font-bold text-brand-brown/80 cursor-pointer select-none">
                      <Pin size={14} className={formData.is_pinned ? 'text-brand-gold' : 'text-brand-brown/40'} />
                      Pin to Top
                      <span className="block text-[8px] lg:text-[10px] font-medium text-brand-brown/40 uppercase tracking-widest mt-0.5">Show at the beginning of list</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8 lg:p-10 border-t border-brand-brown/5 bg-brand-cream/10 shrink-0">
                <button
                  type="submit"
                  disabled={uploading || submitting}
                  className={`w-full bg-brand-brown text-white py-3.5 sm:py-4 lg:py-5 rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:bg-brand-charcoal active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-brand-brown/30 ${submitting || uploading ? 'animate-pulse' : ''}`}
                >
                  {submitting || uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-2 border-white/30 border-t-white"></div>
                      <span className="tracking-widest uppercase text-xs lg:text-sm">
                        {uploading ? 'Uploading...' : 'Saving Product...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="tracking-widest uppercase text-xs lg:text-sm">{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                      <Package size={18} lg:size={20} className="opacity-60" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-charcoal/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl lg:rounded-[2rem] p-6 lg:p-8 shadow-2xl text-center"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <AlertTriangle size={32} lg:size={40} className="text-red-500" />
            </div>
            <h2 className="text-xl lg:text-2xl font-serif text-brand-brown mb-2 lg:mb-4">Delete Product?</h2>
            <p className="text-sm lg:text-base text-gray-500 mb-6 lg:mb-8">This action cannot be undone. All product data and images will be permanently removed.</p>
            <div className="flex gap-3 lg:gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 lg:px-6 py-3 lg:py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-xs lg:text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 lg:px-6 py-3 lg:py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-xs lg:text-sm uppercase tracking-widest"
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
