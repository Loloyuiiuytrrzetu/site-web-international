// Petites fonctions d'affichage réutilisées partout.

type NamedCustomer = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

/** Nom lisible d'un client à partir de prénom / nom / email. */
export function customerName(c: NamedCustomer): string {
  const full = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return full || c.email || "Client";
}

/** Initiales pour les pastilles/avatars (ex: "Julie Martin" -> "JM"). */
export function initials(c: NamedCustomer): string {
  const a = c.firstName?.[0] ?? "";
  const b = c.lastName?.[0] ?? "";
  const res = (a + b).toUpperCase();
  return res || (c.email?.[0]?.toUpperCase() ?? "?");
}
