import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "admin" | "client" | null;

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
  logout: () => void;
  cursorMode: "default" | "view" | "enter";
  setCursorMode: (mode: "default" | "view" | "enter") => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEMO_USERS: AppUser[] = [
  { id: "1", name: "ORVEX Admin", email: "admin@orvex.studio", role: "admin" },
  { id: "2", name: "Marcus Webb", email: "marcus@axiom.tech", role: "client", company: "AXIOM Technologies" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [cursorMode, setCursorMode] = useState<"default" | "view" | "enter">("default");

  const login = async (email: string, _password: string): Promise<boolean> => {
    const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ user, login, logout, cursorMode, setCursorMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
