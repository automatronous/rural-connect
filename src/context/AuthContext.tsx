import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { fetchProfile } from '../lib/data';
import { supabase } from '../lib/supabase';
import type { Profile, Role } from '../lib/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
    role: Role;
    age?: number | null;
    bloodGroup?: string | null;
  }) => Promise<User | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  supabase: typeof supabase;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = useCallback((nextProfile: Profile | null) => {
    setProfile(nextProfile);
    setRole(nextProfile?.role ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      applyProfile(null);
      return;
    }

    const nextProfile = await fetchProfile(user.id);
    applyProfile(nextProfile);
  }, [applyProfile, user]);

  useEffect(() => {
    let mounted = true;

    async function hydrateSession() {
      const { data } = await supabase.auth.getSession();
      const nextSession = data.session;
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const nextProfile = await fetchProfile(nextSession.user.id);
        if (!mounted) return;
        applyProfile(nextProfile);
      } else {
        applyProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    void hydrateSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const nextProfile = await fetchProfile(nextSession.user.id);
        applyProfile(nextProfile);
      } else {
        applyProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (!data.user) {
        throw new Error('Sign in succeeded without a user session.');
      }

      const { data: profileRole } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      setSession(data.session);
      setUser(data.user);
      setRole((profileRole?.role as Role | undefined) ?? null);

      const nextProfile = await fetchProfile(data.user.id);
      applyProfile(nextProfile);

      return data.user;
    },
    [applyProfile],
  );

  const signUp = useCallback(
    async (input: {
      email: string;
      password: string;
      name: string;
      role: Role;
      age?: number | null;
      bloodGroup?: string | null;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            role: input.role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: input.email,
          name: input.name,
          role: input.role,
          age: input.age ?? null,
          blood_group: input.bloodGroup ?? null,
        });

        if (profileError) throw profileError;

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          const nextProfile = await fetchProfile(data.user.id);
          applyProfile(nextProfile);
        }
      }

      return data.session ? data.user ?? null : null;
    },
    [applyProfile],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
    applyProfile(null);
  }, [applyProfile]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      supabase,
    }),
    [loading, profile, refreshProfile, role, session, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
