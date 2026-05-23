import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import type { Role } from "@/lib/roles";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  role: Role;
  status: "pending" | "active" | "blocked";
  dob?: string;
  createdAt?: unknown;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(u: User, extras?: Partial<UserProfile>): Promise<UserProfile> {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { uid: u.uid, ...(snap.data() as Omit<UserProfile, "uid">) };
  }
  // First-ever user becomes super_admin automatically (bootstrap).
  // Subsequent users start as pending members.
  const usersCountSnap = await getDoc(doc(db, "_meta", "users_count")).catch(() => null);
  const isFirst = !usersCountSnap?.exists();
  const profile: UserProfile = {
    uid: u.uid,
    email: u.email ?? "",
    displayName: extras?.displayName ?? u.displayName ?? (u.email?.split("@")[0] ?? "Member"),
    photoURL: u.photoURL ?? undefined,
    role: isFirst ? "super_admin" : "member",
    status: isFirst ? "active" : "pending",
    createdAt: serverTimestamp(),
    ...extras,
  };
  await setDoc(ref, profile);
  if (isFirst) await setDoc(doc(db, "_meta", "users_count"), { bootstrapped: true });
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await ensureProfile(u);
          setProfile(p);
        } catch (e) {
          console.error("Failed to load profile", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) setProfile({ uid: user.uid, ...(snap.data() as Omit<UserProfile, "uid">) });
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    configured: isFirebaseConfigured,
    login: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signup: async (email, password, name) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await ensureProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
    },
    loginWithGoogle: async () => {
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureProfile(cred.user);
    },
    logout: async () => {
      await signOut(auth);
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email);
    },
    resendVerification: async () => {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser);
    },
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
