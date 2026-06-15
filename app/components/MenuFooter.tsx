"use client";

import { MapPin, MessageCircle, Phone } from "lucide-react";
import type { Locale, Restaurant } from "@/lib/types";
import { UI_LABELS } from "@/lib/i18n";

type Props = { restaurant: Restaurant; locale: Locale };

export function MenuFooter({ restaurant, locale }: Props) {
  const labels = UI_LABELS[locale];
  const { contact, theme } = restaurant;
  const waLink = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`
    : undefined;
  const telLink = contact.phone ? `tel:${contact.phone}` : undefined;
  const reviewLink = contact.googleReviewUrl?.trim();
  const reviewLabel = contact.googleReviewLabel?.trim();
  const showCustomButton = Boolean(reviewLink && reviewLabel);

  const tiles: { key: string; node: React.ReactNode }[] = [];
  if (waLink) {
    tiles.push({
      key: "wa",
      node: (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-3 shadow-sm active:scale-95"
        >
          <MessageCircle size={20} style={{ color: theme.accentColor }} />
          <span className="text-[11px] font-medium text-neutral-800">
            {labels.whatsapp}
          </span>
        </a>
      ),
    });
  }
  if (telLink) {
    tiles.push({
      key: "tel",
      node: (
        <a
          href={telLink}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-3 shadow-sm active:scale-95"
        >
          <Phone size={20} style={{ color: theme.accentColor }} />
          <span className="text-[11px] font-medium text-neutral-800">
            {labels.call}
          </span>
        </a>
      ),
    });
  }
  if (contact.mapsUrl) {
    tiles.push({
      key: "map",
      node: (
        <a
          href={contact.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-3 shadow-sm active:scale-95"
        >
          <MapPin size={20} style={{ color: theme.accentColor }} />
          <span className="text-[11px] font-medium text-neutral-800">
            {labels.map}
          </span>
        </a>
      ),
    });
  }

  return (
    <footer
      className="mt-8 border-t pb-24 pt-6"
      style={{ borderColor: `${theme.primaryColor}14` }}
    >
      <div className="mx-auto max-w-3xl px-4">
        {tiles.length > 0 && (
          <div
            className={`grid gap-2 ${
              tiles.length === 1
                ? "grid-cols-1"
                : tiles.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {tiles.map((t) => (
              <div key={t.key}>{t.node}</div>
            ))}
          </div>
        )}

        {showCustomButton && (
          <a
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white shadow-sm active:scale-95"
            style={{ backgroundColor: theme.accentColor }}
          >
            <span>{reviewLabel}</span>
          </a>
        )}
      </div>
    </footer>
  );
}
