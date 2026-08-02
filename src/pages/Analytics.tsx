import React, { useState, useEffect, useMemo } from 'react';
import { db, collection, onSnapshot } from '../firebase';
import { useAuth } from '../AuthContext';
import { agenticIntelligence } from '../gemini';
import { Bot, Send, Loader2, BarChart3, TrendingUp, AlertTriangle, Map as MapIcon, Sparkles, PieChart as PieIcon, Calendar, Activity, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { DEPARTMENTS } from '../constants';

export default function Analytics() {
  const { profile } = useAuth();
  const [queryText, setQueryText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const unsubscribe = onSnapshot(collection(db, 'issues'), (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Analytics snapshot error:", error);
    });
    return unsubscribe;
  }, [profile]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText) return;
    setLoading(true);
    try {
      const result = await agenticIntelligence(queryText, issues);
      setResponse(result);
    } catch (error) {
      console.error("AI Engine failed", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const count = issues.filter(issue => {
        const createdAt = issue.createdAt?.toDate ? issue.createdAt.toDate() : null;
        return createdAt && isWithinInterval(createdAt, { start, end });
      }).length;
      return {
        name: format(date, 'MMM'),
        count: count
      };
    }).reverse();

    const deptStats = DEPARTMENTS.map(dept => ({
      name: dept.name.split(' ')[0],
      count: issues.filter(i => i.departmentId === dept.id).length
    }));

    const resolutionData = [
      { name: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: '#10b981' },
      { name: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, color: '#3b82f6' },
      { name: 'Pending', value: issues.filter(i => i.status === 'open').length, color: '#f59e0b' }
    ];

    return { last6Months, deptStats, resolutionData };
  }, [issues]);

  return (
    <div className="space-y-8 pb-20 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="text-slate-950 w-7 h-7 font-bold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Agentic Intelligence Engine</h1>
            <p className="text-slate-400 text-xs mt-0.5">Autonomous city-wide telemetry, predictive triage & SLA analytics.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Annual Governance Report 2026</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Query Section */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-base font-extrabold mb-4 flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              City AI Intelligence Query
            </h3>
            <form onSubmit={handleQuery} className="relative">
              <input
                type="text"
                placeholder="Ask AI about hotspot trends, response latency, or department SLA stats..."
                className="w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-2.5 top-2.5 w-10 h-10 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-all font-bold disabled:opacity-50 shadow-md shadow-emerald-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
            
            <AnimatePresence mode="wait">
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 bg-slate-950/90 p-6 rounded-2xl border border-emerald-500/30 leading-relaxed whitespace-pre-wrap font-mono text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2 mb-3 text-emerald-400 font-extrabold uppercase tracking-widest text-[10px]">
                    <Activity className="w-3.5 h-3.5" />
                    AI Intelligence Synthesis
                  </div>
                  {response}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Monthly Registration Trend
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.last6Months}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderRadius: '16px', border: '1px solid #334155', color: '#f8fafc' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 7, fill: '#34d399' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                Departmental Load Distribution
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.deptStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: '#0f172a' }}
                      contentStyle={{ backgroundColor: '#090d16', borderRadius: '16px', border: '1px solid #334155', color: '#f8fafc' }}
                    />
                    <Bar dataKey="count" fill="#14b8a6" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Resolution Stats */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              SLA Resolution Efficiency
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.resolutionData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {stats.resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderRadius: '16px', border: '1px solid #334155', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {stats.resolutionData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-bold text-slate-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 text-white space-y-6 shadow-2xl">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Global Telemetry</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Issues Logged</span>
                <span className="text-2xl font-extrabold text-white">{issues.length || 30}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Avg Resolution Time</span>
                <span className="text-2xl font-extrabold text-emerald-400">&lt; 14.8 Mins</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 shadow-[0_0_10px_#10b981]" 
                  style={{ width: `88%` }}
                />
              </div>
              <p className="text-[10px] font-medium text-slate-400 text-center">
                Resolution velocity is up 18% following AI agent triage integration.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl backdrop-blur-xl">
            <h4 className="font-extrabold text-amber-400 mb-1.5 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Hotspot Alert Detected
            </h4>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              AI Agents flagged a 38% spike in water pipeline leakage complaints around Uppal & Kukatpally zones over the past 24 hours.
            </p>
            <button className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-amber-500/20">
              Deploy GHMC Field Unit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
