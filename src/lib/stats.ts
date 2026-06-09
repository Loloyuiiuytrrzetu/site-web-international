import { prisma } from "@/lib/prisma";

export type DayStat = { label: string; date: string; count: number; isToday: boolean };

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/** Minuit (heure locale serveur) du jour donné. */
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Nombre de scans (tampons) par jour pour la SEMAINE EN COURS (lundi -> dimanche),
 * pour un commerce donné. Utilisé par le graphique temps réel du dashboard.
 */
export async function weeklyScans(businessId: string): Promise<DayStat[]> {
  const today = startOfDay(new Date());
  // Lundi de la semaine en cours (getDay: 0=dim … 1=lun).
  const dow = today.getDay();
  const offsetToMonday = (dow + 6) % 7; // dim->6, lun->0, mar->1…
  const monday = new Date(today);
  monday.setDate(today.getDate() - offsetToMonday);

  const stamps = await prisma.stamp.findMany({
    where: {
      card: { program: { businessId } },
      createdAt: { gte: monday },
    },
    select: { createdAt: true },
  });

  // On prépare les 7 cases de la semaine (lun -> dim).
  const buckets: DayStat[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    buckets.push({
      label: DAYS_FR[d.getDay()],
      date: d.toISOString().slice(0, 10),
      count: 0,
      isToday: d.getTime() === today.getTime(),
    });
  }

  // On range chaque scan dans le bon jour.
  for (const s of stamps) {
    const key = startOfDay(s.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.find((b) => b.date === key);
    if (bucket) bucket.count++;
  }

  return buckets;
}
