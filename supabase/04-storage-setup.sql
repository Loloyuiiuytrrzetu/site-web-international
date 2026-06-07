-- =========================================
-- PHASE 3d — Setup Supabase Storage
-- Bucket "restaurant-assets" public en lecture,
-- écriture autorisée pour le propriétaire du restaurant.
-- À exécuter dans le SQL Editor de Supabase.
-- =========================================

-- 1) Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2) Politiques RLS sur storage.objects

-- 2a) Lecture publique : tout le monde peut voir les fichiers
DROP POLICY IF EXISTS "restaurant_assets_public_read" ON storage.objects;
CREATE POLICY "restaurant_assets_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'restaurant-assets');

-- 2b) Upload : seulement le propriétaire du restaurant (ou walletiz)
-- Le chemin doit commencer par <restaurantId>/...
DROP POLICY IF EXISTS "restaurant_assets_upload_owner" ON storage.objects;
CREATE POLICY "restaurant_assets_upload_owner" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'restaurant-assets'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = public.current_restaurant_id()::text
      OR public.is_walletiz()
    )
  );

-- 2c) Update : pareil
DROP POLICY IF EXISTS "restaurant_assets_update_owner" ON storage.objects;
CREATE POLICY "restaurant_assets_update_owner" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'restaurant-assets'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = public.current_restaurant_id()::text
      OR public.is_walletiz()
    )
  );

-- 2d) Delete : pareil (pour nettoyer une vieille image)
DROP POLICY IF EXISTS "restaurant_assets_delete_owner" ON storage.objects;
CREATE POLICY "restaurant_assets_delete_owner" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'restaurant-assets'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = public.current_restaurant_id()::text
      OR public.is_walletiz()
    )
  );
