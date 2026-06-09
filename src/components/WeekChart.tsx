import type { DayStat } from "@/lib/stats";

/**
 * Petit graphique en barres « scans par jour » (lundi -> dimanche).
 * Rendu en pur CSS (pas de librairie) : la hauteur de chaque barre est
 * proportionnelle au nombre de scans du jour.
 */
export function WeekChart({
  data,
  color,
}: {
  data: DayStat[];
  color: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-44 items-end justify-between gap-2">
      {data.map((d) => {
        const heightPct = (d.count / max) * 100;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max(heightPct, d.count > 0 ? 8 : 2)}%`,
                  background: d.count > 0 ? color : "#e5e5e5",
                  opacity: d.isToday ? 1 : 0.75,
                }}
                title={`${d.count} scan${d.count > 1 ? "s" : ""}`}
              />
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color }}>
              {d.count}
            </span>
            <span
              className={`text-xs ${
                d.isToday ? "font-bold text-neutral-900" : "text-neutral-400"
              }`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
