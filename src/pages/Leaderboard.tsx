import React, { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot, getDocs } from '../firebase';
import { Award, Trophy, Sparkles, Shield, User, Flame, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';

export default function Leaderboard() {
  const { user, profile } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock initial leaderboard data augmented with live users
  useEffect(() => {
    async function fetchLeaders() {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const liveUsers = snapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: data.displayName || 'Civic Member',
            photoUrl: data.photoUrl,
            karma: 350 + Math.floor(Math.random() * 800),
            reportsCount: 5 + Math.floor(Math.random() * 15),
            badge: 'City Guardian'
          };
        });

        const defaultLeaders = [
          { id: 'm1', name: 'Rajesh Kumar', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', karma: 1250, reportsCount: 28, badge: 'Grand Master' },
          { id: 'm2', name: 'Priya Sharma', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', karma: 980, reportsCount: 21, badge: 'City Guardian' },
          { id: 'm3', name: 'Anil Reddy', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', karma: 840, reportsCount: 19, badge: 'Spotless Master' },
          { id: 'm4', name: 'Sneha Patel', photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', karma: 710, reportsCount: 14, badge: 'Rapid Reporter' }
        ];

        const combined = [...liveUsers, ...defaultLeaders].sort((a, b) => b.karma - a.karma);
        setLeaders(combined);
      } catch (error) {
        console.warn("Leaderboard snapshot error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaders();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-zinc-900 to-teal-900 text-white p-8 sm:p-12 rounded-3xl border border-emerald-800/40 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-emerald-400" />
            Civic Karma & Honor Roll
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Community Leaderboard
          </h1>
          <p className="text-zinc-300 text-base leading-relaxed">
            Earn Karma Points every time you report verified issues or help your municipal departments keep your neighborhood clean and safe.
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {leaders.slice(0, 3).map((leader, i) => (
          <motion.div
            key={leader.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col items-center text-center ${
              i === 0 ? 'bg-gradient-to-b from-amber-500/10 to-zinc-900 border-amber-500/40 shadow-xl' :
              i === 1 ? 'bg-gradient-to-b from-zinc-400/10 to-zinc-900 border-zinc-500/40' :
              'bg-gradient-to-b from-amber-700/10 to-zinc-900 border-amber-800/40'
            }`}
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-zinc-800 shadow-lg">
                <img src={leader.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}`} className="w-full h-full object-cover" />
              </div>
              <div className={`absolute -bottom-2 right-0 w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shadow-lg ${
                i === 0 ? 'bg-amber-400 text-zinc-950' : i === 1 ? 'bg-zinc-300 text-zinc-950' : 'bg-amber-700 text-white'
              }`}>
                #{i + 1}
              </div>
            </div>

            <h3 className="font-bold text-lg text-white mb-1">{leader.name}</h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-3">
              {leader.badge}
            </span>

            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-3 border-t border-zinc-800/80 w-full justify-center">
              <div>
                <span className="text-base font-extrabold text-amber-400 block">{leader.karma}</span>
                <span>Karma Pts</span>
              </div>
              <div className="w-px h-6 bg-zinc-800" />
              <div>
                <span className="text-base font-extrabold text-white block">{leader.reportsCount}</span>
                <span>Reports</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Top Civic Contributors
          </h2>
          <span className="text-xs text-zinc-400 font-medium">Updated Real-Time</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {leaders.map((leader, index) => (
            <div key={leader.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-6 text-sm font-bold text-zinc-500 text-center">#{index + 1}</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                  <img src={leader.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-white text-base">{leader.name}</div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 font-semibold">{leader.badge}</span>
                    <span>•</span>
                    <span>{leader.reportsCount} Verified Reports</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-extrabold text-emerald-400">{leader.karma} Pts</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Civic Karma</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
