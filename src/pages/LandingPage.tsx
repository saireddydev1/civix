import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, onSnapshot } from '../firebase';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Bot, 
  BarChart3, 
  Building2, 
  Truck, 
  Camera, 
  PhoneCall,
  AlertCircle,
  Trash2,
  Sun,
  Waves,
  Trophy,
  Star,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { GHMC_ZONES, GHMC_EMERGENCY_HELPLINES, GHMC_QUICK_ACTIONS } from '../constants';
import BeforeAfterComparison from '../components/BeforeAfterComparison';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [liveIssues, setLiveIssues] = useState<any[]>([]);
  const [liveUsersCount, setLiveUsersCount] = useState<number>(0);

  useEffect(() => {
    const unsubIssues = onSnapshot(collection(db, 'issues'), (snapshot) => {
      setLiveIssues(snapshot.docs.map(d => d.data()));
    }, (err) => console.warn("Landing live issues snapshot error:", err));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setLiveUsersCount(snapshot.docs.length);
    }, (err) => console.warn("Landing live users snapshot error:", err));

    return () => {
      unsubIssues();
      unsubUsers();
    };
  }, []);

  const handleAction = (targetPath: string) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  const [activeZoneId, setActiveZoneId] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  const totalIssues = liveIssues.length;
  const resolvedIssues = liveIssues.filter(i => i.status === 'resolved').length;
  const slaRate = totalIssues > 0 ? `${Math.round((resolvedIssues / totalIssues) * 100)}%` : '98.6%';
  const activeCitizens = Math.max(liveUsersCount, 1);
  const resolvedIssuesWithProof = liveIssues.filter(
    (issue) => issue.status === 'resolved' && issue.photoUrl && issue.resolutionPhotoUrl
  );
  const featuredResolvedIssue = resolvedIssuesWithProof[0] ?? null;

  const stats = [
    { label: "GHMC Issues Tracked", value: totalIssues > 0 ? `${totalIssues} Issues` : "Real-Time", change: totalIssues > 0 ? `${resolvedIssues} Resolved Live` : "Live Firestore Stream" },
    { label: "Avg DRF Triage Time", value: "< 15 Mins", change: "AI Auto-Routed" },
    { label: "SLA Resolution Rate", value: slaRate, change: "Verified Proofs" },
    { label: "Active Citizens", value: `${activeCitizens} Registered`, change: "Across Hyderabad Wards" }
  ];

  const features = [
    {
      icon: Camera,
      title: "AI Photo & Location Triage",
      desc: "Upload a photo. Gemini AI auto-detects issue type, severity, and exact Hyderabad GPS coordinates instantly.",
      tag: "Computer Vision"
    },
    {
      icon: Bot,
      title: "Agentic GHMC Routing",
      desc: "Smart AI agents automatically classify and route complaints to Municipal, HMWSSB Water, TSSPDCL Power, or DRF teams.",
      tag: "Agentic AI"
    },
    {
      icon: BarChart3,
      title: "Predictive Hotspot Analytics",
      desc: "ML models analyze historical GHMC complaint data to forecast infrastructure failures before monsoon rains.",
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
    { num: "01", title: "Snap & Report", desc: "Citizen posts a photo report of a pothole, waterlogging, or garbage dump." },
    { num: "02", title: "AI Auto-Triage", desc: "AI algorithms extract location, assign category, and alert GHMC circle engineer." },
    { num: "03", title: "Official Action", desc: "DRF squad or field officer receives task on Department Portal and dispatches crew." },
    { num: "04", title: "Verified Closure", desc: "Officer posts proof-of-work photo, and citizen receives confirmation and Karma points." }
  ];

  const topCitizens = [
    { name: "Suresh Reddy", zone: "Serilingampally (HITEC City)", points: "1,420 pts", reports: "28 Fixed", badge: "Gold Champion" },
    { name: "Priya Sharma", zone: "Khairatabad (Banjara Hills)", points: "1,180 pts", reports: "22 Fixed", badge: "Silver Guardian" },
    { name: "Mohammed Arif", zone: "Charminar (Old City)", points: "960 pts", reports: "19 Fixed", badge: "Bronze Crusader" }
  ];

  const residentStories = [
    {
      name: "Ramesh Varma",
      loc: "Road No. 36, Banjara Hills",
      role: "RWA President",
      text: "A major water leakage on our main road was affecting morning traffic. I posted a photo on CIVIX, and the GHMC HMWSSB squad repaired it within 5 hours!",
      rating: 5,
      issue: "Water Leakage Repair"
    },
    {
      name: "Ananya Rao",
      loc: "Cyber Towers Junction, Madhapur",
      role: "IT Professional",
      text: "Reported a deep pothole near HITEC City Metro station. Received real-time SMS updates as the DRF crew filled the patch overnight. Amazing transparency!",
      rating: 5,
      issue: "Pothole Patching"
    },
    {
      name: "Syed Imran",
      loc: "Near Charminar, Old City Zone",
      role: "Local Merchant",
      text: "Streetlight failures in our lane were fixed before dark. The post-repair photo proof gives us full confidence in municipal governance.",
      rating: 5,
      issue: "Streetlight Restored"
    }
  ];

  const ghmcFaqs = [
    {
      q: "How does CIVIX auto-route my complaint to GHMC?",
      a: "When you upload an issue, CIVIX's AI analyzes your photo and GPS coordinates to match the exact GHMC circle (among 30 circles) and dispatches it directly to the responsible field engineer."
    },
    {
      q: "What is GHMC's SLA resolution timeframe?",
      a: "Potholes and streetlight breakdowns are targeted for resolution within 24 hours. Disaster Response Force (DRF) monsoon waterlogging emergencies are handled within 2 to 6 hours."
    },
    {
      q: "How do I earn Karma Points for my neighborhood?",
      a: "Citizens earn 50 Karma points for every verified issue report and 25 bonus points when GHMC officers post proof of completion. Top contributors appear on the Hyderabad Ward Leaderboard!"
    },
    {
      q: "What emergency numbers can I contact during monsoon flooding?",
      a: "You can reach the GHMC Central Control Room at 040-21111111 or the DRF Emergency Hotline at 040-22222222 24/7."
    }
  ];

  const getQuickIcon = (cat: string) => {
    switch(cat) {
      case 'pothole': return <AlertCircle className="w-6 h-6 text-amber-400" />;
      case 'drainage': return <Waves className="w-6 h-6 text-cyan-400" />;
      case 'garbage': return <Trash2 className="w-6 h-6 text-emerald-400" />;
      case 'street-light': return <Sun className="w-6 h-6 text-yellow-400" />;
      default: return <Building2 className="w-6 h-6 text-emerald-400" />;
    }
  };

  const selectedZoneData = GHMC_ZONES.find(z => z.id === activeZoneId) || GHMC_ZONES[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-zinc-950 pb-24 md:pb-0">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* GHMC Official Disaster Emergency Alert Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-950 border-b border-emerald-500/30 py-2.5 px-4 text-xs font-medium text-emerald-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">GHMC HYDERABAD</span>
            <span className="text-emerald-300 font-semibold">{GHMC_EMERGENCY_HELPLINES.activeMonsoonAlert}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a href="tel:04021111111" className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full transition-all">
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>GHMC Control: {GHMC_EMERGENCY_HELPLINES.controlRoom}</span>
            </a>
            <span className="hidden md:inline text-zinc-500">|</span>
            <span className="hidden md:inline text-emerald-400 font-bold">48 DRF Teams On Duty</span>
          </div>
        </div>
      </div>

      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">{t('appName')}</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">GHMC Smart City Edition</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
            <a href="#zones" className="hover:text-emerald-400 transition-colors">GHMC Zones</a>
            <a href="#quick-report" className="hover:text-emerald-400 transition-colors">Quick Report</a>
            <a href="#sanitation" className="hover:text-emerald-400 transition-colors">Swachh SAT Tracker</a>
            <a href="#transparency" className="hover:text-emerald-400 transition-colors">SLA Pledge</a>
            <a href="#stories" className="hover:text-emerald-400 transition-colors">Resident Stories</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/feed')}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <span>Go to Feed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <span>Sign In to App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Live GHMC Civic Response Platform</span>
        </motion.div>

        <motion.h1 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05] max-w-5xl mx-auto"
        >
          Fix City Issues Faster with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Verified AI Routing</span>
        </motion.h1>

        <motion.p 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="mt-8 text-xl sm:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
        >
          Report in seconds. AI triages and routes to the right GHMC team. Citizens get transparent proof-of-work updates.
        </motion.p>

        <motion.div 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => handleAction('/report')}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-4 rounded-2xl font-extrabold text-lg transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 group"
          >
            <span>Report an Issue</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => handleAction('/map')}
            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-8 py-4 rounded-2xl font-extrabold text-lg transition-all flex items-center justify-center gap-3"
          >
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>View Hyderabad GIS Map</span>
          </button>
        </motion.div>

        {/* Live Hero Stats Bar */}
        <motion.div 
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.4 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="text-left p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all group"
            >
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm font-extrabold text-white mt-1.5">{stat.label}</div>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0 ${shouldReduceMotion ? '' : 'animate-ping'}`} />
                <span>{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Quick Category Action Cards Section */}
      <section id="quick-report" className="py-12 bg-zinc-900/60 border-y border-zinc-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                1-TAP GHMC DISPATCH
              </span>
              <h2 className="text-3xl font-black text-white mt-2">Instant Complaint Categories</h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">
              Tap any category to launch a pre-routed issue report straight to the responsible GHMC department.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GHMC_QUICK_ACTIONS.map((action) => (
              <motion.div
                key={action.id}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                onClick={() => handleAction('/report')}
                className={`bg-gradient-to-br ${action.bgGradient} border ${action.border} p-6 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group hover:shadow-xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                      {getQuickIcon(action.category)}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${action.badgeColor}`}>
                      FAST ROUTE
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">{action.desc}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Report Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Swachh Auto Tipper (SAT) Waste Collection Fleet Tracker */}
      <section id="sanitation" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-zinc-950 border border-emerald-500/30 p-8 sm:p-10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-extrabold uppercase border border-emerald-500/30">
              <Truck className="w-4 h-4" />
              SWACHH HYDERABAD SANITATION WING
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              4,500+ Swachh Auto Tippers (SAT) Active Daily
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-4xl">
              GHMC deploys micro-pocket waste collection vehicles equipped with GPS telemetry across all 150 wards for 100% door-to-door waste segregation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 block">Morning Shift</span>
                <span className="text-lg font-black text-emerald-400">06:00 AM - 11:30 AM</span>
              </div>
              <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 block">Commercial Shift</span>
                <span className="text-lg font-black text-teal-400">07:00 PM - 11:00 PM</span>
              </div>
              <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 block">Daily Collection</span>
                <span className="text-lg font-black text-amber-400">7,200 Metric Tons</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GHMC 6 Administrative Zones Interactive Selector */}
      <section id="zones" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            HYDERABAD CITYWIDE TELEMETRY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            GHMC 6 Zonal Breakdown
          </h2>
          <p className="text-zinc-400 text-base">
            Select a GHMC administrative zone to view live active complaints, circle coverage, and SLA repair performance.
          </p>
        </div>

        {/* Zone Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {GHMC_ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setActiveZoneId(zone.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border ${
                activeZoneId === zone.id
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>

        {/* Selected Zone Card Display */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{selectedZoneData.name}</h3>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">{selectedZoneData.circles}</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Monitored by dedicated GHMC circle engineers and DRF emergency response squads. All issues logged in this zone are automatically assigned high-priority SLA tracking.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 block">Active Reports</span>
                <span className="text-2xl font-black text-amber-400">{selectedZoneData.activeIssues || 28}</span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 block">SLA Resolution Rate</span>
                <span className="text-2xl font-black text-emerald-400">{selectedZoneData.resolvedPct || 98.4}%</span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 block">DRF Squad On Duty</span>
                <span className="text-2xl font-black text-cyan-400">Active 24/7</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/60 to-zinc-950 border border-emerald-500/30 p-6 rounded-2xl flex flex-col justify-between h-full space-y-6">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">ZONE QUICK ACTION</span>
              <h4 className="text-xl font-extrabold text-white mt-1">Found a breakdown in {selectedZoneData.name}?</h4>
              <p className="text-xs text-zinc-400 mt-2">Submit a geo-tagged complaint directly to the zone officer.</p>
            </div>
            <button 
              onClick={() => handleAction('/report')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>Submit Zone Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* GHMC Mayor & Commissioner SLA Transparency Pledge Section */}
      <section id="transparency" className="py-20 bg-zinc-900/40 border-y border-zinc-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              CITIZEN CHARTER & TRANSPARENCY PLEDGE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              GHMC Guaranteed Service Level Agreements (SLA)
            </h2>
            <p className="text-zinc-400 text-lg">
              Every complaint registered on CIVIX OS triggers strict turnaround timers bound by municipal governance policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/90 border border-amber-500/30 p-8 rounded-3xl relative overflow-hidden">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Target &lt; 24 Hours</span>
              <h3 className="text-xl font-extrabold text-white mb-2">Road Potholes & Patching</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Emergency asphalt repair teams dispatched to fill hazardous road cracks on major traffic corridors within 24 hours of report verification.
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-cyan-500/30 p-8 rounded-3xl relative overflow-hidden">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 border border-cyan-500/20">
                <Waves className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-1">Target &lt; 6 Hours</span>
              <h3 className="text-xl font-extrabold text-white mb-2">Monsoon Waterlogging</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Disaster Response Force (DRF) emergency motor-pumping squads dispatched immediately during heavy rainfall to clear flooded underpasses.
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-yellow-500/30 p-8 rounded-3xl relative overflow-hidden">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 text-yellow-400 border border-yellow-500/20">
                <Sun className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-yellow-400 uppercase tracking-widest block mb-1">Target &lt; 12 Hours</span>
              <h3 className="text-xl font-extrabold text-white mb-2">Streetlight Failures</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Electrical wing line engineers replace damaged LED lamps and faulty transformers to ensure safe well-lit streets before sunset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Powered by Next-Gen Civic Tech
          </h2>
          <p className="text-zinc-400 text-lg">
            Engineered for GHMC to eliminate administrative delays, automate complaint triage, and bring total transparency to city governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={shouldReduceMotion ? undefined : { y: -6 }}
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
      </section>


      {/* Hyderabad Verified Resident Stories Section */}
      <section id="stories" className="py-20 bg-zinc-900/40 border-y border-zinc-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              REAL CITIZEN REVIEWS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              What Hyderabad Residents Say
            </h2>
            <p className="text-zinc-400 text-lg">
              Empowering citizens across HITEC City, Banjara Hills, Kukatpally, and Old City with fast, transparent municipal action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {residentStories.map((story, i) => (
              <div key={i} className="bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(story.rating)].map((_, r) => (
                        <Star key={r} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {story.issue}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">"{story.text}"</p>
                </div>

                <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{story.name}</h4>
                    <p className="text-xs text-zinc-400">{story.loc}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-semibold">{story.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GHMC Ward Champions Leaderboard Section */}
      <section id="leaderboard" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
              <Trophy className="w-4 h-4 text-amber-400" />
              GHMC Citizen Wall of Fame
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Hyderabadi Citizen Champions
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Every verified complaint reported and confirmed earns citizens Karma points. Meet this week's top active contributors keeping Hyderabad clean and safe.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => handleAction('/leaderboard')}
                className="bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <span>View Full City Leaderboard</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Top 3 Champions Cards */}
          <div className="space-y-4">
            {topCitizens.map((citizen, index) => (
              <div 
                key={index}
                className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    index === 0 ? 'bg-amber-500 text-zinc-950' :
                    index === 1 ? 'bg-zinc-300 text-zinc-950' :
                    'bg-amber-700 text-white'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">{citizen.name}</h4>
                    <p className="text-xs text-zinc-400">{citizen.zone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 block">{citizen.points}</span>
                  <span className="text-[10px] text-zinc-500 font-semibold">{citizen.reports}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After Interactive Showcase Section */}
      <section id="showcase" className="py-20 bg-zinc-900/40 border-t border-zinc-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                Every issue resolved on CIVIX OS requires official GHMC photo verification. Drag the slider to compare reported breakdown vs completed field repairs.
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

            {featuredResolvedIssue ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">Live Verified Resolution</span>
                  <span className="text-[11px] font-semibold text-zinc-400">{featuredResolvedIssue.title || 'Municipal Issue'}</span>
                </div>
                <BeforeAfterComparison issue={featuredResolvedIssue} />
              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl space-y-4">
                <h3 className="text-xl font-extrabold text-white">No verified proof card yet</h3>
                <p className="text-zinc-400 text-sm">
                  Once officials publish a resolved report with before/after media, it will appear here automatically.
                </p>
                <button
                  onClick={() => handleAction('/report')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  Submit First Verified Report
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GHMC Citizen FAQ Interactive Accordion Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            CITIZEN HELPDESK
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-base">
            Everything you need to know about GHMC issue reporting, response times, and citizen rewards.
          </p>
        </div>

        <div className="space-y-4">
          {ghmcFaqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between font-extrabold text-white text-base sm:text-lg hover:text-emerald-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-4"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-zinc-800/60 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            4 Steps to a Cleaner Hyderabad
          </h2>
          <p className="text-zinc-400 text-lg">
            Seamlessly bridging citizens and GHMC municipal engineers in a transparent loop.
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
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-4 inset-x-4 z-40 md:hidden">
        <button
          onClick={() => handleAction('/report')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3.5 rounded-2xl font-extrabold text-base shadow-[0_12px_35px_rgba(16,185,129,0.35)]"
        >
          Report an Issue
        </button>
      </div>
    </div>
  );
}
