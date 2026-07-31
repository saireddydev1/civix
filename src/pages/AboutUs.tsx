import { Building2, ShieldCheck, Zap, Users, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const AboutUs = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-slate-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Civic Innovation Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Transforming Cities Through <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">AI & Citizen Power</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Civix connects citizens directly with municipal departments to report infrastructure issues, track resolutions in real time, and build transparent, resilient smart cities.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI-Powered Routing</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Google Gemini & Groq models automatically analyze issue descriptions, assign severity scores, and route tasks to specific municipal departments.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Department Collaboration</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Provides dedicated dashboards for municipal officers across GHMC, TSSPDCL, and HMWSSB to update status and meet resolution SLAs.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Community Leaderboards</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Gamified reporting rewards active citizens who report potholes, streetlights, or water leaks with civic karma and community recognition.
            </p>
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">12.4K+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Issues Resolved</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-teal-400">94.2%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">SLA Compliance</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">&lt; 24 Hrs</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Avg Resolution Time</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-indigo-400">45.8K</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Active Citizens</div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl font-black text-white">Ready to make a difference in your neighborhood?</h2>
            <p className="text-slate-300 text-sm">
              Report an issue in seconds or track live municipal updates in your ward.
            </p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 shrink-0"
          >
            Report an Issue Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
