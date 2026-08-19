import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PROJECT_LEAD"
  | "TEAM_MEMBER"
  | "CLIENT"
  | null;

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
}

interface AppContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  cursorMode: "default" | "view" | "enter";
  setCursorMode: (mode: "default" | "view" | "enter") => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [cursorMode, setCursorMode] = useState<
    "default" | "view" | "enter"
  >("default");

  // ------------------------------------------------------------
  // LOAD CURRENT SUPABASE SESSION
  // ------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email ?? "");
      }

      setLoading(false);
    };

    loadSession();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email ?? "");
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ------------------------------------------------------------
  // LOAD USER PROFILE
  // ------------------------------------------------------------

  const loadUserProfile = async (userId: string, email: string) => {
    if (!supabase) return;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Profile load error:", error);

        // Fallback user.
        setUser({
          id: userId,
          name: email.split("@")[0],
          email,
          role: "CLIENT",
        });

        return;
      }

      if (profile) {
        setUser({
          id: userId,
          name:
            profile.full_name ||
            profile.name ||
            email.split("@")[0],
          email,
          role: profile.role ?? "CLIENT",
          company: profile.company ?? undefined,
        });

        return;
      }

      // If authentication exists but profile does not exist yet.
      setUser({
        id: userId,
        name: email.split("@")[0],
        email,
        role: "CLIENT",
      });
    } catch (error) {
      console.error("Unexpected profile error:", error);

      setUser({
        id: userId,
        name: email.split("@")[0],
        email,
        role: "CLIENT",
      });
    }
  };

  // ------------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------------

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    if (!supabase) {
      console.error("Supabase is not configured.");
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Supabase login error:", error);
        return false;
      }

      if (!data.user) {
        return false;
      }

      await loadUserProfile(
        data.user.id,
        data.user.email ?? email
      );

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------

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
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }

  return ctx;
}