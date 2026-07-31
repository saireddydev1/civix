import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, db, doc, setDoc, getDoc, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '../firebase';
import { DEPARTMENTS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { ShieldCheck, User, Building2, Truck, Zap, Droplets, GraduationCap, Loader2, HeartPulse, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { t } = useLanguage();
  const { user: authUser, profile: authProfile } = useAuth();
  const [step, setStep] = useState(1); // 1: Google Login, 3: Role Selection
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // If user is logged in but has no profile, jump to step 3
  useEffect(() => {
    if (authUser && !authProfile) {
      setTempUser(authUser);
      setStep(3);
    }
  }, [authUser, authProfile]);

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
          window.location.href = '/';
          return;
        }
      }
      setStep(3);
    } catch (err: any) {
      console.error("Login failed", err);
      let message = "Google Login failed. ";
      if (err.code === 'auth/popup-blocked') {
        message += "Please allow popups for this site.";
      } else if (err.code === 'auth/unauthorized-domain') {
        message += "This domain is not authorized in Firebase. Please add it to the authorized domains list.";
      } else {
        message += err.message;
      }
      setError(message);
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
      
      const profile = {
        displayName: tempUser.displayName,
        email: tempUser.email,
        photoUrl: tempUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(tempUser.displayName || 'User')}&background=random`,
        role: role,
        departmentId: deptId || null,
        updatedAt: new Date().toISOString(),
        createdAt: existingData.createdAt || new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', tempUser.uid), profile, { merge: true });
      window.location.href = '/'; 
    } catch (error) {
      console.error("Profile update failed", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeptIcon = (id: string) => {
    switch(id) {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <ShieldCheck className="text-emerald-600 w-12 h-12" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">{t('appName')}</h1>
          <p className="text-emerald-50 font-medium mt-2 opacity-90">{t('tagline')}</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-8 text-center text-zinc-800">{t('login')} / {t('register')}</h2>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-600 font-medium">
                    {error}
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-zinc-100 py-4 rounded-2xl font-bold hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  {t('signInGoogle')}
                </button>
              </div>
              <p className="mt-6 text-center text-xs text-zinc-400 font-medium">
                Secure authentication powered by Google
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-2 text-center text-zinc-800">{t('selectPortal')}</h2>
              <p className="text-zinc-500 text-sm text-center mb-8">Choose how you want to access the platform today.</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleRoleSelection('citizen')}
                  disabled={loading}
                  className="flex items-center gap-4 p-5 rounded-3xl border-2 border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group disabled:opacity-50"
                >
                  <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <User className="w-7 h-7 text-zinc-600 group-hover:text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-zinc-900">{t('citizenLogin')}</div>
                    <div className="text-xs text-zinc-500">{t('citizenDesc')}</div>
                  </div>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-zinc-400 font-bold tracking-widest">{t('deptAccess')}</span></div>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {DEPARTMENTS.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => handleRoleSelection('official', dept.id)}
                      disabled={loading}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-50 hover:border-emerald-500 hover:bg-emerald-50 transition-all group disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        {getDeptIcon(dept.id)}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-zinc-900">{dept.name}</div>
                      </div>
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

