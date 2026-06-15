import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Role, User } from "@/lib/types";

const safeUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const DEMO = {
  email: "demo@gmail.com",
  password: "DEMO@123",
};

const ADMIN_DEMO = {
  email: "admin@gmail.com",
  password: "ADMIN@123",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("podify_user");
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (u: User | null) => {
    if (u) localStorage.setItem("podify_user", JSON.stringify(u));
    else localStorage.removeItem("podify_user");
    setUser(u);
  };

  const login: AuthCtx["login"] = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === DEMO.email && password === DEMO.password) {
      persist({
        id: "demo-1",
        name: "Demo User",
        email: DEMO.email,
        role: "listener",
        avatar: "https://i.pravatar.cc/150?img=33",
        bio: "Listener · Creator · Builder",
        followers: 1284,
      });
      return { ok: true };
    }
    if (cleanEmail === ADMIN_DEMO.email && password === ADMIN_DEMO.password) {
      persist({
        id: "admin-1",
        name: "System Admin",
        email: ADMIN_DEMO.email,
        role: "admin",
        avatar: "https://i.pravatar.cc/150?img=12",
        bio: "System Administrator",
        followers: 0,
      });
      return { ok: true };
    }
    // Accept any email/password >= 6 chars as mock
    if (email.includes("@") && password.length >= 6) {
      persist({
        id: safeUUID(),
        name: email.split("@")[0],
        email,
        role: "listener",
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        followers: 0,
      });
      return { ok: true };
    }
    return { ok: false, error: "Invalid credentials" };
  };

  const signup: AuthCtx["signup"] = async (name, email, password, role) => {
    if (!name || !email.includes("@") || password.length < 6) {
      return { ok: false, error: "Please fill all fields correctly (password 6+ chars)." };
    }
    persist({
      id: safeUUID(),
      name,
      email,
      role,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      followers: 0,
    });
    return { ok: true };
  };

  const logout = () => persist(null);

  const switchRole = (role: Role) => {
    if (!user) return;
    persist({ ...user, role });
  };

  return <Ctx.Provider value={{ user, login, signup, logout, switchRole }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
