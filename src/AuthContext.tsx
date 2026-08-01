import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, onAuthStateChanged, db, doc, getDoc } from './firebase';

interface AuthContextType {
  user: any;
  loading: boolean;
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profile: null,
  setProfile: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
          } else {
            setProfile({
              displayName: currentUser.displayName || 'Civic User',
              email: currentUser.email,
              photoUrl: currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=10b981&color=fff`,
              role: 'citizen',
              departmentId: null
            });
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          setProfile({
            displayName: currentUser.displayName || 'Civic User',
            email: currentUser.email,
            role: 'citizen',
            departmentId: null
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
