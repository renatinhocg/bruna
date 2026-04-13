import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function verificarPossibilidades() {
  console.log('🔍 Verificando possibilidades de resposta...\n');

  const possibilidades = await prisma.possibilidadeResposta.findMany({
    orderBy: { valor: 'asc' }
  });

  console.log(`📊 Total de possibilidades: ${possibilidades.length}\n`);

  possibilidades.forEach(p => {
    console.log(`ID: ${p.id} | Texto: "${p.texto}" | Valor: ${p.valor}`);
  });

  await prisma.$disconnect();
}

verificarPossibilidades();
