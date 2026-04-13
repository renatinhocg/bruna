import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function recalcularResultados() {
  console.log('🔄 Iniciando recálculo dos resultados...\n');

  try {
    // 1. Buscar todos os testes de inteligência
    const testes = await prisma.testeInteligencia.findMany({
      include: {
        usuario: true,
        respostas: {
          include: {
            pergunta: {
              include: {
                categoria: true
              }
            },
            possibilidade: true
          }
        }
      }
    });

    console.log(`📊 Encontrados ${testes.length} testes para recalcular\n`);

    for (const teste of testes) {
      console.log(`\n📝 Recalculando teste do usuário: ${teste.usuario.nome} (ID: ${teste.id})`);
      console.log(`   Total de respostas: ${teste.respostas.length}`);

      // Agrupar respostas por categoria
      const pontosPorCategoria = {};
      const contagemPorCategoria = {};

      teste.respostas.forEach(resposta => {
        if (!resposta.pergunta || !resposta.pergunta.categoria) return;
        
        const categoriaId = resposta.pergunta.categoria_id;
        const categoriaNome = resposta.pergunta.categoria.nome;
        const pontos = resposta.possibilidade?.valor || 0;

        if (!pontosPorCategoria[categoriaId]) {
          pontosPorCategoria[categoriaId] = {
            id: categoriaId,
            nome: categoriaNome,
            pontos: 0,
            perguntas: 0
          };
          contagemPorCategoria[categoriaId] = 0;
        }

        pontosPorCategoria[categoriaId].pontos += pontos;
        contagemPorCategoria[categoriaId]++;
      });

      // Buscar quantidade atual de perguntas por categoria
      const categorias = await prisma.categoria.findMany({
        include: {
          _count: {
            select: { perguntas: true }
          }
        }
      });

      console.log('\n   📊 Pontuações por categoria:');

      // Deletar resultados antigos
      await prisma.resultadoInteligencia.deleteMany({
        where: { teste_id: teste.id }
      });

      // Criar novos resultados recalculados
      for (const [categoriaId, dados] of Object.entries(pontosPorCategoria)) {
        const categoria = categorias.find(c => c.id === parseInt(categoriaId));
        const totalPerguntasAtuais = categoria?._count?.perguntas || 0;
        const pontuacaoMaxima = totalPerguntasAtuais * 5; // 5 pontos por pergunta
        const percentual = pontuacaoMaxima > 0 ? (dados.pontos / pontuacaoMaxima) * 100 : 0;

        console.log(`   - ${dados.nome}:`);
        console.log(`     Respostas fornecidas: ${dados.perguntas}`);
        console.log(`     Perguntas atuais no banco: ${totalPerguntasAtuais}`);
        console.log(`     Pontos: ${dados.pontos}/${pontuacaoMaxima}`);
        console.log(`     Percentual: ${percentual.toFixed(2)}%`);

        await prisma.resultadoInteligencia.create({
          data: {
            teste_id: teste.id,
            categoria_id: parseInt(categoriaId),
            pontuacao: dados.pontos,
            percentual: parseFloat(percentual.toFixed(2)),
            aprovado: percentual >= 60
          }
        });
      }

      console.log('\n   ✅ Resultados recalculados e salvos!');
    }

    console.log('\n\n🎉 Recálculo concluído com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro ao recalcular resultados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalcularResultados();
