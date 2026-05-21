import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../lib/db';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  isChecking: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const loadProfile = async (currentUser: User) => {
    const profile = await getUserProfile(currentUser.uid);
    if (profile && profile.photoURL) {
      // Use Proxy to cleanly override photoURL without modifying the internal Firebase User object
      const updatedUser = new Proxy(currentUser, {
        get(target, prop) {
          if (prop === 'photoURL') return profile.photoURL;
          const value = target[prop as keyof typeof target];
          return typeof value === 'function' ? value.bind(target) : value;
        }
      });
      setUser(updatedUser);
    } else {
      setUser(currentUser);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(auth.currentUser as User);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        setUser(null);
      }
      setIsChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => {
    firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, isChecking, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
