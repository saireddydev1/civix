import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { auth, signOut, db, doc, updateDoc } from '../firebase';
import { DEPARTMENTS } from '../constants';
import { ShieldCheck, LogOut, Menu, X, Plus, BarChart3, User as UserIcon, Languages, Map as MapIcon, ChevronDown, Building2, User, RefreshCw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LiveBulletin from './LiveBulletin';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/home');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

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
      <LiveBulletin />

      <nav className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/feed" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="text-slate-950 w-5 h-5 font-bold" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">{t('appName')}</span>
              </Link>

              {(profile?.role === 'official' || profile?.role === 'admin') && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-extrabold shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="capitalize">
                    {profile?.displayName && profile.displayName !== 'Civic User' 
                      ? profile.displayName 
                      : (profile?.departmentId ? `${profile.departmentId} Department` : 'Department Hub')}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-semibold">
              <Link to="/feed" className="text-slate-300 hover:text-emerald-400 transition-colors">{t('feed')}</Link>
              <Link 
                to="/report" 
                className="relative group/btn flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 px-3.5 py-1.5 rounded-xl font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] hover:scale-105 transition-all border border-emerald-300/40 active:scale-95 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/25 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <div className="w-4 h-4 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                  +
                </div>
                <span className="tracking-tight text-slate-950 font-black">{t('reportIssue')}</span>
                <span className="bg-slate-950/90 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-black border border-emerald-400/40">
                  +10 Coins
                </span>
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

              <Link 
                to={profile?.role === 'official' || profile?.role === 'admin' ? '/department' : '/dashboard'} 
                className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full hover:bg-slate-700 transition-all text-slate-200"
              >
                {profile?.role === 'official' || profile?.role === 'admin' ? (
                  <Building2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-bold capitalize">
                  {profile?.role === 'official' || profile?.role === 'admin'
                    ? (profile?.displayName && profile.displayName !== 'Civic User' ? profile.displayName : 'Department Hub')
                    : profile?.displayName}
                </span>
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
              <Link to="/feed" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('feed')}</Link>
              <Link 
                to="/report" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-between bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/20"
              >
                <span>+ {t('reportIssue')}</span>
                <span className="bg-slate-950/80 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono">+10 Coins</span>
              </Link>
              <Link to="/map" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('map')}</Link>
              <Link to="/analytics" onClick={() => setIsOpen(false)} className="block text-slate-300">{t('analytics')}</Link>
              <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block text-slate-300">Leaderboard</Link>
              <Link to={profile?.role === 'official' || profile?.role === 'admin' ? '/department' : '/dashboard'} onClick={() => setIsOpen(false)} className="block text-slate-300">{t('profile')}</Link>
              <button onClick={handleLogout} className="block w-full text-left text-red-400 font-bold">Sign Out</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
