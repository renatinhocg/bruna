import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function verificarResultado() {
  try {
    // Buscar o último teste
    const teste = await prisma.testeInteligencia.findFirst({
      where: { usuario_id: 2 },
      orderBy: { created_at: 'desc' },
      include: {
        respostas: {
          include: {
            pergunta: {
              include: {
                categoria: true
              }
            },
            possibilidade: true
          }
        },
        resultados: {
          include: {
            categoria: true
          }
        }
      }
    });

    if (!teste) {
      console.log('Nenhum teste encontrado');
      return;
    }

    console.log(`\n=== TESTE ID: ${teste.id} ===\n`);
    console.log(`Total de respostas: ${teste.respostas.length}\n`);

    // Agrupar por categoria
    const porCategoria = {};
    teste.respostas.forEach(r => {
      const catNome = r.pergunta.categoria.nome;
      if (!porCategoria[catNome]) {
        porCategoria[catNome] = {
          respostas: [],
          pontos: 0
        };
      }
      porCategoria[catNome].respostas.push({
        pergunta: (r.pergunta.pergunta || 'sem texto').substring(0, 50) + '...',
        pontos: r.possibilidade?.pontos || 0
      });
      porCategoria[catNome].pontos += r.possibilidade.pontos;
    });

    console.log('=== RESPOSTAS POR CATEGORIA ===\n');
    Object.keys(porCategoria).sort().forEach(catNome => {
      const dados = porCategoria[catNome];
      console.log(`${catNome}:`);
      console.log(`  Total: ${dados.pontos} pontos`);
      console.log(`  Respostas: ${dados.respostas.length}`);
      console.log(`  Detalhes: ${dados.respostas.map(r => r.pontos).join(', ')}`);
      console.log();
    });

    console.log('\n=== RESULTADOS SALVOS ===\n');
    teste.resultados.forEach(r => {
      console.log(`${r.categoria.nome}: ${r.pontuacao} pontos`);
    });

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verificarResultado();
