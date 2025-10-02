import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testarCalculoPontuacao() {
  try {
    console.log('🧠 Testando cálculo de pontuação do teste de múltiplas inteligências...\n');

    // Buscar algumas perguntas para teste
    const perguntas = await prisma.perguntaInteligencia.findMany({
      include: { categoria: true },
      take: 5 // Pegar apenas 5 perguntas para teste
    });

    // Buscar possibilidades
    const possibilidades = await prisma.possibilidadeResposta.findMany();

    console.log(`📊 Perguntas encontradas: ${perguntas.length}`);
    console.log(`🎯 Possibilidades encontradas: ${possibilidades.length}`);
    console.log(`📏 Valores das possibilidades: ${possibilidades.map(p => p.valor).join(', ')}`);

    // Simular respostas (todas com valor máximo = 5)
    const respostasSimuladas = perguntas.map(pergunta => ({
      pergunta_id: pergunta.id,
      possibilidade_id: possibilidades.find(p => p.valor === 5)?.id || possibilidades[0].id
    }));

    console.log('\n📝 Simulando teste com respostas máximas...');

    // Agrupar por categoria para calcular
    const resultadosPorCategoria = new Map();
    
    for (const resposta of respostasSimuladas) {
      const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
      const possibilidade = possibilidades.find(p => p.id === resposta.possibilidade_id);

      if (!pergunta || !possibilidade) continue;

      const categoriaId = pergunta.categoria_id;
      if (!resultadosPorCategoria.has(categoriaId)) {
        resultadosPorCategoria.set(categoriaId, {
          categoria: pergunta.categoria,
          pontuacao: 0,
          totalPerguntas: 0
        });
      }

      const resultado = resultadosPorCategoria.get(categoriaId);
      resultado.pontuacao += possibilidade.valor;
      resultado.totalPerguntas += 1;
    }

    // Calcular percentuais
    console.log('\n📈 Resultados por categoria:');
    
    for (const [categoriaId, dados] of resultadosPorCategoria) {
      // Buscar total de perguntas da categoria
      const totalPerguntasCategoria = await prisma.perguntaInteligencia.count({
        where: { 
          categoria_id: categoriaId,
          ativo: true 
        }
      });

      const valorMaximo = Math.max(...possibilidades.map(p => p.valor)); // 5
      const pontuacaoMaximaCategoria = totalPerguntasCategoria * valorMaximo;
      const percentualParcial = (dados.pontuacao / (dados.totalPerguntas * valorMaximo)) * 100;
      const percentualTotal = (dados.pontuacao / pontuacaoMaximaCategoria) * 100;

      console.log(`\n🎨 ${dados.categoria.nome}:`);
      console.log(`   Perguntas respondidas: ${dados.totalPerguntas}/${totalPerguntasCategoria}`);
      console.log(`   Pontuação obtida: ${dados.pontuacao}`);
      console.log(`   Pontuação máxima possível: ${pontuacaoMaximaCategoria}`);
      console.log(`   Percentual (parcial): ${percentualParcial.toFixed(1)}%`);
      console.log(`   Percentual (se todas respondidas): ${percentualTotal.toFixed(1)}%`);
    }

    // Exemplo de cálculo real
    console.log('\n💡 Exemplo prático:');
    console.log('Se uma categoria tem 7 perguntas:');
    console.log('- Pontuação máxima: 7 × 5 = 35 pontos');
    console.log('- Se obteve 28 pontos: 28/35 = 80%');
    console.log('- Se obteve 21 pontos: 21/35 = 60%');

  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarCalculoPontuacao();
