"use client";

import { MapPin, MessageCircle, Phone } from "lucide-react";
import type { Restaurant } from "@/lib/types";

type Props = { restaurant: Restaurant };

export function MenuFooter({ restaurant }: Props) {
  const { contact, theme } = restaurant;
  const waLink = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`
    : undefined;
  const telLink = contact.phone ? `tel:${contact.phone}` : undefined;

  return (
    <footer
      className="mt-8 border-t pb-24 pt-6"
      style={{ borderColor: `${theme.primaryColor}14` }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <div className="grid grid-cols-3 gap-2">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-3 shadow-sm active:scale-95"
            >
              <MessageCircle size={20} style={{ color: theme.accentColor }} />
              <span className="text-[11px] font-medium">WhatsApp</span>
            </a>
          )}
          {telLink && (
            <a
              href={telLink}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-3 shadow-sm active:scale-95"
            >
              <Phone size={20} style={{ color: theme.accentColor }} />
              <span className="text-[11px] font-medium">Appeler</span>
            </a>
          )}
          {contact.mapsUrl && (
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-3 shadow-sm active:scale-95"
            >
              <MapPin size={20} style={{ color: theme.accentColor }} />
              <span className="text-[11px] font-medium">Plan</span>
            </a>
          )}
        </div>

        {contact.address && (
          <p
            className="mt-4 text-center text-xs opacity-60"
            style={{ color: theme.textColor }}
          >
            {contact.address}
          </p>
        )}
      </div>
    </footer>
  );
}
