// Données de démonstration : un commerce fictif avec un programme de fidélité
// et un client déjà inscrit, pour pouvoir tester l'app immédiatement.
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  // Seed non destructif : on ne crée la démo que si la base est vide.
  // Ainsi on peut le relancer à chaque déploiement sans effacer de vraies données.
  const existing = await prisma.business.count();
  if (existing > 0) {
    console.log("ℹ️  Des commerces existent déjà — seed ignoré.");
    return;
  }

  const business = await prisma.business.create({
    data: {
      name: "Chez Mario",
      slug: "chez-mario",
      category: "Restaurant",
      color: "#6e1023",
      plan: "pro",
      // Mot de passe de connexion de démo : "walletiz".
      passwordHash: hashPassword("walletiz"),
      programs: {
        create: {
          name: "Carte café",
          stampsGoal: 10,
          rewardLabel: "1 café offert",
        },
      },
      customers: {
        create: {
          firstName: "Julie",
          lastName: "Martin",
          email: "julie@example.com",
          birthdate: new Date("1995-06-15"),
        },
      },
    },
    include: { programs: true, customers: true },
  });

  // On crée une carte pour la cliente, avec déjà 3 tampons (pour la démo).
  const card = await prisma.stampCard.create({
    data: {
      programId: business.programs[0].id,
      customerId: business.customers[0].id,
      stampsCount: 3,
    },
  });

  console.log("✅ Données de démo créées.");
  console.log(`   Commerce : ${business.name} (connexion : chez-mario / walletiz)`);
  console.log(`   Carte démo : /c/${card.publicToken}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
