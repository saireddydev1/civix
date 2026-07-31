import { useState, useEffect, useMemo } from 'react';
import { db, collection, onSnapshot } from '../firebase';
import { useAuth } from '../AuthContext';
import { agenticIntelligence } from '../gemini';
import { Bot, Send, Loader2, BarChart3, TrendingUp, AlertTriangle, Map as MapIcon, Sparkles, PieChart as PieIcon, Calendar } from 'lucide-react';
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

  const handleQuery = async (e) => {
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
        const createdAt = issue.createdAt?.toDate();
        return createdAt && isWithinInterval(createdAt, { start, end });
      }).length;
      return {
        name: format(date, 'MMM'),
        count
      };
    }).reverse();

    const deptStats = DEPARTMENTS.map(dept => ({
      name: dept.name,
      count: issues.filter(i => i.departmentId === dept.id).length
    }));

    const resolutionData = [
      { name: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: '#10b981' },
      { name: 'Pending', value: issues.filter(i => i.status !== 'resolved').length, color: '#f59e0b' }
    ];

    return { last6Months, deptStats, resolutionData };
  }, [issues]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
            <Bot className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Agentic Intelligence Engine</h1>
            <p className="text-zinc-500 mt-1">Autonomous analysis for city-level decision making.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-zinc-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-bold">Annual Report 2026</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Query Section */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              City Insights Query
            </h3>
            <form onSubmit={handleQuery} className="relative">
              <input
                type="text"
                placeholder="Ask about traffic, hotspots, or department performance..."
                className="w-full pl-4 pr-12 py-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50"
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
                  className="mt-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 leading-relaxed whitespace-pre-wrap font-mono text-sm text-zinc-700"
                >
                  <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                    AI Analysis Result
                  </div>
                  {response}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Registration Trend
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.last6Months}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Issues by Department
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.deptStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3f3f46" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Resolution Stats */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieIcon className="w-4 h-4" />
              Resolution Efficiency
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.resolutionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {stats.resolutionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-zinc-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="bg-zinc-900 p-8 rounded-3xl text-white space-y-6">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Global Overview</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Total Registered</span>
                <span className="text-2xl font-bold">{issues.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Resolved (YTD)</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {issues.filter(i => i.status === 'resolved').length}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${(issues.filter(i => i.status === 'resolved').length / (issues.length || 1)) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 text-center">
                Resolution rate is up 12% from last quarter.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Hotspot Alert
            </h4>
            <p className="text-sm text-emerald-700">
              AI Agents detected a 40% spike in water-related complaints in the Uppal region over the last 48 hours.
            </p>
            <button className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">
              Deploy Response Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
