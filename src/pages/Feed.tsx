import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, query, onSnapshot, auth, googleProvider, signInWithPopup, doc, updateDoc, increment, setDoc, deleteDoc, getDoc, addDoc, serverTimestamp, writeBatch } from '../firebase';
import { MapPin, Clock, CheckCircle2, AlertCircle, MessageSquare, ThumbsUp, Sparkles, BarChart3, Bot, Send, X, Camera, User, Loader2, Edit2, Building2, PhoneCall } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { GHMC_ZONES } from '../constants';

import BeforeAfterComparison from '../components/BeforeAfterComparison';
import { getValidImageUrl, DEFAULT_CIVIC_IMAGE } from '../utils/imageUtils';

export default function Feed() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [selectedZone, setSelectedZone] = useState('all');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'issues'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssues(data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    }, (error) => {
      console.error("Feed snapshot error:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  // Track user likes
  useEffect(() => {
    if (!user || issues.length === 0) return;

    // This is a bit inefficient for large feeds, but for now we'll check each issue
    // In a real app, you'd fetch this in bulk or use a different strategy
    const unsubscribes = issues.map(issue => {
      return onSnapshot(doc(db, `issues/${issue.id}/likes`, user.uid), (doc) => {
        setUserLikes(prev => ({ ...prev, [issue.id]: doc.exists() }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, issues.length]);

  // Fetch comments when active
  useEffect(() => {
    if (!activeComments) {
      setComments([]);
      return;
    }

    const q = query(collection(db, `issues/${activeComments}/comments`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    return unsubscribe;
  }, [activeComments]);

  const handleLike = async (issueId: string) => {
    if (!user) return;

    const isLiked = userLikes[issueId];
    const batch = writeBatch(db);
    const likeRef = doc(db, `issues/${issueId}/likes`, user.uid);
    const issueRef = doc(db, 'issues', issueId);

    try {
      if (isLiked) {
        batch.delete(likeRef);
        batch.update(issueRef, { likesCount: increment(-1) });
      } else {
        batch.set(likeRef, { createdAt: serverTimestamp() });
        batch.update(issueRef, { likesCount: increment(1) });
      }
      await batch.commit();
    } catch (error) {
      console.error("Like failed", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !newComment.trim() || !activeComments) return;

    setSubmittingComment(true);
    const batch = writeBatch(db);
    const commentRef = doc(collection(db, `issues/${activeComments}/comments`));
    const issueRef = doc(db, 'issues', activeComments);

    try {
      batch.set(commentRef, {
        text: newComment.trim(),
        authorUid: user.uid,
        authorName: profile.displayName,
        authorPhotoUrl: profile.photoUrl || null,
        createdAt: serverTimestamp()
      });
      batch.update(issueRef, { commentsCount: increment(1) });
      await batch.commit();
      setNewComment('');
    } catch (error) {
      console.error("Comment failed", error);
    } finally {
      setSubmittingComment(false);
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

  const filteredIssues = issues.filter(issue => {
    if (filter !== 'all' && issue.status !== filter) return false;
    if (selectedZone !== 'all') {
      const zone = GHMC_ZONES.find(z => z.id === selectedZone);
      if (zone && issue.location?.address) {
        const addr = issue.location.address.toLowerCase();
        const keywords = zone.circles.toLowerCase().split(', ');
        return keywords.some(kw => addr.includes(kw));
      }
    }
    return true;
  });

  if (loading) return <div className="flex justify-center py-12">{t('loading')}</div>;

  if (!user) {
    return (
      <div className="space-y-16 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            {t('heroBadge')}
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-zinc-900 leading-[0.9]">
            {t('heroTitle')} <span className="text-emerald-600">{t('heroSubtitle')}</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => signInWithPopup(auth, googleProvider)}
              className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
            >
              {t('heroGetStarted')}
            </button>
            <button className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-50 transition-all">
              {t('heroExploreData')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Social Reporting', desc: 'Post issues with photos and tags just like a social media feed.', icon: MessageSquare },
            { title: 'Agentic Routing', desc: 'AI agents automatically classify and route complaints to the right department.', icon: Bot },
            { title: 'Predictive Insights', desc: 'City analytics engine predicts hotspots and suggests data-driven solutions.', icon: BarChart3 }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('feedTitle')}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t('feedSubtitle')}</p>
        </div>
        <div className="flex gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl self-start">
          {[
            { id: 'all', label: t('feedFilterAll') },
            { id: 'open', label: t('feedFilterOpen') },
            { id: 'in-progress', label: t('feedFilterInProgress') },
            { id: 'resolved', label: t('feedFilterResolved') }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === f.id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* GHMC Zone Filter Chips Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>GHMC 6-Zone Filter</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Select your Hyderabad zone to filter local civic issues</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GHMC_ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedZone === zone.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={issue.id}
            className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-emerald-500/40 hover:shadow-2xl transition-all group backdrop-blur-xl"
          >
            {issue.status === 'resolved' ? (
              <div className="px-6 pt-4">
                <BeforeAfterComparison issue={issue} />
              </div>
            ) : (
              <div className="aspect-video w-full overflow-hidden bg-slate-950 relative">
                <img
                  src={getValidImageUrl(issue.photoUrl, DEFAULT_CIVIC_IMAGE)}
                  alt={issue.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_CIVIC_IMAGE;
                  }}
                />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${issue.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    issue.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                  {issue.status}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {issue.createdAt ? formatDistanceToNow(issue.createdAt.toDate()) + ' ago' : 'Just now'}
                </span>
              </div>

              <div className="relative">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-bold text-white leading-snug flex-1">{issue.title}</h3>
                  {user && issue.reporterUid === user.uid && issue.status === 'open' && (
                    <button
                      onClick={() => {
                        setEditingIssue(issue);
                        setEditFormData({ title: issue.title, description: issue.description });
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Edit Issue"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{issue.description}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">{issue.location?.address || 'Uppal, Hyderabad'}</span>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(issue.id)}
                    className={`flex items-center gap-1.5 transition-colors ${userLikes[issue.id] ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                      }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${userLikes[issue.id] ? 'fill-emerald-400' : ''}`} />
                    <span className="text-xs">{issue.likesCount || 0}</span>
                  </button>
                  <button
                    onClick={() => setActiveComments(issue.id)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">{issue.commentsCount || 0}</span>
                  </button>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                  {issue.reporterPhotoUrl ? (
                    <img src={issue.reporterPhotoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <User className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {activeComments && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveComments(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-slate-100"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  {t('comments')}
                </h3>
                <button
                  onClick={() => setActiveComments(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/50">
                {comments.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-50" />
                    <p className="text-sm font-medium">{t('feed.noComments') || 'No comments yet.'}</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
                        {comment.authorPhotoUrl ? (
                          <img src={comment.authorPhotoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-100">{comment.authorName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate()) + ' ago' : 'Just now'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-normal">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-950/90">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('addComment')}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-emerald-500 text-slate-950 font-extrabold p-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-40 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    {submittingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Issue Modal */}
      <AnimatePresence>
        {editingIssue && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingIssue(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-white">Edit Issue</h3>
                <button
                  onClick={() => setEditingIssue(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateIssue} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-sm font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingIssue(null)}
                    className="flex-1 py-3 border border-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit || !editFormData.title.trim() || !editFormData.description.trim()}
                    className="flex-1 py-3 bg-emerald-500 text-slate-950 rounded-xl font-extrabold hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/20"
                  >
                    {savingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredIssues.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-6 bg-slate-900/80 border border-slate-800/80 rounded-3xl backdrop-blur-xl space-y-4 shadow-2xl my-4"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">
              {t('noIssues')}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              {t('noIssuesDesc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {selectedZone !== 'all' || filter !== 'all' ? (
              <button
                onClick={() => {
                  setSelectedZone('all');
                  setFilter('all');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all"
              >
                Clear Filters
              </button>
            ) : null}
            <button
              onClick={() => navigate('/report')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              + Report New Issue
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
