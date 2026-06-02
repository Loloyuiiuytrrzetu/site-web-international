"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "restaurateur" | "walletiz";

export type Session = {
  email: string;
  role: Role;
  restaurantId?: string;
} | null;

type State = {
  session: Session;
  login: (email: string, password: string) => { ok: boolean; role?: Role };
  logout: () => void;
};

// MOCK AUTH — à remplacer par Supabase
// Comptes de démo :
//   - super admin : admin@walletiz.com / walletiz
//   - restaurateur : resto@walletiz.com / resto
const MOCK_USERS: Record<string, { password: string; role: Role; restaurantId?: string }> = {
  "admin@walletiz.com": { password: "walletiz", role: "walletiz" },
  "resto@walletiz.com": {
    password: "resto",
    role: "restaurateur",
    restaurantId: "demo-il-piatto",
  },
};

export const useAuth = create<State>()(
  persist(
    (set) => ({
      session: null,
      login: (email, password) => {
        const user = MOCK_USERS[email.toLowerCase().trim()];
        if (!user || user.password !== password) return { ok: false };
        set({
          session: {
            email: email.toLowerCase().trim(),
            role: user.role,
            restaurantId: user.restaurantId,
          },
        });
        return { ok: true, role: user.role };
      },
      logout: () => set({ session: null }),
    }),
    { name: "walletiz-auth" }
  )
);
