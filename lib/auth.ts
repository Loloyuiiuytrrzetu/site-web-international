"use client";

import { create } from "zustand";
import { supabase } from "./supabase";

export type Role = "restaurateur" | "walletiz";

export type Session = {
  userId: string;
  email: string;
  role: Role;
  restaurantId?: string;
} | null;

type LoginResult = { ok: true; role: Role } | { ok: false; error: string };

type State = {
  session: Session;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

async function loadProfile(
  userId: string
): Promise<{ role: Role; restaurantId?: string } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, restaurant_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("loadProfile error:", error);
    return null;
  }
  if (!data) return null;
  return {
    role: data.role as Role,
    restaurantId: data.restaurant_id ?? undefined,
  };
}

export const useAuth = create<State>((set) => ({
  session: null,
  loading: true,
  login: async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error || !data.user) {
      return {
        ok: false,
        error: error?.message ?? "Échec de la connexion.",
      };
    }
    const profile = await loadProfile(data.user.id);
    if (!profile) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error:
          "Aucun profil associé à ce compte. Contactez l'administrateur Walletiz.",
      };
    }
    set({
      session: {
        userId: data.user.id,
        email: data.user.email ?? cleanEmail,
        role: profile.role,
        restaurantId: profile.restaurantId,
      },
      loading: false,
    });
    return { ok: true, role: profile.role };
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, loading: false });
  },
  refresh: async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      set({ session: null, loading: false });
      return;
    }
    const profile = await loadProfile(user.id);
    if (!profile) {
      await supabase.auth.signOut();
      set({ session: null, loading: false });
      return;
    }
    set({
      session: {
        userId: user.id,
        email: user.email ?? "",
        role: profile.role,
        restaurantId: profile.restaurantId,
      },
      loading: false,
    });
  },
}));

if (typeof window !== "undefined") {
  void useAuth.getState().refresh();
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      useAuth.setState({ session: null, loading: false });
      return;
    }
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      void useAuth.getState().refresh();
    }
  });
}
