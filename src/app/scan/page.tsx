import Link from "next/link";
import { requireBusiness } from "@/lib/auth";
import { QrScanner } from "@/components/QrScanner";

export const dynamic = "force-dynamic";

// SCANNER du commerçant : protégé par la connexion.
// Le commerçant vise le QR de la carte du client -> +1 tampon automatique.
export default async function ScanPage() {
  const business = await requireBusiness();

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:underline">
            ← Tableau de bord
          </Link>
          <h1 className="text-2xl font-bold">Scanner une carte</h1>
          <p className="text-sm text-neutral-500">{business.name}</p>
        </div>
      </header>

      <QrScanner />

      <div className="mt-6 text-center">
        <Link href="/caisse" className="text-sm text-neutral-500 underline">
          Caméra indisponible ? Saisie manuelle →
        </Link>
      </div>
    </main>
  );
}
