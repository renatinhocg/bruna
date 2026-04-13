import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const categorias = await prisma.categoria.count();
  const perguntas = await prisma.pergunta.count();
  const respostas = await prisma.resposta.count();

  console.log('Categorias:', categorias);
  console.log('Perguntas:', perguntas);
  console.log('Respostas:', respostas);

  await prisma.$disconnect();
}

main();
