import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function verificarTestes() {
  try {
    console.log('🔍 Verificando testes no banco de dados...\n');

    // Verificar testes existentes
    const testes = await prisma.testeInteligencia.findMany({
      include: {
        resultados: {
          include: {
            categoria: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Total de testes encontrados: ${testes.length}\n`);

    testes.forEach((teste, index) => {
      console.log(`--- Teste ${index + 1} ---`);
      console.log(`ID: ${teste.id}`);
      console.log(`Nome: ${teste.nome_usuario}`);
      console.log(`Email: ${teste.email_usuario}`);
      console.log(`Concluído: ${teste.concluido ? '✅' : '❌'}`);
      console.log(`Autorizado: ${teste.autorizado ? '✅' : '❌'}`);
      console.log(`Inteligência Dominante: ${teste.inteligencia_dominante || 'Não calculada'}`);
      console.log(`Data: ${teste.created_at}`);
      console.log(`Resultados: ${teste.resultados.length} categorias`);
      console.log('');
    });

    // Verificar se há perguntas no banco
    const perguntas = await prisma.perguntaInteligencia.count();
    console.log(`📝 Total de perguntas: ${perguntas}`);

    // Verificar se há categorias
    const categorias = await prisma.categoria.count();
    console.log(`🏷️ Total de categorias: ${categorias}`);

    // Verificar respostas
    const respostas = await prisma.respostaInteligencia.findMany({
      include: {
        pergunta: {
          include: {
            categoria: true
          }
        },
        possibilidade: true
      }
    });
    console.log(`💬 Total de respostas: ${respostas.length}`);
    
    if (respostas.length > 0) {
      console.log('\n--- Últimas 5 respostas ---');
      respostas.slice(0, 5).forEach((resposta, index) => {
        console.log(`Resposta ${index + 1}:`);
        console.log(`  Teste ID: ${resposta.teste_realizado_id}`);
        console.log(`  Pergunta: ${resposta.pergunta?.texto?.substring(0, 50)}...`);
        console.log(`  Categoria: ${resposta.pergunta?.categoria?.nome}`);
        console.log(`  Valor: ${resposta.possibilidade?.valor}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTestes();
