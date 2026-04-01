import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Search, UserPlus, Trash2, Shield, Mail, UserCheck, AlertTriangle, X, Filter, Calendar, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
    if (!adminToRemove || !adminToRemove.id || adminToRemove.id === 'undefined') {
      toast.error('Invalid Admin ID');
      return;
    }
    
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-brand-brown tracking-tight mb-2">Team Governance</h1>
          <p className="text-brand-brown/60 font-medium">Orchestrate your administrative hierarchy and access privileges.</p>
        </div>
        <button 
          onClick={() => setIsAddingAdmin(true)}
          className="bg-brand-brown text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-all duration-300 shadow-xl shadow-brand-brown/10 group active:scale-95"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Appoint New Member</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddingAdmin && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-10 rounded-[2.5rem] border border-brand-brown/10 shadow-2xl shadow-brand-brown/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-brand-brown">New Appointment</h2>
                <button 
                  onClick={() => setIsAddingAdmin(false)}
                  className="p-2 hover:bg-brand-brown/5 rounded-xl transition-colors text-brand-brown/40"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="client@collection.com"
                      className="w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/40 ml-1">Privilege Level</label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
                    <select 
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'staff')}
                      className="w-full pl-12 pr-4 py-4 bg-brand-cream/20 border border-brand-brown/5 rounded-2xl focus:ring-2 focus:ring-brand-gold/20 focus:bg-white transition-all outline-none text-sm font-medium appearance-none"
                    >
                      <option value="staff">Associate (Limited Access)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-brand-brown text-white py-4 rounded-2xl font-bold hover:bg-brand-gold active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-brown/10"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Confirm Appointment</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-brand-brown/5 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/20 group-focus-within:text-brand-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search the directory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-brand-brown/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-brown/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/30 border-b border-brand-brown/5">
                <th className="px-10 py-6 text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em]">Member</th>
                <th className="px-10 py-6 text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em]">Privilege</th>
                <th className="px-10 py-6 text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-brown/5">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-brand-cream/10 transition-colors group duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-brown font-serif text-xl border border-brand-brown/5 group-hover:bg-brand-gold group-hover:text-white transition-all duration-500">
                        {admin.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-serif text-lg text-brand-brown group-hover:text-brand-gold transition-colors duration-300">{admin.name}</div>
                        <div className="text-xs text-brand-brown/40 font-medium">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      admin.role === 'super_admin' ? 'bg-brand-brown text-white border-brand-brown' :
                      admin.role === 'admin' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' :
                      'bg-brand-cream text-brand-brown/60 border-brand-brown/10'
                    }`}>
                      {admin.role === 'super_admin' ? <Shield size={12} /> : 
                       admin.role === 'admin' ? <UserCheck size={12} /> : null}
                      {admin.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                      Active
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    {admin.role !== 'super_admin' && (
                      <button 
                        onClick={() => confirmRemove(admin.id, admin.email)}
                        className="p-3 text-brand-brown/20 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
                        title="Revoke Privileges"
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
