import { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot, where, updateDoc, doc, serverTimestamp } from '../firebase';
import { useAuth } from '../AuthContext';
import { Building2, CheckCircle2, Clock, AlertCircle, Image as ImageIcon, Loader2, Truck, Zap, Droplets, GraduationCap, HeartPulse, Camera } from 'lucide-react';

export default function DepartmentDashboard() {
  const { profile } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const getDeptIcon = (id: string | undefined) => {
    switch(id) {
      case 'municipal': return <Building2 className="text-white w-7 h-7" />;
      case 'transport': return <Truck className="text-white w-7 h-7" />;
      case 'electricity': return <Zap className="text-white w-7 h-7" />;
      case 'water': return <Droplets className="text-white w-7 h-7" />;
      case 'education': return <GraduationCap className="text-white w-7 h-7" />;
      case 'health': return <HeartPulse className="text-white w-7 h-7" />;
      default: return <Building2 className="text-white w-7 h-7" />;
    }
  };

  useEffect(() => {
    if (!profile) return;
    
    let q;
    if (profile.role === 'admin') {
      q = query(collection(db, 'issues'));
    } else {
      q = query(collection(db, 'issues'), where('departmentId', '==', profile.departmentId || 'municipal'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Dept snapshot error:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, [profile]);

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdating(issueId);
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        resolutionPhotoUrl: newStatus === 'resolved' ? 'https://picsum.photos/seed/resolved/800/600' : null
      });
    } catch (error) {
      console.error("Failed to update status", error);
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        operation: 'updateDoc',
        path: `issues/${issueId}`,
        auth: {
          uid: profile?.uid,
          role: profile?.role
        }
      };
      console.error('Firestore Error Details:', JSON.stringify(errInfo));
    } finally {
      setUpdating(null);
    }
  };

  if (profile?.role !== 'official' && profile?.role !== 'admin') {
    return <div className="text-center py-20">Access Denied. Only officials can view this dashboard.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
          {getDeptIcon(profile?.departmentId)}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {profile?.role === 'admin' ? 'Central Admin Dashboard' : 'Department Dashboard'}
          </h1>
          <p className="text-zinc-500 mt-1">Manage and resolve civic complaints assigned to your department.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {issues.filter(i => i.status !== 'resolved').map((issue) => (
          <div key={issue.id} className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center">
              {issue.photoUrl ? (
                <img src={issue.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="text-zinc-300">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">{issue.title}</h3>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{issue.category}</span>
              </div>
              <p className="text-zinc-500 text-sm">{issue.description}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Reported 2h ago</span>
                <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Priority: High</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                disabled={updating === issue.id}
                onClick={() => handleStatusChange(issue.id, 'in-progress')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  issue.status === 'in-progress' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {updating === issue.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mark In-Progress'}
              </button>
              <button
                disabled={updating === issue.id}
                onClick={() => handleStatusChange(issue.id, 'resolved')}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {updating === issue.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Resolve Issue
              </button>
            </div>
          </div>
        ))}

        {issues.filter(i => i.status !== 'resolved').length === 0 && (
          <div className="text-center py-20 bg-emerald-50 rounded-3xl border border-emerald-100">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-emerald-900">All clear!</h3>
            <p className="text-emerald-600">No pending issues for your department.</p>
          </div>
        )}
      </div>
    </div>
  );
}
