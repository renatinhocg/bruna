import { PrismaClient } from './src/generated/prisma/client.js';
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis do .env.production
dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });

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