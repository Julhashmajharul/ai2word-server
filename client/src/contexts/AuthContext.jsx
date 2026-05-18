import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from '../config/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const res = await authAPI.getProfile();
          setUserProfile(res.data.user);
        } catch {
          // User exists in Firebase but not in our DB yet — this is fine on first load
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /** Sign up with email + password, then register in our backend */
  async function signUp({ email, password, name, phone, occupation, gender, country }) {
    const fbResult = await createUserWithEmailAndPassword(auth, email, password);
    const res = await authAPI.signup({
      name, email, phone, occupation, gender, country,
      firebase_uid: fbResult.user.uid,
      auth_provider: 'email',
    });
    setUserProfile(res.data.user);
    return res.data;
  }

  /** Log in with email + password */
  async function logIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
    const res = await authAPI.getProfile();
    setUserProfile(res.data.user);
    return res.data;
  }

  /** 1-click Google sign-in */
  async function signInWithGoogle() {
    const fbResult = await signInWithPopup(auth, googleProvider);
    const fbUser = fbResult.user;
    try {
      // Try to get existing profile
      const res = await authAPI.getProfile();
      setUserProfile(res.data.user);
    } catch {
      // New Google user — register in our backend
      const res = await authAPI.googleAuth({
        firebase_uid: fbUser.uid,
        name: fbUser.displayName || '',
        email: fbUser.email || '',
        photo_url: fbUser.photoURL || '',
        auth_provider: 'google',
      });
      setUserProfile(res.data.user);
    }
    return fbUser;
  }

  /** Sign out */
  async function logOut() {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUserProfile(null);
  }

  /** Refresh profile from backend */
  async function refreshProfile() {
    try {
      const res = await authAPI.getProfile();
      setUserProfile(res.data.user);
    } catch {
      // ignore
    }
  }

  const value = {
    firebaseUser,
    user: userProfile,
    loading,
    isAuthenticated: !!firebaseUser,
    signUp,
    logIn,
    signInWithGoogle,
    logOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
