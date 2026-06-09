"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { createCampaign, deleteCampaign } from "@/lib/campaigns";

export type CampaignItem = {
  id: string;
  title: string;
  message: string;
  trigger: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
};

const TRIGGERS = [
  { value: "now", label: "Envoyer maintenant", icon: "🚀", hint: "La notification part tout de suite." },
  { value: "scheduled", label: "Programmer", icon: "⏰", hint: "Choisissez la date et l'heure d'envoi." },
  { value: "birthday", label: "Anniversaire", icon: "🎂", hint: "Envoyée automatiquement le jour de l'anniversaire de chaque client." },
] as const;

export function CampaignForm({
  campaigns,
  color,
}: {
  campaigns: CampaignItem[];
  color: string;
}) {
  const [state, formAction, pending] = useActionState(createCampaign, undefined);
  const [trigger, setTrigger] = useState<"now" | "scheduled" | "birthday">("now");
  const formRef = useRef<HTMLFormElement>(null);

  if (state?.ok && formRef.current) {
    formRef.current.reset();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Composer une campagne */}
      <form
        ref={formRef}
        action={formAction}
        className="space-y-4 rounded-2xl border border-neutral-200 p-5 shadow-sm sm:p-6"
      >
        <h2 className="font-bold">Nouvelle notification</h2>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Titre</span>
          <input name="title" className="input" placeholder="ex : Offre du week-end" required />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Message</span>
          <textarea
            name="message"
            className="input min-h-24 resize-y"
            placeholder="ex : -20% sur tout le menu ce samedi 🎉"
            required
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-medium">Quand l'envoyer ?</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {TRIGGERS.map((t) => (
              <label
                key={t.value}
                className="cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold transition-colors"
                style={{
                  borderColor: trigger === t.value ? color : "#d4d4d4",
                  background: trigger === t.value ? `${color}10` : "transparent",
                  color: trigger === t.value ? color : "#525252",
                }}
              >
                <input
                  type="radio"
                  name="trigger"
                  value={t.value}
                  checked={trigger === t.value}
                  onChange={() => setTrigger(t.value)}
                  className="sr-only"
                />
                <span className="block text-lg">{t.icon}</span>
                {t.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {TRIGGERS.find((t) => t.value === trigger)?.hint}
          </p>
        </div>

        {trigger === "scheduled" && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Date et heure</span>
            <input name="scheduledAt" type="datetime-local" className="input" required />
          </label>
        )}

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-green-600">✓ Campagne enregistrée !</p>}

        <button
          type="submit"
          disabled={pending}
          className="btn w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50"
          style={{ background: color }}
        >
          {pending
            ? "Enregistrement…"
            : trigger === "now"
              ? "Envoyer la notification"
              : trigger === "birthday"
                ? "Activer l'automatisation 🎂"
                : "Programmer l'envoi"}
        </button>
      </form>

      {/* Historique des campagnes */}
      <div>
        <h2 className="mb-3 font-bold">Vos campagnes</h2>
        {campaigns.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
            Aucune campagne pour l'instant.
          </p>
        )}
        <ul className="space-y-3">
          {campaigns.map((c) => (
            <CampaignRow key={c.id} campaign={c} color={color} />
          ))}
        </ul>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  sent: { label: "Envoyée", bg: "#dcfce7", fg: "#166534" },
  scheduled: { label: "Programmée", bg: "#fef9c3", fg: "#854d0e" },
  active: { label: "Automatique", bg: "#e0e7ff", fg: "#3730a3" },
  draft: { label: "Brouillon", bg: "#f5f5f5", fg: "#525252" },
};

function CampaignRow({ campaign, color }: { campaign: CampaignItem; color: string }) {
  const [pending, startTransition] = useTransition();
  const badge = STATUS_BADGE[campaign.status] ?? STATUS_BADGE.draft;

  function remove() {
    if (!confirm(`Supprimer « ${campaign.title} » ?`)) return;
    startTransition(() => {
      deleteCampaign(campaign.id);
    });
  }

  const when =
    campaign.trigger === "birthday"
      ? "🎂 chaque anniversaire"
      : campaign.scheduledAt
        ? `⏰ ${new Date(campaign.scheduledAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}`
        : campaign.sentAt
          ? `✅ ${new Date(campaign.sentAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}`
          : "";

  return (
    <li
      className={`lift rounded-2xl border border-neutral-200 p-4 transition-opacity ${
        pending ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{campaign.title}</p>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: badge.bg, color: badge.fg }}
            >
              {badge.label}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{campaign.message}</p>
          {when && <p className="mt-1 text-xs text-neutral-400">{when}</p>}
        </div>
        <button
          onClick={remove}
          disabled={pending}
          className="btn rounded-lg px-2 py-1 text-sm text-neutral-400 hover:text-red-600"
          title="Supprimer"
          style={{ color: pending ? color : undefined }}
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
