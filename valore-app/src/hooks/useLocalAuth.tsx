import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../lib/database';
import { getProfile, createProfile, updateProfile } from '../lib/localApi';
import type { Profile } from '../types/db';

const AUTH_KEY = '@valore_user_id';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Simple local user store (email -> userId mapping)
const getUserStore = async (): Promise<Record<string, { id: string; password: string }>> => {
  const data = await AsyncStorage.getItem('@valore_users');
  return data ? JSON.parse(data) : {};
};

const saveUserStore = async (store: Record<string, { id: string; password: string }>) => {
  await AsyncStorage.setItem('@valore_users', JSON.stringify(store));
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile for a user
  const loadProfile = async (userId: string) => {
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Refresh profile from database
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem(AUTH_KEY);
        if (storedUserId && isMounted) {
          const userData = JSON.parse(storedUserId);
          setUser(userData);
          await loadProfile(userData.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sign up
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const store = await getUserStore();

      // Check if email already exists
      if (store[email]) {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const userId = generateId();
      store[email] = { id: userId, password };
      await saveUserStore(store);

      // Create profile in database
      await createProfile(userId, { username: null, full_name: null });

      // Set current user
      const userData = { id: userId, email };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      await loadProfile(userId);
    } finally {
      setLoading(false);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const store = await getUserStore();

      // Check credentials
      const userRecord = store[email];
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Set current user
      const userData = { id: userRecord.id, email };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      await loadProfile(userRecord.id);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
