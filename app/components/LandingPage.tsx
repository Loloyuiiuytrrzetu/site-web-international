"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  Languages,
  Palette,
  QrCode,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { WALLETIZ_BRAND } from "@/lib/brand";

const BRAND = WALLETIZ_BRAND.colors.primary;
const BRAND_DARK = WALLETIZ_BRAND.colors.primaryDark;
const BRAND_LIGHT = WALLETIZ_BRAND.colors.primaryLight;

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-neutral-900">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={WALLETIZ_BRAND.logoUrl}
            alt="Walletiz"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg"
            priority
          />
          <span className="text-lg font-bold tracking-tight">Walletiz</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
          <a href="#features" className="hover:text-neutral-900">Fonctionnalités</a>
          <a href="#pricing" className="hover:text-neutral-900">Tarifs</a>
          <Link href="/r/il-piatto" className="hover:text-neutral-900">Démo</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95"
            style={{ backgroundColor: BRAND }}
          >
            Démarrer
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(165deg, ${BRAND_DARK} 0%, ${BRAND} 60%, ${BRAND_LIGHT} 100%)`,
      }}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles size={12} /> Nouveau · vue 3D des plats
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Le menu digital qui fait{" "}
              <span className="bg-gradient-to-r from-rose-100 to-white bg-clip-text text-transparent">
                vendre plus
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
              Vos clients scannent un QR code à table, découvrent votre carte en
              photos haute définition, et peuvent même voir vos plats en 3D.
              Aucune appli à télécharger.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-neutral-900 shadow-lg transition active:scale-95"
              >
                Démarrer gratuitement
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/r/il-piatto"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Smartphone size={16} />
                Voir un menu démo
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/70">
              Aucune carte bancaire requise. Configuration en 5 minutes.
            </p>
          </div>

          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[380px]">
      <div className="relative rounded-[3rem] bg-neutral-950 p-3 shadow-2xl">
        <div className="absolute left-1/2 top-3 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-neutral-950" />
        <div className="overflow-hidden rounded-[2.5rem] bg-neutral-50" style={{ aspectRatio: "9/19" }}>
          <iframe
            src="/r/il-piatto"
            title="Aperçu menu Walletiz"
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
      </div>

      <div className="absolute -right-6 -top-6 rotate-12 rounded-2xl bg-white p-3 shadow-xl ring-4 ring-white/40">
        <QrCode size={48} className="text-neutral-900" />
        <p className="mt-1 text-center text-[9px] font-bold text-neutral-700">
          Scan QR
        </p>
      </div>

      <div className="absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 shadow-xl">
        <Box size={14} style={{ color: BRAND }} />
        <span className="text-xs font-bold text-neutral-900">Vue 3D</span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: QrCode,
    title: "Un QR code par table",
    desc: "Imprimez et posez sur vos tables. Vos clients scannent et accèdent au menu en 1 seconde.",
  },
  {
    icon: Box,
    title: "Vue 3D des plats",
    desc: "Vos plats vedettes en rotation 3D. Faites saliver vos clients comme jamais auparavant.",
  },
  {
    icon: Smartphone,
    title: "100% sans appli",
    desc: "Fonctionne directement dans le navigateur du téléphone. Aucun téléchargement, aucune friction.",
  },
  {
    icon: Palette,
    title: "À votre image",
    desc: "Couleurs, logo, photos, slogan. Personnalisez tout en quelques clics pour matcher votre identité.",
  },
  {
    icon: Languages,
    title: "8 langues incluses",
    desc: "Vos clients étrangers découvrent votre carte dans leur langue. Adieu les malentendus.",
  },
  {
    icon: Sparkles,
    title: "Mises à jour en direct",
    desc: "Plat épuisé ? Nouveau menu ? Vous modifiez, vos clients voient immédiatement.",
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND }}>
            Fonctionnalités
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Tout ce qu&apos;il faut pour briller en salle
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Walletiz remplace votre carte papier par une expérience digitale moderne, élégante et personnalisée.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${BRAND}15`, color: BRAND }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: "Starter",
    price: 19,
    desc: "Pour démarrer",
    features: ["1 menu digital", "Jusqu'à 50 plats", "Photos HD", "4 langues", "QR code illimité"],
  },
  {
    name: "Pro",
    price: 39,
    desc: "Le plus populaire",
    featured: true,
    features: ["Tout Starter, plus :", "Plats illimités", "Vue 3D des plats", "8 langues", "Statistiques", "Support prioritaire"],
  },
  {
    name: "Enterprise",
    price: 99,
    desc: "Pour les chaînes",
    features: ["Tout Pro, plus :", "Multi-établissements", "Domaine personnalisé", "Branding sur mesure", "Support dédié 24/7"],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND }}>
            Tarifs
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Simple, transparent, sans engagement
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Choisissez le plan qui correspond à votre restaurant. Changez à tout moment.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border bg-white p-6 ${
                p.featured ? "shadow-xl" : "border-neutral-200 shadow-sm"
              }`}
              style={p.featured ? { borderColor: BRAND } : undefined}
            >
              {p.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Recommandé
                </span>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-neutral-500">{p.desc}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price} €</span>
                <span className="text-sm text-neutral-500">/mois</span>
              </p>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
                    <span className="text-neutral-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition active:scale-95 ${
                  p.featured ? "text-white shadow-lg" : "border border-neutral-300 text-neutral-900 hover:bg-neutral-50"
                }`}
                style={p.featured ? { backgroundColor: BRAND } : undefined}
              >
                Commencer
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div
          className="overflow-hidden rounded-3xl p-10 text-center text-white shadow-xl sm:p-14"
          style={{
            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
          }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Prêt à moderniser votre carte ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/85">
            Rejoignez les restaurants qui ont déjà fait le choix d&apos;un menu digital qui impressionne.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-neutral-900 shadow-lg transition active:scale-95"
          >
            Démarrer maintenant <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-600 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src={WALLETIZ_BRAND.logoUrl}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 rounded"
          />
          <span>© {new Date().getFullYear()} Walletiz · Tous droits réservés</span>
        </div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-neutral-900">Confidentialité</a>
          <a href="#" className="hover:text-neutral-900">CGU</a>
          <a href="mailto:contact@walletiz.com" className="hover:text-neutral-900">Contact</a>
        </div>
      </div>
    </footer>
  );
}
