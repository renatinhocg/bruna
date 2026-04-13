import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function seedAllTests() {
  try {
    console.log('🚀 Iniciando população dos testes...\n');

    // =========================================
    // 1. TESTE DE MÚLTIPLAS INTELIGÊNCIAS
    // ...código de seed removido do comentário, pronto para execução...
  } finally {
    await prisma.$disconnect();
  }
}

seedAllTests();
