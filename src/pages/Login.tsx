import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from '../firebase';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { 
  ShieldCheck, 
  User, 
  Loader2, 
  Mail, 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Helper to ensure profile exists and navigate directly to dashboard
  const ensureUserProfileAndNavigate = async (user: any, nameOverride?: string) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        const profileData = {
          displayName: nameOverride || user.displayName || 'Civic User',
          email: user.email,
          photoUrl: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOverride || user.displayName || 'User')}&background=10b981&color=fff`,
          role: 'citizen',
          departmentId: null,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profileData, { merge: true });
      }
    } catch (err) {
      console.warn('Could not update profile document in Firestore:', err);
    } finally {
      navigate('/', { replace: true });
    }
  };

  // If user is already logged in, navigate straight to dashboard
  useEffect(() => {
    if (authUser) {
      ensureUserProfileAndNavigate(authUser);
    }
  }, [authUser]);

  const formatAuthError = (err: any): string => {
    if (!err || !err.code) return err?.message || 'Authentication failed. Please try again.';
    switch (err.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address. Please sign up first.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by your browser. Please allow popups or use email login.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Authentication settings.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return err.message || 'An error occurred during authentication.';
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      await ensureUserProfileAndNavigate(result.user);
    } catch (err: any) {
      console.error('Email sign in failed:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;

      if (fullName.trim()) {
        await updateProfile(user, { displayName: fullName.trim() });
      }

      await ensureUserProfileAndNavigate(user, fullName.trim());
    } catch (err: any) {
      console.error('Sign up failed:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfileAndNavigate(result.user);
    } catch (err: any) {
      console.error('Google login failed:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4 overflow-hidden relative font-sans">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 my-8">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 bg-white/95 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl backdrop-blur-md"
          >
            <ShieldCheck className="text-emerald-600 w-12 h-12" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-md">{t('appName')}</h1>
          <p className="text-emerald-100 font-medium mt-2 opacity-95">{t('tagline')}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/40"
        >
          {/* Tab Switcher */}
          <div className="flex bg-zinc-100/80 p-1.5 rounded-2xl mb-6 relative">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all relative z-10 ${
                authMode === 'signin' ? 'text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {authMode === 'signin' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
              {t('login')}
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all relative z-10 ${
                authMode === 'signup' ? 'text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {authMode === 'signup' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
              {t('register')}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-red-50/90 border border-red-200/80 rounded-2xl flex items-start gap-3 text-left"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 font-medium leading-relaxed">
                {error}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={authMode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-50/80 border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50/80 border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-50/80 border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'signin' ? t('login') : t('register')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/95 px-3 text-zinc-400 font-semibold tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-zinc-200/80 py-3.5 rounded-2xl font-bold text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-900 transition-all shadow-sm disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            {t('signInGoogle')}
          </button>

          <p className="mt-6 text-center text-xs text-zinc-400 font-medium">
            Secure Firebase authentication with encrypted data store
          </p>
        </motion.div>
      </div>
    </div>
  );
}
