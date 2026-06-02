"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useCurrentRestaurant, useRestaurantStore } from "@/lib/store";
import type { Category, Dish } from "@/lib/types";
import { Button, Card, PageHeader } from "../_components/ui";
import { CategoryEditor } from "./CategoryEditor";
import { DishEditor } from "./DishEditor";
import { formatPrice } from "@/lib/utils";

export default function MenuPage() {
  const restaurant = useCurrentRestaurant();
  const deleteCategory = useRestaurantStore((s) => s.deleteCategory);
  const deleteDish = useRestaurantStore((s) => s.deleteDish);

  const [mounted, setMounted] = useState(false);
  const [openCatId, setOpenCatId] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<Category | "new" | null>(null);
  const [editingDish, setEditingDish] = useState<
    { categoryId: string; dish: Dish | "new" } | null
  >(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && restaurant?.categories[0] && !openCatId) {
      setOpenCatId(restaurant.categories[0].id);
    }
  }, [mounted, restaurant, openCatId]);

  if (!mounted || !restaurant) return null;

  return (
    <div className="mx-auto max-w-4xl p-5 lg:p-8">
      <PageHeader
        title="Menu & plats"
        description="Gérez vos catégories et vos plats."
        actions={
          <Button onClick={() => setEditingCat("new")}>
            <Plus size={16} /> Nouvelle catégorie
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        {restaurant.categories.length === 0 && (
          <Card>
            <div className="py-6 text-center">
              <p className="text-sm text-neutral-600">
                Aucune catégorie pour l&apos;instant.
              </p>
              <Button className="mt-3" onClick={() => setEditingCat("new")}>
                <Plus size={16} /> Créer ma première catégorie
              </Button>
            </div>
          </Card>
        )}

        {restaurant.categories.map((cat) => {
          const open = openCatId === cat.id;
          return (
            <section
              key={cat.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
            >
              <header className="flex items-center gap-3 p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => setOpenCatId(open ? null : cat.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-neutral-500 transition ${
                      open ? "" : "-rotate-90"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {cat.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {cat.dishes.length} plat{cat.dishes.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingCat(cat)}
                    aria-label="Modifier la catégorie"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (
                        confirm(
                          `Supprimer la catégorie "${cat.name}" et tous ses plats ?`
                        )
                      )
                        deleteCategory(cat.id);
                    }}
                    aria-label="Supprimer la catégorie"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </header>

              {open && (
                <div className="border-t border-neutral-200 bg-neutral-50/60 p-3 sm:p-4">
                  <ul className="flex flex-col gap-2">
                    {cat.dishes.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2.5"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {d.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={d.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-900">
                            {d.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatPrice(d.price)}
                            {d.model3dUrl && (
                              <span className="ml-2 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                                3D
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setEditingDish({ categoryId: cat.id, dish: d })
                            }
                            aria-label="Modifier"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Supprimer "${d.name}" ?`))
                                deleteDish(cat.id, d.id);
                            }}
                            aria-label="Supprimer"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() =>
                      setEditingDish({ categoryId: cat.id, dish: "new" })
                    }
                  >
                    <Plus size={14} /> Ajouter un plat
                  </Button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {editingCat && (
        <CategoryEditor
          category={editingCat === "new" ? null : editingCat}
          onClose={() => setEditingCat(null)}
        />
      )}
      {editingDish && (
        <DishEditor
          categoryId={editingDish.categoryId}
          dish={editingDish.dish === "new" ? null : editingDish.dish}
          onClose={() => setEditingDish(null)}
        />
      )}
    </div>
  );
}
