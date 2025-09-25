const { PrismaClient } = require('@prisma/client');

// Singleton pattern for serverless environments
let prisma;

const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Optimize for serverless
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return prisma;
};

// For traditional server environments
const prismaClient = getPrismaClient();

// Handle graceful shutdown (for traditional server)
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
}

module.exports = prismaClient;
module.exports.getPrismaClient = getPrismaClient;
