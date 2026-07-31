import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import { Loader2 } from 'lucide-react';

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
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import { Navbar } from './components/Navbar';
import Footer from './components/Footer';
import AICopilot from './components/AICopilot';

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const isPublicLanding = location.pathname === '/welcome' || location.pathname === '/landing';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      <div>
        {user && profile && !isPublicLanding && <Navbar />}
        <main className={isPublicLanding ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
          <Routes>
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<ContactUs />} />
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
      </div>

      {/* Global Footer & AI Copilot Assistant */}
      <Footer />
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

