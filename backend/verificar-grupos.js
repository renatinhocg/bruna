import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function verificar() {
  try {
    console.log('🔍 Verificando questão 6...\n');
    
    const questao6 = await prisma.questaoDominancia.findFirst({
      where: { numero: 6 },
      include: { opcoes: { orderBy: { numero: 'asc' } } }
    });
    
    if (questao6) {
      console.log(`Questão 6: ${questao6.titulo}`);
      console.log(`Total de opções: ${questao6.opcoes.length}\n`);
      
      const grupos = {};
      questao6.opcoes.forEach(opcao => {
        if (!grupos[opcao.grupo]) {
          grupos[opcao.grupo] = [];
        }
        grupos[opcao.grupo].push(opcao);
      });
      
      Object.keys(grupos).sort().forEach(grupoNum => {
        console.log(`\n📦 Grupo ${grupoNum || 'null'}:`);
        grupos[grupoNum].forEach(o => {
          console.log(`   ${o.numero}. ${o.texto.substring(0, 50)}... (${o.quadrante})`);
        });
      });
    }
    
    console.log('\n\n🔍 Verificando questão 7...\n');
    
    const questao7 = await prisma.questaoDominancia.findFirst({
      where: { numero: 7 },
      include: { opcoes: { orderBy: { numero: 'asc' } } }
    });
    
    if (questao7) {
      console.log(`Questão 7: ${questao7.titulo}`);
      console.log(`Total de opções: ${questao7.opcoes.length}\n`);
      
      const grupos = {};
      questao7.opcoes.forEach(opcao => {
        if (!grupos[opcao.grupo]) {
          grupos[opcao.grupo] = [];
        }
        grupos[opcao.grupo].push(opcao);
      });
      
      Object.keys(grupos).sort().forEach(grupoNum => {
        console.log(`\n📦 Grupo ${grupoNum || 'null'}:`);
        grupos[grupoNum].forEach(o => {
          console.log(`   ${o.numero}. ${o.texto.substring(0, 50)}... (${o.quadrante})`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
