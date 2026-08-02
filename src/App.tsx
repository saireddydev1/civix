import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import { Loader2 } from 'lucide-react';

import { Navbar } from './components/Navbar';
import Footer from './components/Footer';

const Feed = lazy(() => import('./pages/Feed'));
const ReportIssue = lazy(() => import('./pages/ReportIssue'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const DepartmentDashboard = lazy(() => import('./pages/DepartmentDashboard'));
const CityMap = lazy(() => import('./pages/CityMap'));
const Login = lazy(() => import('./pages/Login'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AICopilot = lazy(() => import('./components/AICopilot'));

const RouteLoader = () => (
  <div className="flex items-center justify-center h-[40vh]">
    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
  </div>
);

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const isAuthenticated = Boolean(user && profile);
  const isPublicLanding = !isAuthenticated || location.pathname === '/home' || location.pathname === '/welcome' || location.pathname === '/landing';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      <div>
        {isAuthenticated && !isPublicLanding && <Navbar />}
        <main className={isPublicLanding ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/home" element={<LandingPage />} />
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<ContactUs />} />
              {!isAuthenticated ? (
                <>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/feed" element={<Navigate to="/home" replace />} />
                  <Route path="/report" element={<Navigate to="/home" replace />} />
                  <Route path="/map" element={<Navigate to="/home" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                  <Route path="/analytics" element={<Navigate to="/home" replace />} />
                  <Route path="/leaderboard" element={<Navigate to="/home" replace />} />
                  <Route path="/department" element={<Navigate to="/home" replace />} />
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
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Global Footer & AI Copilot Assistant */}
      <Footer />
      <Suspense fallback={null}>
        <AICopilot />
      </Suspense>
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
