import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { auth, signOut } from './firebase';
import { ShieldCheck, LogOut, Menu, X, Plus, BarChart3, User as UserIcon, Loader2, Languages, Map as MapIcon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import Feed from './pages/Feed';
import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import DepartmentDashboard from './pages/DepartmentDashboard';
import CityMap from './pages/CityMap';
import Login from './pages/Login';

const Navbar = () => {
  const { user, profile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const handleLogout = () => signOut(auth);

  if (!user || !profile) return null;

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">{t('appName')}</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-zinc-600 hover:text-emerald-600 transition-colors">{t('feed')}</Link>
            <Link to="/report" className="flex items-center gap-1 text-zinc-600 hover:text-emerald-600 transition-colors">
              <Plus className="w-4 h-4" /> {t('reportIssue')}
            </Link>
            <Link to="/map" className="flex items-center gap-1 text-zinc-600 hover:text-emerald-600 transition-colors">
              <MapIcon className="w-4 h-4" /> {t('map')}
            </Link>
            <Link to="/analytics" className="flex items-center gap-1 text-zinc-600 hover:text-emerald-600 transition-colors">
              <BarChart3 className="w-4 h-4" /> {t('analytics')}
            </Link>
            {profile?.role === 'official' && (
              <Link to="/department" className="text-zinc-600 hover:text-emerald-600 transition-colors">Dept</Link>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowLang(!showLang)}
                className="flex items-center gap-1 text-zinc-600 hover:text-emerald-600 transition-colors"
              >
                <Languages className="w-4 h-4" />
                <span className="text-sm uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {showLang && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden"
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors ${language === lang.code ? 'text-emerald-600 font-bold' : 'text-zinc-600'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/dashboard" className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{profile?.displayName}</span>
            </Link>
            <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
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
            className="md:hidden bg-white border-t border-zinc-100 px-4 py-4 space-y-4"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="block text-zinc-600">{t('feed')}</Link>
            <Link to="/report" onClick={() => setIsOpen(false)} className="block text-zinc-600">{t('reportIssue')}</Link>
            <Link to="/map" onClick={() => setIsOpen(false)} className="block text-zinc-600">{t('map')}</Link>
            <Link to="/analytics" onClick={() => setIsOpen(false)} className="block text-zinc-600">{t('analytics')}</Link>
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-zinc-600">{t('profile')}</Link>
            <button onClick={handleLogout} className="block w-full text-left text-red-500">Sign Out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  if (!user || !profile) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/map" element={<CityMap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/department" element={<DepartmentDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
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
