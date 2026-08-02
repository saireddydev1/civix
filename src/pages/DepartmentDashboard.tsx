import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, collection, query, onSnapshot, where, updateDoc, doc, serverTimestamp } from '../firebase';
import { useAuth } from '../AuthContext';
import { Building2, CheckCircle2, Clock, AlertCircle, Image as ImageIcon, Loader2, Truck, Zap, Droplets, GraduationCap, HeartPulse, Camera, Sparkles, ShieldCheck, Upload, MapPin, X, FileText, ShieldAlert, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BeforeAfterComparison from '../components/BeforeAfterComparison';
import { compressAndConvertToDataUrl, getValidImageUrl, DEFAULT_CIVIC_IMAGE } from '../utils/imageUtils';
import { openGoogleMapsNavigation, formatLocationText } from '../utils/locationUtils';

const OFFICIAL_EMAILS = [
  'municipal@civix.gov.in',
  'transport@civix.gov.in',
  'electricity@civix.gov.in',
  'water@civix.gov.in',
  'education@civix.gov.in',
  'health@civix.gov.in',
  'admin@civix.gov.in'
];

export default function DepartmentDashboard() {
  const { profile } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

  // Official Resolution Modal state
  const [resolvingIssue, setResolvingIssue] = useState<any | null>(null);
  const [repairPhotoUrl, setRepairPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=800&auto=format&fit=crop');
  const [officialNotes, setOfficialNotes] = useState<string>('');
  const [repairAddress, setRepairAddress] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

  const getDeptIcon = (id: string | undefined) => {
    switch(id) {
      case 'municipal': return <Building2 className="text-emerald-400 w-7 h-7" />;
      case 'transport': return <Truck className="text-cyan-400 w-7 h-7" />;
      case 'electricity': return <Zap className="text-amber-400 w-7 h-7" />;
      case 'water': return <Droplets className="text-blue-400 w-7 h-7" />;
      case 'education': return <GraduationCap className="text-purple-400 w-7 h-7" />;
      case 'health': return <HeartPulse className="text-rose-400 w-7 h-7" />;
      default: return <Building2 className="text-emerald-400 w-7 h-7" />;
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

  const openResolutionModal = (issue: any) => {
    setResolvingIssue(issue);
    setOfficialNotes(`Inspected site with official ${profile?.departmentId || 'municipal'} field crew. Problem resurfaced and quality verified according to government standards.`);
    setRepairAddress(issue.location?.address || 'Uppal Main Road, Sector 4, Hyderabad');
    setRepairPhotoUrl(issue.resolutionPhotoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=800&auto=format&fit=crop');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingPhoto(true);
      try {
        const dataUrl = await compressAndConvertToDataUrl(file);
        setRepairPhotoUrl(dataUrl);
      } catch (err) {
        console.error("Failed to process resolution photo:", err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const submitResolution = async () => {
    if (!resolvingIssue) return;
    setUpdating(resolvingIssue.id);
    try {
      await updateDoc(doc(db, 'issues', resolvingIssue.id), {
        status: 'resolved',
        updatedAt: serverTimestamp(),
        resolvedAt: serverTimestamp(),
        resolutionPhotoUrl: repairPhotoUrl,
        resolvedByOfficialName: profile?.displayName || 'Er. K. Rajeshwar Rao (Field Engineer)',
        officialNotes: officialNotes || 'Site inspected and verified by department supervisor.',
        'location.address': repairAddress
      });
      setResolvingIssue(null);
    } catch (error) {
      console.error("Failed to submit resolution", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    setUpdating(issueId);
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'issues', issueId), updateData);
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(null);
    }
  };

  const isAuthorized = (profile?.role === 'official' || profile?.role === 'admin');

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 text-center space-y-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-3xl flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Access Restricted — Official Authentication Required</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg mx-auto">
              The Department Hub is restricted to verified department officials and central administrators. Please log in with official department credentials to access work queues.
            </p>
          </div>

          {/* Pre-Configured Official Portals List */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
              🔑 Designated Official Portals
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Municipal Admin</span>
                <span className="font-mono text-emerald-400 text-[11px]">municipal@civix.gov.in</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Road Transport</span>
                <span className="font-mono text-cyan-400 text-[11px]">transport@civix.gov.in</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Electricity Board</span>
                <span className="font-mono text-amber-400 text-[11px]">electricity@civix.gov.in</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Water Works</span>
                <span className="font-mono text-blue-400 text-[11px]">water@civix.gov.in</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <KeyRound className="w-4 h-4" />
              Go to 1-Click Official Login
            </Link>
            <Link
              to="/feed"
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center"
            >
              Return to Civic Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingIssues = issues.filter(i => i.status !== 'resolved');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-xl">
            {getDeptIcon(profile?.departmentId)}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {profile?.role === 'admin' ? 'Central Admin Hub' : 'Department Hub'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage and resolve civic complaints with side-by-side Before & After verification.</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl self-start">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Active Tasks ({pendingIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved Before & After ({resolvedIssues.length})
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 gap-6">
          {pendingIssues.map((issue: any) => (
            <div key={issue.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
              <div className="w-full md:w-52 aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 relative">
                <img 
                  src={getValidImageUrl(issue.photoUrl, DEFAULT_CIVIC_IMAGE)} 
                  alt={issue.title}
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_CIVIC_IMAGE;
                  }}
                />
                <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                  🔴 PROBLEM
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{issue.title}</h3>
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {issue.category}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{issue.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> Reported recently</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold"><AlertCircle className="w-3.5 h-3.5" /> Priority: High</span>
                  <button
                    type="button"
                    onClick={() => openGoogleMapsNavigation(issue.location)}
                    title="Click to open Navigation in Google Maps"
                    className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:underline cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{formatLocationText(issue.location)}</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1 rounded font-mono">Navigate ↗</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
                <button
                  disabled={updating === issue.id}
                  onClick={() => handleStatusChange(issue.id, 'in-progress')}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                    issue.status === 'in-progress' 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {updating === issue.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mark In-Progress'}
                </button>
                <button
                  disabled={updating === issue.id}
                  onClick={() => openResolutionModal(issue)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Resolve Issue (Upload Proof)
                </button>
              </div>
            </div>
          ))}

          {pendingIssues.length === 0 && (
            <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">All Clear!</h3>
              <p className="text-slate-400 text-sm">No pending active tasks for your department.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resolvedIssues.map((issue: any) => (
            <div key={issue.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase">
                  Resolved
                </span>
              </div>
              <p className="text-xs text-slate-400">{issue.description}</p>
              
              {/* Side-by-Side BEFORE & AFTER */}
              <BeforeAfterComparison issue={issue} />
            </div>
          ))}

          {resolvedIssues.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Resolved Records Yet</h3>
              <p className="text-slate-400 text-sm">Resolved complaints will show side-by-side Before & After photos here.</p>
            </div>
          )}
        </div>
      )}

      {/* Official Resolution Modal */}
      <AnimatePresence>
        {resolvingIssue && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl space-y-0"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold">Official Resolution Workflow</h3>
                    <p className="text-xs text-slate-400">Upload repair proof and issue official remarks</p>
                  </div>
                </div>
                <button onClick={() => setResolvingIssue(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Issue Summary */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    Target Complaint
                  </span>
                  <h4 className="text-sm font-extrabold text-white">{resolvingIssue.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{resolvingIssue.description}</p>
                </div>

                {/* Upload Repair Photo (Proof) */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    Upload Repair Photo (Proof)
                  </label>
                  
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center group cursor-pointer hover:border-emerald-500/50 transition-colors">
                    {repairPhotoUrl ? (
                      <>
                        <img src={repairPhotoUrl} alt="Repair Proof" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer hover:bg-emerald-400 transition-colors">
                            Change Photo
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                        <span className="text-xs font-bold text-slate-400">Click to upload completion photo</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Official Reply & Remarks */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Official Reply & Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={officialNotes}
                    onChange={(e) => setOfficialNotes(e.target.value)}
                    placeholder="e.g. Pothole resurfaced with asphalt by GHMC road maintenance team..."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Repair Site Location */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Repair Site Location Address
                  </label>
                  <input
                    type="text"
                    value={repairAddress}
                    onChange={(e) => setRepairAddress(e.target.value)}
                    placeholder="e.g. Uppal Main Road, Sector 4, Hyderabad"
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setResolvingIssue(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={updating === resolvingIssue.id}
                  onClick={submitResolution}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {updating === resolvingIssue.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm & Publish Resolution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
