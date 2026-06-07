import type { Money } from "./types";

export function formatPrice(money: Money, locale = "fr-FR"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: money.currency,
    }).format(money.amount);
  } catch {
    return `${money.amount} ${money.currency}`;
  }
}
