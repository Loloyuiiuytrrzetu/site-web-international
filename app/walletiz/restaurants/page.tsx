"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { useRestaurantStore } from "@/lib/store";
import { Button, Card, Input, PageHeader } from "../../admin/_components/ui";
import { StatusBadge } from "../page";
import { NewRestaurantModal } from "./NewRestaurantModal";

export default function RestaurantsPage() {
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const setCurrent = useRestaurantStore((s) => s.setCurrentRestaurant);
  const updateStatus = useRestaurantStore((s) => s.updateRestaurantStatus);
  const deleteRestaurant = useRestaurantStore((s) => s.deleteRestaurant);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(
    () =>
      restaurants.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase())
      ),
    [restaurants, query]
  );

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-6xl p-5 lg:p-8">
      <PageHeader
        title="Restaurants"
        description={`${restaurants.length} compte${restaurants.length > 1 ? "s" : ""} géré${restaurants.length > 1 ? "s" : ""}.`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> Nouveau restaurant
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3">
          <Search size={16} className="text-neutral-400" />
          <Input
            className="border-0 px-0 shadow-none focus:ring-0"
            placeholder="Rechercher un restaurant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">
            Aucun restaurant trouvé.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {filtered.map((r) => {
              const dishCount = r.categories.reduce(
                (n, c) => n + c.dishes.length,
                0
              );
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white"
                      style={{ backgroundColor: r.theme.primaryColor }}
                    >
                      {r.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {r.name}
                        </p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-neutral-500">
                        /{r.slug} · Plan {r.plan} · {r.categories.length} cat. ·{" "}
                        {dishCount} plats
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setCurrent(r.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-50"
                    >
                      <ExternalLink size={12} /> Menu
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setCurrent(r.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                    >
                      <Settings size={12} /> Gérer
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          r.id,
                          r.status === "active" ? "suspended" : "active"
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium hover:bg-neutral-50"
                    >
                      {r.status === "active" ? (
                        <>
                          <Pause size={12} /> Suspendre
                        </>
                      ) : (
                        <>
                          <Play size={12} /> Activer
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Supprimer définitivement "${r.name}" ? Cette action est irréversible.`
                          )
                        )
                          deleteRestaurant(r.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {creating && <NewRestaurantModal onClose={() => setCreating(false)} />}
    </div>
  );
}
