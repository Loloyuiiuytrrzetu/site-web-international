import { fetchRestaurantBySlug } from "@/lib/supabase-fetch";
import { MenuView } from "@/app/components/MenuView";

export const dynamic = "force-dynamic";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await fetchRestaurantBySlug(slug);

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-neutral-50 p-6 text-center">
        <div>
          <p className="text-6xl">🍽️</p>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">
            Menu introuvable
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Le restaurant <span className="font-mono">{slug}</span> n&apos;existe
            pas ou a été désactivé.
          </p>
        </div>
      </div>
    );
  }

  if (restaurant.status === "suspended") {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-neutral-50 p-6 text-center">
        <div>
          <p className="text-6xl">⏸️</p>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">
            Menu temporairement indisponible
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Merci de revenir plus tard.
          </p>
        </div>
      </div>
    );
  }

  return <MenuView restaurant={restaurant} />;
}
