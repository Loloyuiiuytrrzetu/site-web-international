import { PrismaClient } from "@prisma/client";

// Singleton Prisma : évite d'ouvrir trop de connexions en développement
// (Next.js recharge les modules à chaud).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
