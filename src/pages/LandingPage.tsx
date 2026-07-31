import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Bot, 
  BarChart3, 
  Building2, 
  Zap, 
  Droplets, 
  Truck, 
  Camera, 
  Users, 
  Clock, 
  Award,
  Layers,
  ChevronRight,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Slider state for Before / After showcase
  const [sliderPos, setSliderPos] = useState(50);

  const stats = [
    { label: "Issues Resolved", value: "14,290+", change: "+12% this month" },
    { label: "Avg Triage Time", value: "< 15 Mins", change: "AI Auto-Routed" },
    { label: "SLA Resolution Rate", value: "98.6%", change: "Verified Proofs" },
    { label: "Active Citizens", value: "85,000+", change: "Across Hyderabad" }
  ];

  const features = [
    {
      icon: Camera,
      title: "AI Photo & Voice Triage",
      desc: "Upload a photo or voice note. Gemini 3.1 AI auto-detects issue type, severity, and exact GPS coordinates instantly.",
      tag: "Computer Vision"
    },
    {
      icon: Bot,
      title: "Agentic Department Routing",
      desc: "Smart AI agents automatically classify and route complaints to Municipal, Water, Power, or Transport boards.",
      tag: "Agentic AI"
    },
    {
      icon: BarChart3,
      title: "Predictive Hotspot Analytics",
      desc: "ML models analyze historical complaint data to forecast infrastructure failures before they occur.",
      tag: "Predictive Analytics"
    },
    {
      icon: CheckCircle2,
      title: "Proof-of-Work Verification",
      desc: "Field officials must upload verified post-repair photos before closing any citizen report.",
      tag: "Zero Tampering"
    }
  ];

  const steps = [
    { num: "01", title: "Snap & Report", desc: "Citizen posts a photo or audio report of a pothole, leak, or garbage breakdown." },
    { num: "02", title: "AI Auto-Triage", desc: "AI algorithms extract location, assign category, and alert responsible department." },
    { num: "03", title: "Official Action", desc: "Field officer receives task on Department Portal and dispatches repair crew." },
    { num: "04", title: "Verified Closure", desc: "Officer posts proof-of-work photo, and citizen receives confirmation and Karma points." }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-zinc-950">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">{t('appName')}</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v2.4 Enterprise</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#showcase" className="hover:text-emerald-400 transition-colors">Proof of Work</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-emerald-400 transition-colors">City Analytics</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/feed')}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <span>Go to App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/feed')}
                  className="hidden sm:block text-zinc-300 hover:text-white font-semibold px-4 py-2"
                >
                  Explore Guest
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Next-Gen Smart City Governance Platform</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05] max-w-5xl mx-auto"
        >
          Transforming Cities with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Agentic Intelligence</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-xl sm:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
        >
          Report potholes, water leaks, and power outages as effortlessly as a social media post. AI agents automatically triage, route, and verify resolution in real time.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => navigate('/report')}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 group"
          >
            <span>Report a Civic Issue</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => navigate('/map')}
            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Explore City GIS Map</span>
          </button>
        </motion.div>

        {/* Live Hero Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl backdrop-blur-xl"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-left p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/40">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">{stat.value}</div>
              <div className="text-sm font-semibold text-zinc-300 mt-1">{stat.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{stat.change}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-zinc-900/40 border-y border-zinc-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Powered by Next-Gen Civic Tech
            </h2>
            <p className="text-zinc-400 text-lg">
              Engineered to eliminate administrative delays, automate complaint triage, and bring total transparency to city governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -6 }}
                className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                  <feat.icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  {feat.tag}
                </span>
                <h3 className="text-xl font-bold text-white mt-4 mb-3">{feat.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After Interactive Showcase Section */}
      <section id="showcase" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
              <CheckCircle2 className="w-4 h-4" />
              Verified Proof-of-Work
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              See Real City Transformations In Action
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Every issue resolved on CIVIX OS requires official photo verification. Drag the slider to compare reported breakdown vs completed field repairs.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                <span className="text-zinc-300 text-sm font-medium">GPS-Verified Before & After Uploads</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                <span className="text-zinc-300 text-sm font-medium">Automatic Citizen Notification & Karma Points</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                <span className="text-zinc-300 text-sm font-medium">Public Audit Trail for Municipal Governance</span>
              </div>
            </div>
          </div>

          {/* Interactive Split Image Slider */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl select-none group">
            {/* After Image (Background) */}
            <img 
              src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200" 
              alt="Resolved Infrastructure" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-emerald-500 text-zinc-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider z-10 shadow-lg">
              AFTER (RESOLVED)
            </div>

            {/* Before Image (Foreground clipped by slider) */}
            <div 
              className="absolute inset-0 overflow-hidden" 
              style={{ width: `${sliderPos}%` }}
            >
              <img 
                src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1200" 
                alt="Reported Pothole" 
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: `100%`, height: '100%' }}
              />
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                BEFORE (REPORTED)
              </div>
            </div>

            {/* Slider Divider Bar */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-2xl"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center font-bold text-xs shadow-xl border-2 border-emerald-500">
                ↔
              </div>
            </div>

            {/* Hidden Input Range Control */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-zinc-900/40 border-t border-zinc-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              4 Steps to a Cleaner, Smarter City
            </h2>
            <p className="text-zinc-400 text-lg">
              Seamlessly bridging citizens and municipal engineers in a transparent loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-zinc-950 p-8 rounded-3xl border border-zinc-800 relative text-left">
                <div className="text-5xl font-black text-emerald-500/20 mb-4">{step.num}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xl font-bold text-white">{t('appName')}</span>
            <span className="text-xs text-zinc-500 font-mono">© 2026 Smart City Governance Platform</span>
          </div>

          <div className="flex gap-6 text-sm text-zinc-400 font-medium">
            <button onClick={() => navigate('/feed')} className="hover:text-emerald-400 transition-colors">Civic Feed</button>
            <button onClick={() => navigate('/map')} className="hover:text-emerald-400 transition-colors">City Map</button>
            <button onClick={() => navigate('/analytics')} className="hover:text-emerald-400 transition-colors">Analytics</button>
            <button onClick={() => navigate('/login')} className="hover:text-emerald-400 transition-colors">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
