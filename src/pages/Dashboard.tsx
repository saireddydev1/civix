import React, { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot, where, doc, updateDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../AuthContext';
import { User, Mail, Shield, Clock, CheckCircle2, AlertCircle, Building2, Truck, Zap, Droplets, GraduationCap, RefreshCw, Edit2, X, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { DEPARTMENTS } from '../constants';
import { seedDemoData } from '../utils/seedData';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { user, profile, setProfile } = useAuth();
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [seeding, setSeeding] = useState(false);
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

  const handleSeedData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedDemoData(user.uid, profile?.displayName || 'Demo User');
      alert("Sample civic issues successfully seeded! Check your Feed and City Map.");
    } catch (error) {
      console.error("Seeding failed:", error);
      alert("Could not seed data. Please check Firestore security rules.");
    } finally {
      setSeeding(false);
    }
  };

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
      setProfile((prev: any) => ({ ...prev, role, departmentId: deptId || null }));
    } catch (error) {
      console.error("Failed to switch role", error);
    } finally {
      setUpdating(false);
    }
  };

  const getDeptIcon = (id: any) => {
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
      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-8 text-slate-100">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-xl">
          <img 
            src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || 'User')}`} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
            alt={profile?.displayName || 'User'}
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white">{profile?.displayName}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-slate-400">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <Mail className="w-4 h-4 text-emerald-400" /> {profile?.email}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold capitalize text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {getDeptIcon(profile?.departmentId)} 
              {profile?.role} {profile?.departmentId ? `(${profile.departmentId})` : ''}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            title="Seed sample complaints for presentation"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
            <span>Seed Demo Issues</span>
          </button>
          <div className="text-center px-5 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <div className="text-xl font-extrabold text-white">{myIssues.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports</div>
          </div>
          <div className="text-center px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <div className="text-xl font-extrabold text-emerald-400">{myIssues.filter(i => i.status === 'resolved').length}</div>
            <div className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">Resolved</div>
          </div>
        </div>
      </div>

      {/* Citizen XP & Level Progress Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/50 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-lg shadow-amber-500/10">
            L4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">Civic Guardian Rank</h3>
              <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Level 4</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">380 Karma Points earned • 120 XP needed to unlock Level 5 Master Status</p>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-xs font-extrabold">
            <span className="text-slate-400">Level 4 Progress</span>
            <span className="text-emerald-400 font-mono">380 / 500 XP (76%)</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "76%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_12px_#10b981]"
            />
          </div>
        </div>
      </div>

      {/* Demo Role Switcher */}
      <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 border-dashed backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Demo: Switch Active Role</h3>
            <p className="text-xs text-slate-400 mt-0.5">Test the platform as different department officials.</p>
          </div>
          {updating && <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => handleRoleSwitch('citizen')}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
              profile?.role === 'citizen' ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            Citizen
          </button>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.id}
              onClick={() => handleRoleSwitch('official', dept.id)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-2 ${
                profile?.departmentId === dept.id ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {getDeptIcon(dept.id)}
              <span className="truncate w-full">{dept.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">My Reported Issues</h2>
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {myIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-sm">{issue.title}</div>
                    <div className="text-xs text-slate-400">{issue.departmentId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      issue.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      issue.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {issue.createdAt ? format(issue.createdAt.toDate(), 'MMM d, yyyy') : '...'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {issue.status === 'open' && (
                      <button 
                        onClick={() => {
                          setEditingIssue(issue);
                          setEditFormData({ title: issue.title, description: issue.description });
                        }}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-all"
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
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-xs">
                    You haven't reported any issues yet. Click "Seed Demo Issues" above to populate sample reports.
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
