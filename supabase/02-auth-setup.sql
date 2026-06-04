-- =========================================
-- PHASE 3b — Setup auth Supabase
-- Table profiles + trigger handle_new_user + RLS
-- À exécuter UNE FOIS dans le SQL Editor de Supabase
-- Si la table profiles existe déjà, ce script est idempotent.
-- =========================================

-- 1) Table profiles : 1 ligne par utilisateur, liée à auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('walletiz', 'restaurateur')),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) RLS activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2a) L'utilisateur peut lire SON profil (nécessaire pour récupérer son rôle après login)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2b) Les super-admins (role 'walletiz') peuvent tout lire
DROP POLICY IF EXISTS "profiles_select_walletiz" ON public.profiles;
CREATE POLICY "profiles_select_walletiz" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'walletiz'
    )
  );

-- 3) Trigger : à chaque nouvel utilisateur dans auth.users, créer une ligne profiles
-- Le rôle et restaurant_id sont lus depuis raw_user_meta_data lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, restaurant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'restaurateur'),
    NULLIF(NEW.raw_user_meta_data->>'restaurant_id', '')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- 4) Créer les 2 profils de démo APRÈS avoir créé les utilisateurs auth
--    dans Dashboard > Authentication > Users > "Add user"
--    Compte 1 : admin@walletiz.com
--    Compte 2 : resto@walletiz.com
-- Puis exécute ce bloc pour ajuster les rôles :
-- =========================================

-- Super admin
UPDATE public.profiles
SET role = 'walletiz', restaurant_id = NULL
WHERE email = 'admin@walletiz.com';

-- Restaurateur Il Piatto
UPDATE public.profiles
SET role = 'restaurateur',
    restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'il-piatto')
WHERE email = 'resto@walletiz.com';
