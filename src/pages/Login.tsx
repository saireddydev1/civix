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
import { DEPARTMENTS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  Truck, 
  Zap, 
  Droplets, 
  GraduationCap, 
  Loader2, 
  HeartPulse, 
  Mail, 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { t } = useLanguage();
  const { user: authUser, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  
  // step 1: Login / Signup form, step 3: Role Selection
  const [step, setStep] = useState(1); 
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [tempUser, setTempUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // If user is logged in but has no profile saved in Firestore, jump to step 3 (Role Selection)
  useEffect(() => {
    if (authUser && !authProfile) {
      setTempUser(authUser);
      setStep(3);
    }
  }, [authUser, authProfile]);

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
      const user = result.user;
      setTempUser(user);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data && data.role) {
          navigate('/', { replace: true });
          return;
        }
      }
      setStep(3);
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

      setTempUser({
        ...user,
        displayName: fullName.trim() || user.displayName || 'User'
      });

      setStep(3);
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
      const user = result.user;
      setTempUser(user);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data && data.role) {
          navigate('/', { replace: true });
          return;
        }
      }
      setStep(3);
    } catch (err: any) {
      console.error('Google login failed:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (role: string, deptId?: string) => {
    if (!tempUser) return;
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', tempUser.uid));
      const existingData = userDoc.exists() ? userDoc.data() : {};

      const profileData = {
        displayName: tempUser.displayName || fullName || 'Civic User',
        email: tempUser.email,
        photoUrl: tempUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(tempUser.displayName || fullName || 'User')}&background=10b981&color=fff`,
        role: role,
        departmentId: deptId || null,
        updatedAt: new Date().toISOString(),
        createdAt: existingData.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, 'users', tempUser.uid), profileData, { merge: true });
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err?.message || 'Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDeptIcon = (id: string) => {
    switch (id) {
      case 'municipal': return <Building2 className="w-6 h-6" />;
      case 'transport': return <Truck className="w-6 h-6" />;
      case 'electricity': return <Zap className="w-6 h-6" />;
      case 'water': return <Droplets className="w-6 h-6" />;
      case 'education': return <GraduationCap className="w-6 h-6" />;
      case 'health': return <HeartPulse className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
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

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
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
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/40"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center text-zinc-800">{t('selectPortal')}</h2>
              <p className="text-zinc-500 text-sm text-center mb-6">Choose how you want to access CIVIX OS today.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium text-left">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleRoleSelection('citizen')}
                  disabled={loading}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all group text-left disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                    <User className="w-6 h-6 text-zinc-600 group-hover:text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-zinc-900">{t('citizenLogin')}</div>
                    <div className="text-xs text-zinc-500">{t('citizenDesc')}</div>
                  </div>
                </button>

                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-100" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-zinc-400 font-bold tracking-widest">{t('deptAccess')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {DEPARTMENTS.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => handleRoleSelection('official', dept.id)}
                      disabled={loading}
                      className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-zinc-50 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all group text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                        {getDeptIcon(dept.id)}
                      </div>
                      <div className="font-bold text-sm text-zinc-900">{dept.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
