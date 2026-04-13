import { PrismaClient } from '../generated/prisma/index.js';

// Singleton para evitar múltiplas conexões
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  prisma = global.prisma;
}

// Fechar conexão ao encerrar o processo
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
