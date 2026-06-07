"use client";

import { useEffect, useState } from "react";
import { useCurrentRestaurant } from "@/lib/store";
import { MenuView } from "./MenuView";

export function MenuViewLive() {
  const restaurant = useCurrentRestaurant();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !restaurant) return null;
  return <MenuView restaurant={restaurant} />;
}
