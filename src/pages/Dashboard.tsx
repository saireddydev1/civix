import React, { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot, where, doc, updateDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../AuthContext';
import { User, Mail, Shield, Clock, CheckCircle2, AlertCircle, Building2, Truck, Zap, Droplets, GraduationCap, RefreshCw, Edit2, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DEPARTMENTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'issues'), where('reporterUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Dashboard snapshot error:", error);
    });
    return unsubscribe;
  }, [user]);

  const handleUpdateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIssue || !editFormData.title.trim() || !editFormData.description.trim()) return;

    setSavingEdit(true);
    try {
      await updateDoc(doc(db, 'issues', editingIssue.id), {
        title: editFormData.title.trim(),
        description: editFormData.description.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingIssue(null);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update issue. Please check your permissions.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRoleSwitch = async (role: string, deptId?: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role,
        departmentId: deptId || null
      });
      window.location.reload(); // Refresh to update profile context
    } catch (error) {
      console.error("Failed to switch role", error);
    } finally {
      setUpdating(false);
    }
  };

  const getDeptIcon = (id) => {
    switch(id) {
      case 'municipal': return <Building2 className="w-4 h-4" />;
      case 'transport': return <Truck className="w-4 h-4" />;
      case 'electricity': return <Zap className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'education': return <GraduationCap className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-50">
          <img 
            src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || 'User')}`} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
            alt={profile?.displayName || 'User'}
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-zinc-900">{profile?.displayName}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-zinc-500">
            <span className="flex items-center gap-1.5 text-sm">
              <Mail className="w-4 h-4" /> {profile?.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm capitalize">
              {getDeptIcon(profile?.departmentId)} 
              {profile?.role} {profile?.departmentId ? `(${profile.departmentId})` : ''}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 py-3 bg-zinc-50 rounded-2xl">
            <div className="text-2xl font-bold text-zinc-900">{myIssues.length}</div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Reports</div>
          </div>
          <div className="text-center px-6 py-3 bg-emerald-50 rounded-2xl">
            <div className="text-2xl font-bold text-emerald-600">{myIssues.filter(i => i.status === 'resolved').length}</div>
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Resolved</div>
          </div>
        </div>
      </div>

      {/* Demo Role Switcher */}
      <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 border-dashed">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Demo: Switch Login Role</h3>
            <p className="text-sm text-zinc-500">Test the platform as different department officials.</p>
          </div>
          {updating && <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => handleRoleSwitch('citizen')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              profile?.role === 'citizen' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            Citizen
          </button>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.id}
              onClick={() => handleRoleSwitch('official', dept.id)}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-2 ${
                profile?.departmentId === dept.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {getDeptIcon(dept.id)}
              <span className="truncate w-full">{dept.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-zinc-900">My Reported Issues</h2>
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {myIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-900">{issue.title}</div>
                    <div className="text-xs text-zinc-500">{issue.departmentId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      issue.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {issue.createdAt ? format(issue.createdAt.toDate(), 'MMM d, yyyy') : '...'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {issue.status === 'open' && (
                      <button 
                        onClick={() => {
                          setEditingIssue(issue);
                          setEditFormData({ title: issue.title, description: issue.description });
                        }}
                        className="p-2 hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600 rounded-lg transition-all"
                        title="Edit Issue"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {myIssues.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-400">
                    You haven't reported any issues yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Issue Modal */}
      <AnimatePresence>
        {editingIssue && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingIssue(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">Edit Issue</h3>
                <button 
                  onClick={() => setEditingIssue(null)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateIssue} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingIssue(null)}
                    className="flex-1 py-3 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit || !editFormData.title.trim() || !editFormData.description.trim()}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
