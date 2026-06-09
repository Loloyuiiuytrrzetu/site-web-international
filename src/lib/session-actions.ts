"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sign, verifyPassword } from "@/lib/auth";

/**
 * Connexion du commerçant.
 * Identifiant = `slug` du commerce, + mot de passe.
 * En cas de succès on pose un cookie de session signé.
 */
export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!slug || !password) {
    return { error: "Identifiant et mot de passe requis." };
  }

  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business || !business.passwordHash) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }
  if (!verifyPassword(password, business.passwordHash)) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, sign(business.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });

  redirect("/dashboard");
}

/** Déconnexion : on supprime le cookie de session. */
export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
