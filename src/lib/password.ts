// Hachage de mot de passe — module PUR (aucune dépendance à Next).
// Importable aussi bien par le code serveur Next que par le script de seed.

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Hache un mot de passe en "sel:hash" (à stocker en base). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Vérifie un mot de passe en clair contre la valeur stockée. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}
