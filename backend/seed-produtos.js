import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de produtos...');

  // Limpar produtos existentes (cuidado em produção!)
  await prisma.produto.deleteMany({});
  console.log('✅ Produtos anteriores removidos');

  // Criar produtos
  const produtos = [
    {
      nome: 'Teste DISC',
      slug: 'teste-disc',
      descricao: 'Descubra seu perfil comportamental e potencialize suas habilidades de liderança e comunicação.',
      preco: 9.90,
      preco_original: null,
      tipo_teste: 'disc',
      icone: '🎯',
      ativo: true,
      destaque: false,
      features: [
        'Análise completa do perfil comportamental',
        'Relatório detalhado em PDF',
        'Gráficos personalizados',
        'Dicas de desenvolvimento'
      ],
      ordem: 1
    },
    {
      nome: 'Dominância Cerebral',
      slug: 'dominancia-cerebral',
      descricao: 'Identifique qual hemisfério do seu cérebro é mais ativo e aprenda a usar todo seu potencial.',
      preco: 9.90,
      preco_original: null,
      tipo_teste: 'dominancia',
      icone: '🧠',
      ativo: true,
      destaque: false,
      features: [
        'Mapeamento da dominância cerebral',
        'Relatório personalizado',
        'Estratégias de aprendizado',
        'Acesso vitalício'
      ],
      ordem: 2
    },
    {
      nome: 'Múltiplas Inteligências',
      slug: 'multiplas-inteligencias',
      descricao: 'Conheça suas inteligências mais desenvolvidas segundo a teoria de Howard Gardner.',
      preco: 9.90,
      preco_original: null,
      tipo_teste: 'inteligencias',
      icone: '✨',
      ativo: true,
      destaque: false,
      features: [
        'Análise de 8 tipos de inteligência',
        'Perfil completo de habilidades',
        'Sugestões de carreira',
        'Relatório em PDF'
      ],
      ordem: 3
    },
    {
      nome: 'Pacote Completo',
      slug: 'pacote-completo',
      descricao: 'Todos os 3 testes em um único pacote! Economize R$ 4,80 e tenha acesso completo ao seu autoconhecimento.',
      preco: 24.90,
      preco_original: 29.70,
      tipo_teste: 'combo',
      icone: '🎁',
      ativo: true,
      destaque: true,
      features: [
        'Teste DISC completo',
        'Dominância Cerebral',
        'Múltiplas Inteligências',
        'Economize R$ 4,80',
        'Relatório integrado',
        'Melhor custo-benefício'
      ],
      ordem: 0
    }
  ];

  for (const produto of produtos) {
    const created = await prisma.produto.create({
      data: produto
    });
    console.log(`✅ Produto criado: ${created.nome} (R$ ${created.preco})`);
  }

  console.log('');
  console.log('🎉 Seed de produtos concluído com sucesso!');
  console.log('');
  console.log('Produtos cadastrados:');
  console.log('- Teste DISC: R$ 9,90');
  console.log('- Dominância Cerebral: R$ 9,90');
  console.log('- Múltiplas Inteligências: R$ 9,90');
  console.log('- Pacote Completo: R$ 24,90 (antes R$ 29,70)');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
