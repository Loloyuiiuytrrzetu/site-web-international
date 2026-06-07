-- =========================================
-- MIGRATION — Plans : 3 (starter/pro/enterprise) → 2 (pro/custom)
-- À exécuter UNE FOIS dans le SQL Editor de Supabase.
-- Idempotent : peut être relancé sans casser quoi que ce soit.
-- =========================================

-- 1) Migrer les valeurs existantes
UPDATE public.restaurants
SET plan = 'pro'
WHERE plan = 'starter';

UPDATE public.restaurants
SET plan = 'custom'
WHERE plan = 'enterprise';

-- 2) Mettre la valeur par défaut à 'pro' pour les futurs insert sans plan
ALTER TABLE public.restaurants
  ALTER COLUMN plan SET DEFAULT 'pro';

-- 3) Vérification (optionnel — décommente pour voir ce qui reste)
-- SELECT plan, COUNT(*) FROM public.restaurants GROUP BY plan;
