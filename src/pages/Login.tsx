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
import { deriveDisplayName } from '../utils/nameUtils';
import {
  ShieldCheck,
  User,
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  Sparkles,
  Zap,
  Truck,
  Droplets,
  GraduationCap,
  HeartPulse,
  KeyRound,
  LockKeyhole
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const OFFICIAL_PRESETS = [
  { id: 'municipal', name: 'Municipal Administration', email: 'municipal@civix.gov.in', pass: 'Muni@2026', deptId: 'municipal', role: 'official', icon: Building2, color: 'text-emerald-400' },
  { id: 'transport', name: 'Road Transport', email: 'transport@civix.gov.in', pass: 'Trans@2026', deptId: 'transport', role: 'official', icon: Truck, color: 'text-cyan-400' },
  { id: 'electricity', name: 'Electricity Board', email: 'electricity@civix.gov.in', pass: 'Elec@2026', deptId: 'electricity', role: 'official', icon: Zap, color: 'text-amber-400' },
  { id: 'water', name: 'Water Works', email: 'water@civix.gov.in', pass: 'Water@2026', deptId: 'water', role: 'official', icon: Droplets, color: 'text-blue-400' },
  { id: 'education', name: 'Education Department', email: 'education@civix.gov.in', pass: 'Edu@2026', deptId: 'education', role: 'official', icon: GraduationCap, color: 'text-purple-400' },
  { id: 'health', name: 'Health Department', email: 'health@civix.gov.in', pass: 'Health@2026', deptId: 'health', role: 'official', icon: HeartPulse, color: 'text-rose-400' },
  { id: 'admin', name: 'Central Admin Portal', email: 'admin@civix.gov.in', pass: 'Admin@2026', deptId: 'municipal', role: 'admin', icon: ShieldCheck, color: 'text-emerald-400' }
];

export default function Login() {
  const { t } = useLanguage();
  const { user: authUser, setProfile } = useAuth();
  const navigate = useNavigate();

  const [portalType, setPortalType] = useState<'citizen' | 'official' | 'admin'>('citizen');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [selectedPresetId, setSelectedPresetId] = useState<string>('municipal');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activePreset = OFFICIAL_PRESETS.find(p => p.id === (portalType === 'admin' ? 'admin' : selectedPresetId)) || OFFICIAL_PRESETS[0];

  // Helper to ensure profile exists and navigate directly to destination panel
  const ensureUserProfileAndNavigate = async (user: any, nameOverride?: string) => {
    let profileData: any = null;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const cleanName = (nameOverride && nameOverride.trim() !== '' && nameOverride !== 'Civic User')
        ? nameOverride.trim()
        : deriveDisplayName(user.displayName, user.email);

      if (!userDoc.exists()) {
        profileData = {
          displayName: cleanName,
          email: user.email,
          photoUrl: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=10b981&color=fff`,
          role: portalType === 'citizen' ? 'citizen' : (activePreset?.role || 'official'),
          departmentId: portalType === 'citizen' ? null : (activePreset?.deptId || 'municipal'),
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profileData, { merge: true });
      } else {
        const existing = userDoc.data();
        const finalName = (nameOverride && nameOverride.trim() !== '' && nameOverride !== 'Civic User')
          ? nameOverride.trim()
          : deriveDisplayName(existing.displayName || user.displayName, user.email);
        
        profileData = {
          ...existing,
          displayName: finalName,
          photoUrl: existing.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=10b981&color=fff`
        };

        if (existing.displayName !== finalName) {
          await setDoc(userDocRef, {
            displayName: finalName,
            photoUrl: profileData.photoUrl,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }
      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      console.warn('Could not update profile document in Firestore:', err);
    } finally {
      const isOfficialOrAdmin = profileData?.role === 'official' || profileData?.role === 'admin' || portalType === 'official' || portalType === 'admin';
      const targetPath = isOfficialOrAdmin ? '/department' : '/feed';
      navigate(targetPath, { replace: true });
    }
  };

  useEffect(() => {
    if (authUser) {
      ensureUserProfileAndNavigate(authUser);
    }
  }, [authUser]);

  const formatAuthError = (err: any): string => {
    if (!err || !err.code) return err?.message || 'Authentication failed. Please try again.';
    switch (err.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address. Please sign up or click 1-Click Auto-Fill.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Click 1-Click Auto-Fill to sign in automatically.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
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
    if (portalType !== 'citizen') {
      setError('Google Sign-In is restricted for Official and Admin portals. Please use 1-Click Auto-Fill & Sign In.');
      return;
    }
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

  // 1-Click Auto-Fill & Sign In for Officials
  const handleAutoFillAndLogin = async (preset = activePreset) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setLoading(true);
    setError(null);

    try {
      let user: any = null;
      try {
        const res = await signInWithEmailAndPassword(auth, preset.email, preset.pass);
        user = res.user;
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          const res = await createUserWithEmailAndPassword(auth, preset.email, preset.pass);
          user = res.user;
          await updateProfile(user, { displayName: preset.name });
        } else {
          throw err;
        }
      }

      // Upsert official user document
      const officialProfile = {
        displayName: preset.name,
        email: preset.email,
        role: preset.role,
        departmentId: preset.deptId,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(preset.name)}&background=10b981&color=fff`,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), officialProfile, { merge: true });
      setProfile(officialProfile);

      navigate('/department', { replace: true });
    } catch (err: any) {
      console.error("Auto-fill login failed:", err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative font-sans text-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 my-8 space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-2xl backdrop-blur-md text-emerald-400"
          >
            <ShieldCheck className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight text-white">{t('appName')}</h1>
          <p className="text-slate-400 text-xs font-medium mt-1">{t('tagline')}</p>
        </div>

        {/* Portal Switcher */}
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex text-xs font-extrabold shadow-xl">
          <button
            onClick={() => { setPortalType('citizen'); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${portalType === 'citizen' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            👤 Citizen Portal
          </button>
          <button
            onClick={() => { setPortalType('official'); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${portalType === 'official' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            🏛️ Department Hub
          </button>
          <button
            onClick={() => { setPortalType('admin'); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${portalType === 'admin' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            🛡️ Central Admin
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-5"
        >
          {portalType === 'citizen' ? (
            <>
              {/* Citizen Auth Mode Switcher */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl relative border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${authMode === 'signin' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
                >
                  {t('login')}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${authMode === 'signup' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
                >
                  {t('register')}
                </button>
              </div>

              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-red-400 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={authMode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">{t('fullName')}</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">{t('email')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">{t('password')}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all text-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{authMode === 'signin' ? t('login') : t('register')}</span>}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-900 px-3 text-slate-500 font-bold">Or</span></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-slate-950 border border-slate-800 py-3 rounded-2xl font-extrabold text-xs text-slate-200 hover:border-slate-700 transition-all"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                {t('signInGoogle')}
              </button>
            </>
          ) : (
            /* OFFICIAL & ADMIN PORTAL WORKFLOW */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-400">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Pre-Configured Official Portal Credentials</span>
              </div>

              {portalType === 'official' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Department Portal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {OFFICIAL_PRESETS.filter(p => p.role === 'official').map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${selectedPresetId === preset.id
                          ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                      >
                        <preset.icon className={`w-4 h-4 shrink-0 ${preset.color}`} />
                        <span className="text-[11px] font-extrabold truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Official Credentials Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white flex items-center gap-1.5">
                    <activePreset.icon className={`w-4 h-4 ${activePreset.color}`} />
                    {activePreset.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SEEDED</span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Email:</span>
                    <span className="text-white font-bold">{activePreset.email}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Password:</span>
                    <span className="text-white font-bold">{activePreset.pass}</span>
                  </div>
                </div>
              </div>

              {/* 1-Click Auto-Fill & Sign In Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAutoFillAndLogin(activePreset)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all text-xs uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-slate-950" />}
                ⚡ 1-Click Auto-Fill & Sign In
              </button>

              {/* Google Login Restriction Notice */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center gap-2 text-[10px] text-slate-400">
                <LockKeyhole className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Google Sign-In is restricted for Official and Admin portals. Use 1-Click Auto-Fill above.</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
