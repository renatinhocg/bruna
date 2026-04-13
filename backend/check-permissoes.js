import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function checkPermissoes() {
  try {
    const permissoes = await prisma.permissaoTeste.findMany({
      take: 10,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
    console.log('Permissões cadastradas:', JSON.stringify(permissoes, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissoes();
