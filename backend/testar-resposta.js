import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testarCriacaoResposta() {
  try {
    console.log('🧪 Testando criação manual de resposta...\n');

    // Buscar primeira pergunta e primeira possibilidade
    const pergunta = await prisma.perguntaInteligencia.findFirst();
    const possibilidade = await prisma.possibilidadeResposta.findFirst();
    const teste = await prisma.testeInteligencia.findFirst();

    if (!pergunta || !possibilidade || !teste) {
      console.log('❌ Faltam dados para teste');
      return;
    }

    console.log(`Pergunta: ${pergunta.texto}`);
    console.log(`Possibilidade: ${possibilidade.texto} (valor: ${possibilidade.valor})`);
    console.log(`Teste: ${teste.id}`);

    // Tentar criar resposta
    const resposta = await prisma.respostaInteligencia.create({
      data: {
        teste_realizado_id: teste.id,
        pergunta_id: pergunta.id,
        possibilidade_id: possibilidade.id
      }
    });

    console.log(`✅ Resposta criada com sucesso! ID: ${resposta.id}`);

  } catch (error) {
    console.error('❌ Erro ao criar resposta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarCriacaoResposta();
