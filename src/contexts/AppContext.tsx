import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import type { AppRole } from "@/types/studio";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  company?: string;
}

interface AppContextType {
  user: AppUser | null;

  login: (
    email: string,
    password: string
  ) => Promise<AppUser | null>;

  logout: () => Promise<void>;

  cursorMode: "default" | "view" | "enter";

  setCursorMode: (
    mode: "default" | "view" | "enter"
  ) => void;

  loading: boolean;
}

const AppContext =
  createContext<AppContextType | null>(null);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AppUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [cursorMode, setCursorMode] =
    useState<
      "default" | "view" | "enter"
    >("default");

  // ─────────────────────────────────────────────
  // LOAD USER PROFILE
  // ─────────────────────────────────────────────

  const loadUserProfile = async (
    userId: string,
    email: string
  ): Promise<AppUser | null> => {
    if (!supabase) return null;

    try {
      const {
        data: profile,
        error,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, role"
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error(
          "Profile load error:",
          error
        );

        return null;
      }

      if (!profile) {
        console.warn(
          "Authenticated user has no profile:",
          userId
        );

        return null;
      }

      const appUser: AppUser = {
        id: profile.id,

        name:
          profile.full_name ||
          email.split("@")[0],

        email,

        role: profile.role as AppRole,
      };

      setUser(appUser);

      return appUser;
    } catch (error) {
      console.error(
        "Unexpected profile error:",
        error
      );

      return null;
    }
  };

  // ─────────────────────────────────────────────
  // RESTORE SESSION
  // ─────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      if (!supabase) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          await loadUserProfile(
            session.user.id,
            session.user.email ?? ""
          );
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Session restore error:",
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          await loadUserProfile(
            session.user.id,
            session.user.email ?? ""
          );
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────

  const login = async (
    email: string,
    password: string
  ): Promise<AppUser | null> => {
    if (!supabase) {
      console.error(
        "Supabase is not configured."
      );

      return null;
    }

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error(
          "Supabase login error:",
          error
        );

        return null;
      }

      if (!data.user) {
        return null;
      }

      const profile =
        await loadUserProfile(
          data.user.id,
          data.user.email ?? email
        );

      if (!profile) {
        await supabase.auth.signOut();

        return null;
      }

      return profile;
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return null;
    }
  };

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        cursorMode,
        setCursorMode,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used within AppProvider"
    );
  }

  return context;
}