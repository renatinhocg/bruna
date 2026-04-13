import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

const questoesDominancia = [
  {
    numero: 1,
    titulo: "Atividades de minha preferência na infância",
    instrucao: "assinale 4 opções com um X",
    ordem: 1,
    opcoes: [
      { numero: 1, texto: "Aeromodelismo", quadrante: "SE" },
      { numero: 2, texto: "Amarelinha", quadrante: "IE" },
      { numero: 3, texto: "Banco Imobiliário", quadrante: "SE" },
      { numero: 4, texto: "Boneca / Bonecos", quadrante: "ID" },
      { numero: 5, texto: "Bolinhas de Gude", quadrante: "IE" },
      { numero: 6, texto: "Ciranda", quadrante: "ID" },
      { numero: 7, texto: "Decifrar charadas", quadrante: "SD" },
      { numero: 8, texto: "Desenhar", quadrante: "SD" },
      { numero: 9, texto: "Desmontar aparelhos / ver como funcionam", quadrante: "SE" },
      { numero: 10, texto: "Empinar pipas", quadrante: "SD" },
      { numero: 11, texto: "Futebol de botão", quadrante: "IE" },
      { numero: 12, texto: "Jogo da Velha", quadrante: "IE" },
      { numero: 13, texto: "Jogos de Bola", quadrante: "ID" },
      { numero: 14, texto: "Mocinho / Bandido", quadrante: "ID" },
      { numero: 15, texto: "Quebra-cabeças", quadrante: "SD" },
      { numero: 16, texto: "Jogo de Xadrez", quadrante: "SE" }
    ]
  },
  {
    numero: 2,
    titulo: "Atividades de minha preferência na Escola",
    instrucao: "assinale 4",
    ordem: 2,
    opcoes: [
      { numero: 1, texto: "Aritmética / Matemática", quadrante: "SE" },
      { numero: 2, texto: "Ciências Físicas / Física", quadrante: "SE" },
      { numero: 3, texto: "Ciências Humanas / Psicologia", quadrante: "ID" },
      { numero: 4, texto: "Desenho Artístico", quadrante: "SD" },
      { numero: 5, texto: "Engenharia", quadrante: "SE" },
      { numero: 6, texto: "Economia", quadrante: "SE" },
      { numero: 7, texto: "Geografia", quadrante: "IE" },
      { numero: 8, texto: "Geometria", quadrante: "IE" },
      { numero: 9, texto: "História", quadrante: "ID" },
      { numero: 10, texto: "Leitura", quadrante: "IE" },
      { numero: 11, texto: "Línguas", quadrante: "ID" },
      { numero: 12, texto: "Música", quadrante: "SD" },
      { numero: 13, texto: "Poesia / Declamação", quadrante: "ID" },
      { numero: 14, texto: "Português / Gramática", quadrante: "IE" },
      { numero: 15, texto: "Redação / Composição", quadrante: "SD" },
      { numero: 16, texto: "Trabalhos Manuais", quadrante: "SD" }
    ]
  },
  {
    numero: 3,
    titulo: "Atividades de minha preferência no Trabalho",
    instrucao: "assinale 4",
    ordem: 3,
    opcoes: [
      { numero: 1, texto: "Administração de Processos / Procedimentos", quadrante: "IE" },
      { numero: 2, texto: "Análise de Problemas", quadrante: "SE" },
      { numero: 3, texto: "Assuntos Administrativos", quadrante: "IE" },
      { numero: 4, texto: "Assuntos Técnicos", quadrante: "SE" },
      { numero: 5, texto: "Assuntos Organizacionais / Estruturais", quadrante: "IE" },
      { numero: 6, texto: "Assuntos Humanos / Sociais", quadrante: "ID" },
      { numero: 7, texto: "Assuntos Financeiros", quadrante: "SE" },
      { numero: 8, texto: "Criação / Desenvolvimento de Ideias", quadrante: "SD" },
      { numero: 9, texto: "Ensinar / Treinar", quadrante: "ID" },
      { numero: 10, texto: "Orçamentos / Controles Financeiros", quadrante: "SE" },
      { numero: 11, texto: "Planejamento de Atividades", quadrante: "IE" },
      { numero: 12, texto: "Planejamento Estratégico", quadrante: "SD" },
      { numero: 13, texto: "Propaganda", quadrante: "SD" },
      { numero: 14, texto: "Relações Públicas", quadrante: "ID" },
      { numero: 15, texto: "Testes de Mercado", quadrante: "SD" },
      { numero: 16, texto: "Trabalho em Equipe", quadrante: "ID" }
    ]
  },
  {
    numero: 4,
    titulo: "Atividades de minha preferência no Lazer",
    instrucao: "assinale 4",
    ordem: 4,
    opcoes: [
      { numero: 1, texto: "Artesanato", quadrante: "SD" },
      { numero: 2, texto: "Arrumar coisas", quadrante: "IE" },
      { numero: 3, texto: "Assistir corridas", quadrante: "ID" },
      { numero: 4, texto: "Campismo", quadrante: "SD" },
      { numero: 5, texto: "Coleções", quadrante: "IE" },
      { numero: 6, texto: "Conhecer lugares novos", quadrante: "SD" },
      { numero: 7, texto: "Consertar Aparelhos", quadrante: "SE" },
      { numero: 8, texto: "Dançar", quadrante: "ID" },
      { numero: 9, texto: "Desenho / Pintura", quadrante: "SD" },
      { numero: 10, texto: "Esportes Coletivos", quadrante: "IE" },
      { numero: 11, texto: "Fotografia", quadrante: "IE" },
      { numero: 12, texto: "Jogar Xadrez", quadrante: "SE" },
      { numero: 13, texto: "Leituras Técnicas", quadrante: "SE" },
      { numero: 14, texto: "Pescar", quadrante: "ID" },
      { numero: 15, texto: "Reuniões Sociais", quadrante: "ID" },
      { numero: 16, texto: "Trabalhar com Micro / vídeo game", quadrante: "SE" }
    ]
  },
  {
    numero: 5,
    titulo: "Meus descritivos",
    instrucao: "assinale 4",
    ordem: 5,
    opcoes: [
      { numero: 1, texto: "Afetuoso (a)", quadrante: "ID" },
      { numero: 2, texto: "Crítico (a)", quadrante: "SE" },
      { numero: 3, texto: "Brincalhão / Brincalhona", quadrante: "SD" },
      { numero: 4, texto: "Cauteloso (a)", quadrante: "IE" },
      { numero: 5, texto: "Detalhista", quadrante: "IE" },
      { numero: 6, texto: "Emotivo (a)", quadrante: "ID" },
      { numero: 7, texto: "Esmerado (a)", quadrante: "IE" },
      { numero: 8, texto: "Extrovertido (a)", quadrante: "ID" },
      { numero: 9, texto: "Falante", quadrante: "ID" },
      { numero: 10, texto: "Fantasioso (a)", quadrante: "SD" },
      { numero: 11, texto: "Introvertido (a)", quadrante: "SE" },
      { numero: 12, texto: "Intuitivo (a)", quadrante: "SD" },
      { numero: 13, texto: "Organizado (a)", quadrante: "IE" },
      { numero: 14, texto: "Racional", quadrante: "SE" },
      { numero: 15, texto: "Subjetivo (a)", quadrante: "SD" },
      { numero: 16, texto: "Técnico (a)", quadrante: "SE" }
    ]
  },
  {
    numero: 6,
    titulo: "Minhas motivações",
    instrucao: "assinale uma opção em cada grupo",
    ordem: 6,
    temGrupos: true,
    grupos: [
      {
        titulo: "Eu trabalho melhor quando:",
        opcoes: [
          { numero: 1, texto: "Tudo está muito bem organizado.", quadrante: "IE", grupo: 1 },
          { numero: 2, texto: "Disponho de informações concretas.", quadrante: "SE", grupo: 1 },
          { numero: 3, texto: "Tenho oportunidade de usar a imaginação.", quadrante: "SD", grupo: 1 },
          { numero: 4, texto: "Posso compartilhar minhas ideias com outros.", quadrante: "ID", grupo: 1 }
        ]
      },
      {
        titulo: "Falta-me ânimo para empreender uma atividade em grupo quando:",
        opcoes: [
          { numero: 5, texto: "Não consigo visualizar sua utilidade prática.", quadrante: "SE", grupo: 2 },
          { numero: 6, texto: "Ela não apresenta desafio para minha inteligência.", quadrante: "SD", grupo: 2 },
          { numero: 7, texto: "Tenho que trabalhar sozinho.", quadrante: "ID", grupo: 2 },
          { numero: 8, texto: "Tenho que trabalhar com pessoas indisciplinadas.", quadrante: "IE", grupo: 2 }
        ]
      },
      {
        titulo: "Eu me entusiasmo com uma atividade quando:",
        opcoes: [
          { numero: 9, texto: "Conheço tudo a respeito.", quadrante: "SE", grupo: 3 },
          { numero: 10, texto: "Ela apresenta regras bem definidas.", quadrante: "IE", grupo: 3 },
          { numero: 11, texto: "As pessoas envolvidas trabalham em harmonia.", quadrante: "ID", grupo: 3 },
          { numero: 12, texto: "Posso testar minha capacidade.", quadrante: "SD", grupo: 3 }
        ]
      },
      {
        titulo: "Eu me aborreço quando:",
        opcoes: [
          { numero: 13, texto: "Vejo as coisas bagunçadas.", quadrante: "IE", grupo: 4 },
          { numero: 14, texto: "Não posso trabalhar com coisas concretas.", quadrante: "SE", grupo: 4 },
          { numero: 15, texto: "As pessoas discutem e brigam.", quadrante: "ID", grupo: 4 },
          { numero: 16, texto: "Cerceiam minha criatividade.", quadrante: "SD", grupo: 4 }
        ]
      }
    ]
  },
  {
    numero: 7,
    titulo: "Minhas Reações",
    instrucao: "assinale uma opção em cada grupo",
    ordem: 7,
    temGrupos: true,
    grupos: [
      {
        titulo: "Quando pedem minha aprovação para uma ideia:",
        opcoes: [
          { numero: 1, texto: "Quero examinar sua lógica e racionalidade.", quadrante: "SE", grupo: 1 },
          { numero: 2, texto: "Preciso ter confiança nas pessoas envolvidas.", quadrante: "ID", grupo: 1 },
          { numero: 3, texto: "Quero saber como ela será executada na prática.", quadrante: "IE", grupo: 1 },
          { numero: 4, texto: "Quero descobrir se ela é inovadora.", quadrante: "SD", grupo: 1 }
        ]
      },
      {
        titulo: "Quando resistem às minhas ideias:",
        opcoes: [
          { numero: 5, texto: "Explico, passo a passo, sua aplicação.", quadrante: "IE", grupo: 2 },
          { numero: 6, texto: "Demonstro seu valor com todos os dados e fatos.", quadrante: "SE", grupo: 2 },
          { numero: 7, texto: "Trato de conseguir a simpatia dos envolvidos.", quadrante: "ID", grupo: 2 },
          { numero: 8, texto: "Procuro estimular a imaginação dos envolvidos.", quadrante: "SD", grupo: 2 }
        ]
      },
      {
        titulo: "Quando não entendo uma instrução:",
        opcoes: [
          { numero: 9, texto: "Peço que me mostrem e expliquem sequencialmente.", quadrante: "IE", grupo: 3 },
          { numero: 10, texto: "Preciso examinar seus objetivos e detalhes.", quadrante: "SE", grupo: 3 },
          { numero: 11, texto: "É porque não gosto da instrução ou tenho problemas de relacionamento com as pessoas envolvidas.", quadrante: "ID", grupo: 3 },
          { numero: 12, texto: "É porque ela é muito conservadora.", quadrante: "SD", grupo: 3 }
        ]
      },
      {
        titulo: "Quando não entendem minhas instruções:",
        opcoes: [
          { numero: 13, texto: "Ilustro minhas explicações com alegorias e metáforas.", quadrante: "SD", grupo: 4 },
          { numero: 14, texto: 'Trato de chegar ao "coração" dos envolvidos.', quadrante: "ID", grupo: 4 },
          { numero: 15, texto: "Faço uma demonstração organizada de suas etapas.", quadrante: "IE", grupo: 4 },
          { numero: 16, texto: "Apelo para a razão dos envolvidos apresentando todos os fatos e dados.", quadrante: "SE", grupo: 4 }
        ]
      }
    ]
  },
  {
    numero: 8,
    titulo: "Minhas convicções",
    instrucao: 'assinale 4 frases que você "assinaria" em baixo',
    ordem: 8,
    opcoes: [
      { numero: 1, texto: "Só a informação traz o poder (S. Freud).", quadrante: "SE" },
      { numero: 2, texto: "Nunca caminho pelo caminho traçado, pois ele conduz somente até onde os outros chegaram (A. Bell).", quadrante: "SD" },
      { numero: 3, texto: "Se você quer civilizar um homem, comece pela avó dele (Victor Hugo).", quadrante: "ID" },
      { numero: 4, texto: "O que mais precisamos é de alguém que nos obrigue a fazer o que sabemos (Ralph Waldo Emerson).", quadrante: "IE" },
      { numero: 5, texto: "Mais vale um pássaro na mão do que dois voando (popular).", quadrante: "IE" },
      { numero: 6, texto: "O futuro pertence àqueles que acreditam na beleza de seus sonhos (Eleanor Roosevelt).", quadrante: "SD" },
      { numero: 7, texto: "Quem sabe mais chora menos (popular).", quadrante: "SE" },
      { numero: 8, texto: "Um irmão pode não ser um amigo, mas um amigo será sempre um irmão (Benjamin Franklin).", quadrante: "ID" },
      { numero: 9, texto: "O passo mais importante para chegar a concentrar-se é aprender a estar sozinho consigo mesmo (Erich Fromm).", quadrante: "SE" },
      { numero: 10, texto: "A imaginação é mais importante que o conhecimento (Albert Einstein).", quadrante: "SD" },
      { numero: 11, texto: "Uma andorinha só não faz verão (popular).", quadrante: "ID" },
      { numero: 12, texto: "Mais difícil do que levar uma vida organizada é impô-la aos outros (Marcel Proust).", quadrante: "IE" },
      { numero: 13, texto: "Uma alegria compartilhada se transforma em dupla alegria; uma dor compartilhada em meio dor (popular).", quadrante: "ID" },
      { numero: 14, texto: "O humor é a quebra da lógica (Henri Bergson).", quadrante: "SE" },
      { numero: 15, texto: "Quem não arrisca não petisca (popular).", quadrante: "SD" },
      { numero: 16, texto: "O discernimento consiste em saber até onde se pode ir (Jean Cocteau).", quadrante: "IE" }
    ]
  }
];

