"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import {
  buildMissingTranslationTasks,
  runTranslationTasks,
  useRestaurantStore,
} from "@/lib/store";

const SESSION_KEY = "walletiz-auto-translated";

export function TranslationsBanner() {
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const currentId = useRestaurantStore((s) => s.currentRestaurantId);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (running || hasTriggeredRef.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      hasTriggeredRef.current = true;
      return;
    }
    const restaurant = restaurants.find((r) => r.id === currentId);
    if (!restaurant) return;
    const tasks = buildMissingTranslationTasks();
    if (tasks.length === 0) return;

    hasTriggeredRef.current = true;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
    setRunning(true);
    setProgress({ done: 0, total: tasks.length });
    void runTranslationTasks(tasks, (done, total) => {
      setProgress({ done, total });
    }).then(() => {
      setRunning(false);
    });
  }, [restaurants, currentId, running]);

  if (!running) return null;

  return (
    <div className="mx-auto mb-2 mt-2 flex max-w-3xl items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 sm:px-4">
      <Loader2 size={14} className="shrink-0 animate-spin text-amber-700" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium text-amber-900">
          <Globe size={11} className="mr-1 inline-block" />
          Traduction automatique en cours... {progress.done} / {progress.total}
        </p>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-amber-200">
          <div
            className="h-full bg-amber-600 transition-all duration-300"
            style={{
              width:
                progress.total > 0
                  ? `${(progress.done / progress.total) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
