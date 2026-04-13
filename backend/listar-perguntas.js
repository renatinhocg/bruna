import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function verificarPerguntas() {
  console.log('📋 Verificando perguntas por categoria...\n');

  const categorias = await prisma.categoria.findMany({
    include: {
      perguntas: {
        select: {
          id: true,
          texto: true
        }
      },
      _count: {
        select: { perguntas: true }
      }
    },
    orderBy: { nome: 'asc' }
  });

  for (const categoria of categorias) {
    console.log(`\n📁 ${categoria.nome}`);
    console.log(`   Total: ${categoria._count.perguntas} perguntas`);
    
    if (categoria.perguntas.length > 0) {
      console.log('   Perguntas:');
      categoria.perguntas.forEach((p, index) => {
        console.log(`   ${index + 1}. [ID:${p.id}] ${p.texto.substring(0, 60)}...`);
      });
    }
  }

  await prisma.$disconnect();
}

verificarPerguntas();
