// URL publique de base du site.
//
// Les QR codes doivent encoder une URL ABSOLUE (sinon le téléphone du client
// ne sait pas quel site ouvrir). On lit donc le domaine depuis l'environnement.
//
// - NEXT_PUBLIC_BASE_URL : à définir si on a un domaine perso (ex: https://walletiz.app)
// - VERCEL_PROJECT_PRODUCTION_URL : fourni automatiquement par Vercel en prod
// - sinon localhost en développement.
export function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
