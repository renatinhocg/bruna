import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function criarPossibilidades() {
  try {
    console.log('Conectando ao banco...');
    
    // Limpar possibilidades existentes
    await prisma.possibilidadeResposta.deleteMany({});
    console.log('Possibilidades antigas removidas');
    
    // Criar as 5 possibilidades padrão (escala 1-5)
    const possibilidades = [
      { texto: 'Discordo Completamente', valor: 1, ordem: 1, descricao: 'Não concordo de forma alguma com a afirmação' },
      { texto: 'Discordo um Pouco', valor: 2, ordem: 2, descricao: 'Discordo parcialmente da afirmação' },
      { texto: 'Incerto', valor: 3, ordem: 3, descricao: 'Neutro, não tenho certeza ou depende da situação' },
      { texto: 'Concordo um Pouco', valor: 4, ordem: 4, descricao: 'Concordo parcialmente com a afirmação' },
      { texto: 'Concordo Totalmente', valor: 5, ordem: 5, descricao: 'Concordo completamente com a afirmação' }
    ];
    
    console.log('Criando possibilidades...');
    for (const poss of possibilidades) {
      await prisma.possibilidadeResposta.create({
        data: {
          ...poss,
          ativo: true
        }
      });
      console.log(`✓ Criada: ${poss.texto}`);
    }
    
    console.log('✓ Possibilidades padrão criadas com sucesso!');
    
    // Verificar se foram criadas
    const result = await prisma.possibilidadeResposta.findMany({
      orderBy: { ordem: 'asc' }
    });
    
    console.log('\nPossibilidades no banco:');
    result.forEach(row => {
      console.log(`- ${row.texto} (valor: ${row.valor})`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarPossibilidades();