async function seedDominancia() {
  console.log('🧠 Iniciando seed do Teste de Dominância Cerebral...\n');

  try {
    // Limpar dados existentes
    console.log('🗑️  Limpando dados existentes...');
    await prisma.respostaDominancia.deleteMany({});
    await prisma.testeDominancia.deleteMany({});
    await prisma.opcaoDominancia.deleteMany({});
    await prisma.questaoDominancia.deleteMany({});
    console.log('✅ Dados antigos removidos\n');

    // Inserir questões e opções
    for (const questaoData of questoesDominancia) {
      console.log(`📝 Criando Questão ${questaoData.numero}: ${questaoData.titulo}`);
      
      const questao = await prisma.questaoDominancia.create({
        data: {
          numero: questaoData.numero,
          titulo: questaoData.titulo,
          instrucao: questaoData.instrucao,
          ordem: questaoData.ordem,
          ativo: true
        }
      });

      // Inserir opções da questão
      let totalOpcoes = 0;
      
      if (questaoData.temGrupos && questaoData.grupos) {
        // Questões com grupos (6 e 7)
        for (const grupoData of questaoData.grupos) {
          for (const opcaoData of grupoData.opcoes) {
            await prisma.opcaoDominancia.create({
              data: {
                questao_id: questao.id,
                numero: opcaoData.numero,
                texto: opcaoData.texto,
                quadrante: opcaoData.quadrante,
                grupo: opcaoData.grupo,
                ordem: opcaoData.numero,
                ativo: true
              }
            });
            totalOpcoes++;
          }
        }
      } else {
        // Questões normais (1, 2, 3, 4, 5, 8)
        for (const opcaoData of questaoData.opcoes) {
          await prisma.opcaoDominancia.create({
            data: {
              questao_id: questao.id,
              numero: opcaoData.numero,
              texto: opcaoData.texto,
              quadrante: opcaoData.quadrante,
              grupo: null,
              ordem: opcaoData.numero,
              ativo: true
            }
          });
          totalOpcoes++;
        }
      }

      console.log(`   ✅ ${totalOpcoes} opções criadas`);
    }

    // Estatísticas finais
    const totalQuestoes = await prisma.questaoDominancia.count();
    const totalOpcoes = await prisma.opcaoDominancia.count();
    
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Questões criadas: ${totalQuestoes}`);
    console.log(`   - Opções criadas: ${totalOpcoes}`);
    console.log(`   - Quadrantes: SE, SD, IE, ID`);
    
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seedDominancia()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
