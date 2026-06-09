import Link from "next/link";
import { BRAND } from "@/lib/brand";

// Landing page commerciale de Walletiz (destinée aux commerçants).
export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white text-neutral-900">
      {/* Barre de navigation */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between p-6">
        <span
          className="text-xl font-extrabold tracking-tight"
          style={{ color: BRAND.bordeaux }}
        >
          {BRAND.name}
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:underline">
            Espace pro
          </Link>
          <Link
            href="/login"
            className="btn rounded-lg px-4 py-2 font-semibold text-white"
            style={{ background: BRAND.bordeaux }}
          >
            Connexion
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 p-6 md:grid-cols-2">
        <div className="animate-fade-up">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "#f7e9ec", color: BRAND.bordeaux }}
          >
            Apple Wallet & Google Wallet
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            La carte de fidélité{" "}
            <span style={{ color: BRAND.bordeaux }}>digitale</span> de votre
            commerce.
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Restaurant, coiffeur, boutique… Fini les cartes papier perdues. Vos
            clients cumulent leurs tampons sur leur téléphone, et reviennent plus
            souvent.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="btn rounded-xl px-6 py-3 font-semibold text-white shadow-sm"
              style={{ background: BRAND.bordeaux }}
            >
              Essayer gratuitement
            </Link>
            <Link
              href="/login"
              className="btn rounded-xl border border-neutral-300 px-6 py-3 font-semibold"
            >
              Espace pro
            </Link>
          </div>
        </div>

        {/* Aperçu d'une carte */}
        <div className="flex justify-center">
          <div
            className="shimmer animate-float w-72 overflow-hidden rounded-3xl p-6 text-white shadow-2xl"
            style={{
              background: `linear-gradient(160deg, ${BRAND.bordeauxLight}, ${BRAND.bordeauxDark})`,
            }}
          >
            <p className="text-xs opacity-70">Carte de fidélité</p>
            <p className="text-xl font-bold">Chez Mario</p>
            <p className="mb-4 text-sm opacity-80">Carte café</p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-full border border-white/40 text-xs"
                  style={{
                    background: i < 3 ? "#fff" : "transparent",
                    color: i < 3 ? BRAND.bordeaux : "#fff",
                  }}
                >
                  {i === 9 ? "★" : i < 3 ? "✓" : ""}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs opacity-80">
              Plus que 7 tampons pour 1 café offert 🎁
            </p>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="mx-auto grid w-full max-w-5xl gap-6 p-6 md:grid-cols-3">
        {[
          {
            t: "Aucune app à installer",
            d: "Le client ajoute sa carte au Wallet de son téléphone en un clic.",
          },
          {
            t: "Mise à jour en temps réel",
            d: "Le tampon s'ajoute automatiquement après chaque passage.",
          },
          {
            t: "Vous fidélisez sans effort",
            d: "Relancez vos clients et suivez vos statistiques.",
          },
        ].map((f) => (
          <div
            key={f.t}
            className="lift rounded-2xl border border-neutral-200 p-5 shadow-sm"
          >
            <h3 className="font-bold" style={{ color: BRAND.bordeaux }}>
              {f.t}
            </h3>
            <p className="mt-1 text-sm text-neutral-600">{f.d}</p>
          </div>
        ))}
      </section>

      {/* Tarifs */}
      <section className="mx-auto w-full max-w-5xl p-6">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Un tarif simple, par commerce
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "Starter",
              p: "29€",
              f: ["1 commerce", "Carte à tampons", "Scanner QR"],
            },
            {
              n: "Pro",
              p: "49€",
              f: ["Tout Starter", "Apple/Google Wallet", "Statistiques avancées"],
              hot: true,
            },
            {
              n: "Multi",
              p: "99€",
              f: [
                "Plusieurs établissements",
                "Support prioritaire",
                "Marque personnalisée",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.n}
              className="lift rounded-2xl border p-6"
              style={{
                borderColor: plan.hot ? BRAND.bordeaux : "#e5e5e5",
                boxShadow: plan.hot
                  ? `0 10px 30px -10px ${BRAND.bordeaux}55`
                  : undefined,
              }}
            >
              <p className="font-bold">{plan.n}</p>
              <p
                className="my-2 text-3xl font-extrabold"
                style={{ color: BRAND.bordeaux }}
              >
                {plan.p}
                <span className="text-base font-normal text-neutral-500">
                  /mois
                </span>
              </p>
              <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                {plan.f.map((x) => (
                  <li key={x}>✓ {x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl p-6 text-sm text-neutral-400">
        © {new Date().getFullYear()} {BRAND.name} — Cartes de fidélité
        digitales.
      </footer>
    </div>
  );
}
