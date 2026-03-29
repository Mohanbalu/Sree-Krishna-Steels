import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Search, UserPlus, Trash2, Shield, Mail, UserCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'staff'>('staff');
  const { profile } = useAuthStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<{id: string, email: string} | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['super_admin', 'admin', 'staff'])
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAdmins(data || []);
        setLoading(false);
      } catch (error) {
        handleSupabaseError(error, 'fetchAdmins');
      }
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Database connection not initialized.');
      return;
    }
    if (!newAdminEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newAdminRole })
        .eq('email', newAdminEmail)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAdmins([data[0], ...admins.filter(a => a.email !== newAdminEmail)]);
        setIsAddingAdmin(false);
        setNewAdminEmail('');
        toast.success('Admin added successfully!');
      } else {
        toast.error('User with this email not found. They must sign up first.');
      }
    } catch (error: any) {
      toast.error('Failed to add admin: ' + (error.message || 'Unknown error'));
      console.error('Add Admin Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;
    
    if (adminToRemove.email === profile?.email) {
      toast.error('You cannot remove yourself.');
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'customer' })
        .eq('id', adminToRemove.id);

      if (error) throw error;
      setAdmins(admins.filter(a => a.id !== adminToRemove.id));
      toast.success('Admin removed successfully');
      setIsDeleteModalOpen(false);
      setAdminToRemove(null);
    } catch (error: any) {
      toast.error('Failed to remove admin: ' + (error.message || 'Unknown error'));
      console.error('Remove Admin Error:', error);
    }
  };

  const confirmRemove = (id: string, email: string) => {
    setAdminToRemove({ id, email });
    setIsDeleteModalOpen(true);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (profile?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Shield size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">Only Super Admins can access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-brand-brown mb-2">Admin Management</h1>
          <p className="text-gray-500">Manage your team and their access levels.</p>
        </div>
        <button 
          onClick={() => setIsAddingAdmin(true)}
          className="bg-brand-gold text-brand-brown px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-gold/90 transition-all shadow-lg shadow-brand-gold/20"
        >
          <UserPlus size={20} />
          Add New Admin
        </button>
      </div>

      {isAddingAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Team Member</h2>
          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input 
                type="email" 
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Role</label>
              <select 
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'staff')}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold transition-all"
              >
                <option value="staff">Staff (Orders/Products only)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 bg-brand-brown text-white py-3 rounded-xl font-bold hover:bg-brand-brown/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Member'
                )}
              </button>
              <button 
                type="button"
                disabled={submitting}
                onClick={() => setIsAddingAdmin(false)}
                className="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-gold transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-brown font-bold">
                      {admin.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{admin.name}</div>
                      <div className="text-xs text-gray-500">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                    admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    admin.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {admin.role === 'super_admin' ? <Shield size={12} /> : 
                     admin.role === 'admin' ? <UserCheck size={12} /> : null}
                    {admin.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {admin.role !== 'super_admin' && (
                    <button 
                      onClick={() => confirmRemove(admin.id, admin.email)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove Admin"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <h2 className="text-2xl font-serif text-brand-brown mb-4">Remove Admin?</h2>
            <p className="text-gray-500 mb-8">Are you sure you want to remove this admin? Their role will be reset to customer.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAdmin}
                className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
