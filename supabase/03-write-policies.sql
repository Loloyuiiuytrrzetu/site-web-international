-- =========================================
-- PHASE 3c.2.a — RLS écriture
-- Politiques pour permettre au restaurateur de modifier SON restaurant
-- et au super admin walletiz de tout faire.
-- À exécuter dans le SQL Editor de Supabase.
-- =========================================

-- 1) Fonctions helper (SECURITY DEFINER pour bypasser RLS sur profiles)

CREATE OR REPLACE FUNCTION public.is_walletiz()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'walletiz'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_restaurant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT restaurant_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2) RESTAURANTS — UPDATE (owner ou walletiz)
DROP POLICY IF EXISTS "restaurants_update_owner" ON public.restaurants;
CREATE POLICY "restaurants_update_owner" ON public.restaurants
  FOR UPDATE
  USING (id = public.current_restaurant_id() OR public.is_walletiz())
  WITH CHECK (id = public.current_restaurant_id() OR public.is_walletiz());

-- 2b) RESTAURANTS — INSERT (walletiz seulement, pour la création depuis la console)
DROP POLICY IF EXISTS "restaurants_insert_walletiz" ON public.restaurants;
CREATE POLICY "restaurants_insert_walletiz" ON public.restaurants
  FOR INSERT
  WITH CHECK (public.is_walletiz());

-- 2c) RESTAURANTS — DELETE (walletiz seulement)
DROP POLICY IF EXISTS "restaurants_delete_walletiz" ON public.restaurants;
CREATE POLICY "restaurants_delete_walletiz" ON public.restaurants
  FOR DELETE
  USING (public.is_walletiz());

-- 3) CATEGORIES — INSERT/UPDATE/DELETE (owner du resto parent ou walletiz)
DROP POLICY IF EXISTS "categories_insert_owner" ON public.categories;
CREATE POLICY "categories_insert_owner" ON public.categories
  FOR INSERT
  WITH CHECK (
    restaurant_id = public.current_restaurant_id() OR public.is_walletiz()
  );

DROP POLICY IF EXISTS "categories_update_owner" ON public.categories;
CREATE POLICY "categories_update_owner" ON public.categories
  FOR UPDATE
  USING (
    restaurant_id = public.current_restaurant_id() OR public.is_walletiz()
  )
  WITH CHECK (
    restaurant_id = public.current_restaurant_id() OR public.is_walletiz()
  );

DROP POLICY IF EXISTS "categories_delete_owner" ON public.categories;
CREATE POLICY "categories_delete_owner" ON public.categories
  FOR DELETE
  USING (
    restaurant_id = public.current_restaurant_id() OR public.is_walletiz()
  );

-- 4) DISHES — INSERT/UPDATE/DELETE (via la catégorie parente)
DROP POLICY IF EXISTS "dishes_insert_owner" ON public.dishes;
CREATE POLICY "dishes_insert_owner" ON public.dishes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = category_id
        AND (c.restaurant_id = public.current_restaurant_id() OR public.is_walletiz())
    )
  );

DROP POLICY IF EXISTS "dishes_update_owner" ON public.dishes;
CREATE POLICY "dishes_update_owner" ON public.dishes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = category_id
        AND (c.restaurant_id = public.current_restaurant_id() OR public.is_walletiz())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = category_id
        AND (c.restaurant_id = public.current_restaurant_id() OR public.is_walletiz())
    )
  );

DROP POLICY IF EXISTS "dishes_delete_owner" ON public.dishes;
CREATE POLICY "dishes_delete_owner" ON public.dishes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = category_id
        AND (c.restaurant_id = public.current_restaurant_id() OR public.is_walletiz())
    )
  );
