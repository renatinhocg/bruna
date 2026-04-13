import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function verificarPerguntas() {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: {
            perguntas: true
          }
        }
      }
    });

    console.log('\n=== PERGUNTAS POR CATEGORIA ===\n');
    categorias.forEach(cat => {
      console.log(`${cat.nome}: ${cat._count.perguntas} perguntas`);
    });

    console.log('\n=== VERIFICANDO RESPOSTAS ===\n');
    
    // Buscar o último teste do usuário
    const ultimoTeste = await prisma.testeInteligencia.findFirst({
      where: {
        usuario_id: 2 // ID da Bruna/Catarina
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        respostas: {
          include: {
            pergunta: {
              include: {
                categoria: true
              }
            }
          }
        }
      }
    });

    if (ultimoTeste) {
      console.log(`Teste ID: ${ultimoTeste.id}`);
      console.log(`Total de respostas: ${ultimoTeste.respostas.length}\n`);

      // Agrupar por categoria
      const respostasPorCategoria = {};
      ultimoTeste.respostas.forEach(r => {
        const catNome = r.pergunta.categoria.nome;
        if (!respostasPorCategoria[catNome]) {
          respostasPorCategoria[catNome] = {
            count: 0,
            totalPontos: 0,
            respostas: []
          };
        }
        respostasPorCategoria[catNome].count++;
        respostasPorCategoria[catNome].totalPontos += r.resposta || 0;
        respostasPorCategoria[catNome].respostas.push(r.resposta);
      });

      Object.keys(respostasPorCategoria).forEach(catNome => {
        const dados = respostasPorCategoria[catNome];
        console.log(`${catNome}:`);
        console.log(`  - ${dados.count} respostas`);
        console.log(`  - ${dados.totalPontos} pontos`);
        console.log(`  - Respostas: [${dados.respostas.join(', ')}]`);
      });
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

verificarPerguntas();
