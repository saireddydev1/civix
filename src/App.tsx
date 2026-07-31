import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { auth, signOut, db, doc, updateDoc } from './firebase';
import { DEPARTMENTS } from './constants';
import { ShieldCheck, LogOut, Menu, X, Plus, BarChart3, User as UserIcon, Loader2, Languages, Map as MapIcon, ChevronDown, Building2, User, RefreshCw, Trophy, Home } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Pages & Components
import Feed from './pages/Feed';
import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import DepartmentDashboard from './pages/DepartmentDashboard';
import CityMap from './pages/CityMap';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Leaderboard from './pages/Leaderboard';
import AICopilot from './components/AICopilot';

const Navbar = () => {
  const { user, profile, setProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  const handleLogout = () => signOut(auth);

  const handleRoleChange = async (role: string, deptId?: string) => {
    if (!user) return;
    setUpdatingRole(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role,
        departmentId: deptId || null
      });
      setProfile((prev: any) => ({ ...prev, role, departmentId: deptId || null }));
      setShowRoleMenu(false);
    } catch (err) {
      console.error('Failed to change role:', err);
    } finally {
      setUpdatingRole(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <>
      {/* Top Live City Emergency Marquee Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 text-[11px] font-bold text-slate-300 py-1.5 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-extrabold uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE CITY BULLETIN</span>
          </div>

          <div className="overflow-hidden relative w-full">
            <motion.div
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="whitespace-nowrap flex items-center gap-8 text-slate-300 font-medium"
            >
              <span>🚨 <strong>GHMC Alert:</strong> Automated pothole & drainage repair teams dispatched across Kukatpally & Banjara Hills.</span>
              <span>⚡ <strong>TSSPDCL Notice:</strong> Power restoration complete in Madhapur sector 4 (SLA &lt; 14 Mins).</span>
              <span>💧 <strong>HMWSSB Update:</strong> Water pipeline pressure monitoring active in Jubilee Hills Zone 2.</span>
            </motion.div>
          </div>
        </div>
      </div>

      <nav className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/feed" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="text-slate-950 w-5 h-5 font-bold" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">{t('appName')}</span>
            </Link>

            {/* Quick Role Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold hover:bg-emerald-500/20 transition-all shadow-sm"
                title="Switch Active Portal / Role"
              >
                {profile?.role === 'official' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="capitalize">{profile?.departmentId || 'Official'} Mode</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Citizen Portal</span>
                  </>
                )}
                {updatingRole ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-400 ml-0.5" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-emerald-400" />
                )}
              </button>

              <AnimatePresence>
                {showRoleMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-2 z-50 text-slate-100"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Switch Active Portal Mode
                    </div>
                    
                    <button
                      onClick={() => handleRoleChange('citizen')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all mt-1 ${
                        profile?.role === 'citizen' ? 'bg-emerald-500 text-slate-950' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Citizen Portal</span>
                      </div>
                      {profile?.role === 'citizen' && <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full">Active</span>}
                    </button>

                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800 mt-2">
                      Department Access
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                      {DEPARTMENTS.map(dept => (
                        <button
                          key={dept.id}
                          onClick={() => handleRoleChange('official', dept.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            profile?.role === 'official' && profile?.departmentId === dept.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="truncate">{dept.name}</span>
                          {profile?.role === 'official' && profile?.departmentId === dept.id && (
                            <span className="text-[9px] bg-slate-950/20 px-1.5 py-0.5 rounded-full shrink-0">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <Link to="/welcome" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors">
              <Home className="w-4 h-4 text-emerald-400" /> Home
            </Link>
            <Link to="/feed" className="text-slate-300 hover:text-emerald-400 transition-colors">{t('feed')}</Link>
            <Link to="/report" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors">
              <Plus className="w-4 h-4 text-emerald-400" /> {t('reportIssue')}
            </Link>
            <Link to="/map" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors">
              <MapIcon className="w-4 h-4 text-emerald-400" /> {t('map')}
            </Link>
            <Link to="/analytics" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> {t('analytics')}
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors">
              <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
            </Link>
            {profile?.role === 'official' && (
              <Link to="/department" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20">
                Dept Dashboard
              </Link>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {showLang && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 text-slate-200"
                  >
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'te', label: 'తెలుగు' },
                      { code: 'hi', label: 'हिन्दी' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setShowLang(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors ${language === lang.code ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/dashboard" className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full hover:bg-slate-700 transition-all text-slate-200">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">{profile?.displayName}</span>
            </Link>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4 text-slate-200"
          >
            <Link to="/welcome" onClick={() => setIsOpen(false)} className="block text-slate-300">Home Landing</Link>
            <Link to="/feed" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('feed')}</Link>
            <Link to="/report" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('reportIssue')}</Link>
            <Link to="/map" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('map')}</Link>
            <Link to="/analytics" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('analytics')}</Link>
            <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block text-slate-300">Leaderboard</Link>
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('profile')}</Link>
            <button onClick={handleLogout} className="block w-full text-left text-red-400 font-bold">Sign Out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
};

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const isPublicLanding = location.pathname === '/welcome' || location.pathname === '/landing';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {user && profile && !isPublicLanding && <Navbar />}
      <main className={isPublicLanding ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        <Routes>
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          {!user || !profile ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<LandingPage />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Feed />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/map" element={<CityMap />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/department" element={<DepartmentDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </main>

      {/* Global AI Copilot Assistant */}
      <AICopilot />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

