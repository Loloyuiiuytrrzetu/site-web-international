import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { announceAll } from "@/lib/wallet-notify";

// Tâche planifiée : envoie les campagnes dues.
// - "scheduled" : campagnes programmées dont l'heure est passée.
// - "birthday"  : campagnes automatiques -> aux clients dont c'est l'anniversaire
//   aujourd'hui (une seule fois par jour).
//
// Déclenchée par Vercel Cron (voir vercel.json). Protégée par CRON_SECRET si
// défini : Vercel envoie automatiquement l'en-tête Authorization.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

async function dispatch() {
  const now = new Date();
  let scheduledSent = 0;
  let birthdaySent = 0;

  // 1) Campagnes programmées arrivées à échéance.
  const due = await prisma.campaign.findMany({
    where: { trigger: "scheduled", status: "scheduled", scheduledAt: { lte: now } },
  });
  for (const c of due) {
    const n = await announceAll(c.businessId, c.title, c.message);
    await prisma.campaign.update({
      where: { id: c.id },
      data: { status: "sent", sentAt: now, recipients: n },
    });
    scheduledSent += n;
  }

  // 2) Campagnes anniversaire automatiques (une fois par jour max).
  const birthdays = await prisma.campaign.findMany({
    where: { trigger: "birthday", status: "active" },
  });
  for (const c of birthdays) {
    if (c.sentAt && isSameDay(c.sentAt, now)) continue; // déjà envoyée aujourd'hui
    const n = await announceAll(c.businessId, c.title, c.message, { birthdayOnly: true });
    await prisma.campaign.update({
      where: { id: c.id },
      data: { sentAt: now, recipients: n },
    });
    birthdaySent += n;
  }

  return { ok: true, scheduledSent, birthdaySent, ranAt: now.toISOString() };
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const result = await dispatch();
  return Response.json(result);
}
