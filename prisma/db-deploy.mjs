// Mise à jour de la base au moment du build (Vercel), de façon SÛRE.
//
// Stratégie :
// 1. On tente une mise à jour NON destructive (`--accept-data-loss` gère les
//    suppressions de colonnes/tables mais PRÉSERVE les lignes existantes).
//    -> Pour un déploiement normal (changement de code, schéma stable), les
//       données des clients sont conservées.
// 2. Seulement si Prisma refuse (changement réellement incompatible, ex.
//    ajouter une colonne obligatoire à une table déjà remplie), on réinitialise
//    la base avec `--force-reset`. Le seed recrée ensuite les données de démo.
//
// Ainsi on n'efface JAMAIS les données sauf quand c'est strictement nécessaire.

import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

try {
  run("npx prisma db push --accept-data-loss --skip-generate");
  console.log("✅ Base mise à jour (données conservées).");
} catch {
  console.warn(
    "⚠️  Changement de schéma incompatible avec les données existantes — " +
      "réinitialisation de la base puis re-seed.",
  );
  run("npx prisma db push --force-reset --skip-generate");
  console.log("✅ Base réinitialisée sur le nouveau schéma.");
}
