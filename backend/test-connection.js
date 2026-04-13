import { PrismaClient } from './src/generated/prisma/index.js';

// Usar variável de ambiente do Railway
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:ovlEEMUPUhcIQIqLGAaYEcOYLPnXdCAo@postgres.railway.internal:5432/railway";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco...');
    await prisma.$connect();
    console.log('✅ Conexão bem-sucedida!');
    
    // Testar uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query de teste:', result);
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.error('Código do erro:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();