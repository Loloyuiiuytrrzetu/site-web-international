"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2, Sparkles } from "lucide-react";
import {
  buildMissingTranslationTasks,
  runTranslationTasks,
  useRestaurantStore,
} from "@/lib/store";

export function TranslationsBanner() {
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const currentId = useRestaurantStore((s) => s.currentRestaurantId);
  const [tasks, setTasks] = useState<ReturnType<typeof buildMissingTranslationTasks>>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [doneOnce, setDoneOnce] = useState(false);

  useEffect(() => {
    if (running) return;
    setTasks(buildMissingTranslationTasks());
  }, [restaurants, currentId, running]);

  const run = async () => {
    setRunning(true);
    setDoneOnce(false);
    const t = buildMissingTranslationTasks();
    setProgress({ done: 0, total: t.length });
    await runTranslationTasks(t, (done, total) => {
      setProgress({ done, total });
    });
    setRunning(false);
    setDoneOnce(true);
    setTasks(buildMissingTranslationTasks());
  };

  if (!running && !doneOnce && tasks.length === 0) return null;

  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-3 sm:flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-800">
          <Globe size={18} />
        </div>
        <div className="flex-1">
          {running ? (
            <>
              <p className="text-sm font-semibold text-amber-900">
                Traduction en cours...
              </p>
              <p className="mt-0.5 text-xs text-amber-800">
                {progress.done} / {progress.total} textes traduits
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                <div
                  className="h-full bg-amber-600 transition-all"
                  style={{
                    width:
                      progress.total > 0
                        ? `${(progress.done / progress.total) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </>
          ) : tasks.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-amber-900">
                {tasks.length} texte{tasks.length > 1 ? "s" : ""} sans traduction
              </p>
              <p className="mt-0.5 text-xs text-amber-800">
                Lance l&apos;auto-traduction pour rendre ton menu disponible dans
                les 7 autres langues.
              </p>
            </>
          ) : doneOnce ? (
            <>
              <p className="text-sm font-semibold text-emerald-700">
                ✓ Tout est traduit
              </p>
              <p className="mt-0.5 text-xs text-amber-800">
                Ton menu est maintenant disponible dans les 8 langues.
              </p>
            </>
          ) : null}
        </div>
      </div>
      {!running && tasks.length > 0 && (
        <button
          type="button"
          onClick={run}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-800 active:scale-95"
        >
          <Sparkles size={14} />
          Tout traduire
        </button>
      )}
      {running && (
        <div className="flex shrink-0 items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900">
          <Loader2 size={14} className="animate-spin" />
          En cours...
        </div>
      )}
    </div>
  );
}
