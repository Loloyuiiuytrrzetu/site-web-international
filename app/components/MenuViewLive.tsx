"use client";

import { useEffect, useState } from "react";
import { useRestaurantStore } from "@/lib/store";
import { MenuView } from "./MenuView";

export function MenuViewLive() {
  const restaurant = useRestaurantStore((s) => s.restaurant);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <MenuView restaurant={restaurant} />;
}
