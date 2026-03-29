import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Search, UserPlus, Trash2, Shield, Mail, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../../store/authStore';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'staff'>('staff');
  const { profile } = useAuthStore();

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
    try {
      // In a real app, we would use a Supabase Edge Function to invite the user
      // and set their role. For now, we'll try to find an existing user by email
      // and update their role.
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
      } else {
        alert('User with this email not found. They must sign up first.');
      }
    } catch (error) {
      handleSupabaseError(error, 'handleAddAdmin');
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
    if (email === profile?.email) {
      alert('You cannot remove yourself.');
      return;
    }

    if (!confirm('Are you sure you want to remove this admin? Their role will be reset to customer.')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'customer' })
        .eq('id', id);

      if (error) throw error;
      setAdmins(admins.filter(a => a.id !== id));
    } catch (error) {
      handleSupabaseError(error, 'handleRemoveAdmin');
    }
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
                className="flex-1 bg-brand-brown text-white py-3 rounded-xl font-bold hover:bg-brand-brown/90 transition-all"
              >
                Add Member
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingAdmin(false)}
                className="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
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
                      onClick={() => handleRemoveAdmin(admin.id, admin.email)}
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
    </div>
  );
}
