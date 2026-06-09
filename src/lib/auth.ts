// Authentification du COMMERÇANT (espace scanner / dashboard / personnalisation).
//
// Volontairement simple et sans dépendance externe : on utilise le module
// `crypto` de Node pour hacher les mots de passe (scrypt) et signer le cookie
// de session (HMAC). Le cookie contient l'id du commerce, signé pour qu'il ne
// puisse pas être falsifié.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// Réexport pour les appelants qui importent depuis "@/lib/auth".
export { hashPassword, verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "wlz_session";

// Secret de signature. À définir dans les variables d'environnement Vercel
// (AUTH_SECRET) pour la production. Une valeur par défaut permet de fonctionner
// immédiatement en démo.
const SECRET = process.env.AUTH_SECRET ?? "walletiz-dev-secret-change-me";

/** Signe une valeur (HMAC) -> "valeur.signature". */
export function sign(value: string): string {
  const sig = createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${sig}`;
}

/** Vérifie une valeur signée ; renvoie la valeur si valide, sinon null. */
export function unsign(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", SECRET).update(value).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

/** Id du commerce connecté (depuis le cookie), ou null. */
export async function getSessionBusinessId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return unsign(raw);
}

/** Le commerce connecté chargé depuis la base, ou null. */
export async function getSessionBusiness() {
  const id = await getSessionBusinessId();
  if (!id) return null;
  return prisma.business.findUnique({ where: { id } });
}

/**
 * À appeler en haut des pages protégées (scanner, dashboard…).
 * Redirige vers /login si le commerçant n'est pas connecté.
 */
export async function requireBusiness() {
  const business = await getSessionBusiness();
  if (!business) redirect("/login");
  return business;
}
