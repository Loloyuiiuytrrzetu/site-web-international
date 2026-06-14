-- =========================================
-- PHASE D5 — Analytics : tracking des vues
-- À exécuter dans le SQL Editor de Supabase.
-- Idempotent.
-- =========================================

-- 1) Table des vues : 1 ligne par visite de menu ou par ouverture d'un plat
CREATE TABLE IF NOT EXISTS public.restaurant_views (
  id bigserial PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  dish_id uuid REFERENCES public.dishes(id) ON DELETE SET NULL,
  session_id text,
  locale text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Index pour les requêtes d'agrégation
CREATE INDEX IF NOT EXISTS restaurant_views_resto_time_idx
  ON public.restaurant_views (restaurant_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS restaurant_views_dish_idx
  ON public.restaurant_views (dish_id)
  WHERE dish_id IS NOT NULL;

-- 3) Activer RLS
ALTER TABLE public.restaurant_views ENABLE ROW LEVEL SECURITY;

-- 4) INSERT autorisé pour tout le monde (anonyme + connecté)
--    On ne peut pas tracker si on ne peut pas écrire publiquement.
DROP POLICY IF EXISTS "views_insert_anyone" ON public.restaurant_views;
CREATE POLICY "views_insert_anyone" ON public.restaurant_views
  FOR INSERT
  WITH CHECK (true);

-- 5) SELECT : restaurateur voit SES vues, walletiz voit tout
DROP POLICY IF EXISTS "views_select_owner" ON public.restaurant_views;
CREATE POLICY "views_select_owner" ON public.restaurant_views
  FOR SELECT
  USING (
    restaurant_id = public.current_restaurant_id()
    OR public.is_walletiz()
  );
