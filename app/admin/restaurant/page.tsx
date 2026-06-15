"use client";

import { useEffect, useState } from "react";
import { useCurrentRestaurant, useRestaurantStore } from "@/lib/store";
import { Card, Field, Input, PageHeader } from "../_components/ui";
import { FileUploader } from "../_components/FileUploader";

export default function RestaurantPage() {
  const restaurant = useCurrentRestaurant();
  const updateInfo = useRestaurantStore((s) => s.updateInfo);
  const updateContact = useRestaurantStore((s) => s.updateContact);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !restaurant) return null;

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-8">
      <PageHeader
        title="Mon restaurant"
        description="Identité, visuels et informations de contact."
      />

      <div className="flex flex-col gap-4">
        <Card title="Identité">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom du restaurant">
              <Input
                value={restaurant.name}
                onChange={(e) => updateInfo({ name: e.target.value })}
              />
            </Field>
            <Field label="Slogan">
              <Input
                value={restaurant.tagline ?? ""}
                onChange={(e) => updateInfo({ tagline: e.target.value })}
                placeholder="Ex: Cuisine italienne authentique"
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FileUploader
              label="Logo"
              kind="image"
              accept="image/*"
              value={restaurant.logoUrl}
              onChange={(url) => updateInfo({ logoUrl: url })}
            />
            <FileUploader
              label="Image de couverture"
              kind="image"
              accept="image/*"
              value={restaurant.coverUrl}
              onChange={(url) => updateInfo({ coverUrl: url })}
            />
          </div>
        </Card>

        <Card title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone">
              <Input
                value={restaurant.contact.phone ?? ""}
                onChange={(e) => updateContact({ phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                value={restaurant.contact.whatsapp ?? ""}
                onChange={(e) => updateContact({ whatsapp: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={restaurant.contact.email ?? ""}
                onChange={(e) => updateContact({ email: e.target.value })}
              />
            </Field>
            <Field label="Lien Google Maps">
              <Input
                value={restaurant.contact.mapsUrl ?? ""}
                onChange={(e) => updateContact({ mapsUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Texte du bouton Avis Google (optionnel)"
              hint="Affiché dans le menu client. Vide = « Avis Google » par défaut."
            >
              <Input
                value={restaurant.contact.googleReviewLabel ?? ""}
                onChange={(e) =>
                  updateContact({ googleReviewLabel: e.target.value })
                }
                placeholder="Ex: Notez-nous sur Google"
              />
            </Field>
            <Field
              label="Lien pour avis Google"
              hint="Le bouton apparaîtra uniquement si ce lien est renseigné."
            >
              <Input
                value={restaurant.contact.googleReviewUrl ?? ""}
                onChange={(e) =>
                  updateContact({ googleReviewUrl: e.target.value })
                }
                placeholder="https://g.page/r/.../review"
              />
            </Field>
          </div>
        </Card>

        <p className="text-center text-xs text-neutral-500">
          Les modifications sont enregistrées automatiquement.
        </p>
      </div>
    </div>
  );
}
