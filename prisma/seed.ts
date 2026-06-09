// Données de démonstration : un restaurant fictif avec un programme de fidélité
// et un client déjà inscrit, pour pouvoir tester l'app immédiatement.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed non destructif : on ne crée la démo que si la base est vide.
  // Ainsi on peut le relancer à chaque déploiement sans effacer de vraies données.
  const existing = await prisma.restaurant.count();
  if (existing > 0) {
    console.log("ℹ️  Des restaurants existent déjà — seed ignoré.");
    return;
  }

  const resto = await prisma.restaurant.create({
    data: {
      name: "Chez Mario",
      slug: "chez-mario",
      color: "#6e1023",
      plan: "pro",
      programs: {
        create: {
          name: "Carte café",
          stampsGoal: 10,
          rewardLabel: "1 café offert",
        },
      },
      customers: {
        create: {
          name: "Julie Martin",
          email: "julie@example.com",
        },
      },
    },
    include: { programs: true, customers: true },
  });

  // On crée une carte pour la cliente, avec déjà 3 tampons (pour la démo).
  const card = await prisma.stampCard.create({
    data: {
      programId: resto.programs[0].id,
      customerId: resto.customers[0].id,
      stampsCount: 3,
    },
  });

  console.log("✅ Données de démo créées.");
  console.log(`   Restaurant : ${resto.name} (/dashboard)`);
  console.log(`   Carte démo : /c/${card.publicToken}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
