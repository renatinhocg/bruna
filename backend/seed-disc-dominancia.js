import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function seedDISCeDominancia() {
  try {
    console.log('🚀 Iniciando população dos testes DISC e Dominância Cerebral...\n');

    // =========================================
    // 1. TESTE DISC
    // =========================================
    console.log('📊 1. TESTE DISC');
    console.log('─────────────────');

    // Verificar se já existe
    const discExistente = await prisma.questaoDISC.count();
    if (discExistente > 0) {
      console.log(`  ⏭️  Pulando - já existem ${discExistente} questões\n`);
    } else {
      const questoesDISC = [];

      // Criar 24 questões DISC
      for (let i = 1; i <= 24; i++) {
        const questao = await prisma.questaoDISC.create({
          data: {
            numero: i,
            instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
            ordem: i,
            ativo: true
          }
        });
        questoesDISC.push(questao);
      }
      console.log(`  ✓ 24 questões criadas`);

    // Opções para cada questão (4 opções por questão - D, I, S, C)
    const opcoesPorQuestao = [
      // Questão 1
      { questao_id: 1, texto: 'Assertivo e direto', fator: 'D', ordem: 1 },
      { questao_id: 1, texto: 'Entusiasmado e comunicativo', fator: 'I', ordem: 2 },
      { questao_id: 1, texto: 'Calmo e paciente', fator: 'S', ordem: 3 },
      { questao_id: 1, texto: 'Analítico e preciso', fator: 'C', ordem: 4 },
      // Questão 2
      { questao_id: 2, texto: 'Competitivo e determinado', fator: 'D', ordem: 1 },
      { questao_id: 2, texto: 'Amigável e sociável', fator: 'I', ordem: 2 },
      { questao_id: 2, texto: 'Leal e estável', fator: 'S', ordem: 3 },
      { questao_id: 2, texto: 'Cauteloso e sistemático', fator: 'C', ordem: 4 },
      // Questão 3
      { questao_id: 3, texto: 'Decidido e corajoso', fator: 'D', ordem: 1 },
      { questao_id: 3, texto: 'Persuasivo e inspirador', fator: 'I', ordem: 2 },
      { questao_id: 3, texto: 'Apoiador e colaborativo', fator: 'S', ordem: 3 },
      { questao_id: 3, texto: 'Detalhista e organizado', fator: 'C', ordem: 4 },
      // Questão 4
      { questao_id: 4, texto: 'Focado em resultados', fator: 'D', ordem: 1 },
      { questao_id: 4, texto: 'Otimista e expressivo', fator: 'I', ordem: 2 },
      { questao_id: 4, texto: 'Paciente e compreensivo', fator: 'S', ordem: 3 },
      { questao_id: 4, texto: 'Preciso e metódico', fator: 'C', ordem: 4 },
      // Questão 5
      { questao_id: 5, texto: 'Ousado e desafiador', fator: 'D', ordem: 1 },
      { questao_id: 5, texto: 'Popular e carismático', fator: 'I', ordem: 2 },
      { questao_id: 5, texto: 'Confiável e consistente', fator: 'S', ordem: 3 },
      { questao_id: 5, texto: 'Objetivo e lógico', fator: 'C', ordem: 4 },
      // Questão 6
      { questao_id: 6, texto: 'Decisivo e firme', fator: 'D', ordem: 1 },
      { questao_id: 6, texto: 'Animado e positivo', fator: 'I', ordem: 2 },
      { questao_id: 6, texto: 'Gentil e prestativo', fator: 'S', ordem: 3 },
      { questao_id: 6, texto: 'Cuidadoso e criterioso', fator: 'C', ordem: 4 },
      // Questão 7
      { questao_id: 7, texto: 'Líder natural', fator: 'D', ordem: 1 },
      { questao_id: 7, texto: 'Comunicativo e convincente', fator: 'I', ordem: 2 },
      { questao_id: 7, texto: 'Diplomático e harmonioso', fator: 'S', ordem: 3 },
      { questao_id: 7, texto: 'Perfeccionista e exigente', fator: 'C', ordem: 4 },
      // Questão 8
      { questao_id: 8, texto: 'Independente e autoconfiante', fator: 'D', ordem: 1 },
      { questao_id: 8, texto: 'Espontâneo e criativo', fator: 'I', ordem: 2 },
      { questao_id: 8, texto: 'Modesto e reservado', fator: 'S', ordem: 3 },
      { questao_id: 8, texto: 'Conservador e tradicional', fator: 'C', ordem: 4 },
      // Questão 9
      { questao_id: 9, texto: 'Impaciente e inquieto', fator: 'D', ordem: 1 },
      { questao_id: 9, texto: 'Desorganizado e disperso', fator: 'I', ordem: 2 },
      { questao_id: 9, texto: 'Indeciso e dependente', fator: 'S', ordem: 3 },
      { questao_id: 9, texto: 'Crítico e pessimista', fator: 'C', ordem: 4 },
      // Questão 10
      { questao_id: 10, texto: 'Controlador e dominante', fator: 'D', ordem: 1 },
      { questao_id: 10, texto: 'Superficial e exagerado', fator: 'I', ordem: 2 },
      { questao_id: 10, texto: 'Conformista e passivo', fator: 'S', ordem: 3 },
      { questao_id: 10, texto: 'Distante e frio', fator: 'C', ordem: 4 },
      // Questão 11
      { questao_id: 11, texto: 'Busco desafios constantemente', fator: 'D', ordem: 1 },
      { questao_id: 11, texto: 'Gosto de interagir com pessoas', fator: 'I', ordem: 2 },
      { questao_id: 11, texto: 'Prefiro ambientes estáveis', fator: 'S', ordem: 3 },
      { questao_id: 11, texto: 'Valorizo qualidade e precisão', fator: 'C', ordem: 4 },
      // Questão 12
      { questao_id: 12, texto: 'Tomo decisões rapidamente', fator: 'D', ordem: 1 },
      { questao_id: 12, texto: 'Inspiro e motivo outros', fator: 'I', ordem: 2 },
      { questao_id: 12, texto: 'Sou bom ouvinte', fator: 'S', ordem: 3 },
      { questao_id: 12, texto: 'Planejo cuidadosamente', fator: 'C', ordem: 4 },
      // Questão 13
      { questao_id: 13, texto: 'Enfrento problemas de frente', fator: 'D', ordem: 1 },
      { questao_id: 13, texto: 'Crio ambiente agradável', fator: 'I', ordem: 2 },
      { questao_id: 13, texto: 'Evito conflitos', fator: 'S', ordem: 3 },
      { questao_id: 13, texto: 'Sigo regras e procedimentos', fator: 'C', ordem: 4 },
      // Questão 14
      { questao_id: 14, texto: 'Assumo o controle naturalmente', fator: 'D', ordem: 1 },
      { questao_id: 14, texto: 'Gosto de trabalhar com equipes', fator: 'I', ordem: 2 },
      { questao_id: 14, texto: 'Mantenho a calma sob pressão', fator: 'S', ordem: 3 },
      { questao_id: 14, texto: 'Faço pesquisa antes de agir', fator: 'C', ordem: 4 },
      // Questão 15
      { questao_id: 15, texto: 'Sou direto ao ponto', fator: 'D', ordem: 1 },
      { questao_id: 15, texto: 'Expresso emoções facilmente', fator: 'I', ordem: 2 },
      { questao_id: 15, texto: 'Sou paciente com os outros', fator: 'S', ordem: 3 },
      { questao_id: 15, texto: 'Verifico todos os detalhes', fator: 'C', ordem: 4 },
      // Questão 16
      { questao_id: 16, texto: 'Gosto de competir', fator: 'D', ordem: 1 },
      { questao_id: 16, texto: 'Gosto de socializar', fator: 'I', ordem: 2 },
      { questao_id: 16, texto: 'Gosto de ajudar', fator: 'S', ordem: 3 },
      { questao_id: 16, texto: 'Gosto de analisar', fator: 'C', ordem: 4 },
      // Questão 17
      { questao_id: 17, texto: 'Foco nos objetivos', fator: 'D', ordem: 1 },
      { questao_id: 17, texto: 'Foco nas pessoas', fator: 'I', ordem: 2 },
      { questao_id: 17, texto: 'Foco na harmonia', fator: 'S', ordem: 3 },
      { questao_id: 17, texto: 'Foco na qualidade', fator: 'C', ordem: 4 },
      // Questão 18
      { questao_id: 18, texto: 'Argumento meu ponto de vista', fator: 'D', ordem: 1 },
      { questao_id: 18, texto: 'Persuado com entusiasmo', fator: 'I', ordem: 2 },
      { questao_id: 18, texto: 'Busco consenso', fator: 'S', ordem: 3 },
      { questao_id: 18, texto: 'Apresento fatos e dados', fator: 'C', ordem: 4 },
      // Questão 19
      { questao_id: 19, texto: 'Ajo rapidamente', fator: 'D', ordem: 1 },
      { questao_id: 19, texto: 'Ajo com entusiasmo', fator: 'I', ordem: 2 },
      { questao_id: 19, texto: 'Ajo com cautela', fator: 'S', ordem: 3 },
      { questao_id: 19, texto: 'Ajo com planejamento', fator: 'C', ordem: 4 },
      // Questão 20
      { questao_id: 20, texto: 'Valorizo eficiência', fator: 'D', ordem: 1 },
      { questao_id: 20, texto: 'Valorizo relacionamentos', fator: 'I', ordem: 2 },
      { questao_id: 20, texto: 'Valorizo estabilidade', fator: 'S', ordem: 3 },
      { questao_id: 20, texto: 'Valorizo precisão', fator: 'C', ordem: 4 },
      // Questão 21
      { questao_id: 21, texto: 'Comunico de forma direta', fator: 'D', ordem: 1 },
      { questao_id: 21, texto: 'Comunico de forma expressiva', fator: 'I', ordem: 2 },
      { questao_id: 21, texto: 'Comunico de forma suave', fator: 'S', ordem: 3 },
      { questao_id: 21, texto: 'Comunico de forma objetiva', fator: 'C', ordem: 4 },
      // Questão 22
      { questao_id: 22, texto: 'Prefiro liderar', fator: 'D', ordem: 1 },
      { questao_id: 22, texto: 'Prefiro influenciar', fator: 'I', ordem: 2 },
      { questao_id: 22, texto: 'Prefiro cooperar', fator: 'S', ordem: 3 },
      { questao_id: 22, texto: 'Prefiro analisar', fator: 'C', ordem: 4 },
      // Questão 23
      { questao_id: 23, texto: 'Sou focado e objetivo', fator: 'D', ordem: 1 },
      { questao_id: 23, texto: 'Sou otimista e empolgado', fator: 'I', ordem: 2 },
      { questao_id: 23, texto: 'Sou calmo e equilibrado', fator: 'S', ordem: 3 },
      { questao_id: 23, texto: 'Sou lógico e racional', fator: 'C', ordem: 4 },
      // Questão 24
      { questao_id: 24, texto: 'Busco autoridade', fator: 'D', ordem: 1 },
      { questao_id: 24, texto: 'Busco popularidade', fator: 'I', ordem: 2 },
      { questao_id: 24, texto: 'Busco segurança', fator: 'S', ordem: 3 },
      { questao_id: 24, texto: 'Busco excelência', fator: 'C', ordem: 4 }
    ];

      for (const opcao of opcoesPorQuestao) {
        await prisma.opcaoDISC.create({
          data: {
            questao_id: questoesDISC[opcao.questao_id - 1].id,
            texto: opcao.texto,
            fator: opcao.fator,
            ordem: opcao.ordem
          }
        });
      }

      console.log(`  ✓ ${opcoesPorQuestao.length} opções criadas\n`);
    }

    // =========================================
    // 2. TESTE DOMINÂNCIA CEREBRAL
    // =========================================
    console.log('🧠 2. DOMINÂNCIA CEREBRAL');
    console.log('─────────────────────────');

    // Estrutura do Herrmann (8 questões com 16 opções cada)
    const questoesDominancia = [
      { numero: 1, titulo: 'Atividades de minha preferência na infância', instrucao: 'Assinale 4 opções', ordem: 1 },
      { numero: 2, titulo: 'Tipo de livros preferidos', instrucao: 'Assinale 4 opções', ordem: 2 },
      { numero: 3, titulo: 'Situações que mais me agradam', instrucao: 'Assinale 4 opções', ordem: 3 },
      { numero: 4, titulo: 'Tipos de filmes preferidos', instrucao: 'Assinale 4 opções', ordem: 4 },
      { numero: 5, titulo: 'Atividades de lazer', instrucao: 'Assinale 4 opções', ordem: 5 },
      { numero: 6, titulo: 'Como prefiro resolver problemas', instrucao: 'Assinale 4 opções', ordem: 6 },
      { numero: 7, titulo: 'Qualidades pessoais', instrucao: 'Assinale 4 opções', ordem: 7 },
      { numero: 8, titulo: 'Ambiente de trabalho ideal', instrucao: 'Assinale 4 opções', ordem: 8 }
    ];

    const questoesCriadas = [];
    for (const q of questoesDominancia) {
      const questao = await prisma.questaoDominancia.create({ data: q });
      questoesCriadas.push(questao);
    }
    console.log(`  ✓ ${questoesCriadas.length} questões criadas`);

    // Opções para cada questão (16 opções por questão, 4 de cada quadrante)
    const opcoesDominancia = [
      // Questão 1 - Atividades de minha preferência na infância
      { questao: 1, numero: 1, texto: 'Resolver quebra-cabeças', quadrante: 'A' },
      { questao: 1, numero: 2, texto: 'Ler livros de matemática', quadrante: 'A' },
      { questao: 1, numero: 3, texto: 'Fazer experimentos', quadrante: 'A' },
      { questao: 1, numero: 4, texto: 'Construir coisas com blocos', quadrante: 'A' },
      { questao: 1, numero: 5, texto: 'Organizar coleções', quadrante: 'B' },
      { questao: 1, numero: 6, texto: 'Seguir regras de jogos', quadrante: 'B' },
      { questao: 1, numero: 7, texto: 'Arrumar meus brinquedos', quadrante: 'B' },
      { questao: 1, numero: 8, texto: 'Fazer tarefas domésticas', quadrante: 'B' },
      { questao: 1, numero: 9, texto: 'Brincar com amigos', quadrante: 'C' },
      { questao: 1, numero: 10, texto: 'Ajudar os outros', quadrante: 'C' },
      { questao: 1, numero: 11, texto: 'Conversar muito', quadrante: 'C' },
      { questao: 1, numero: 12, texto: 'Participar de grupos', quadrante: 'C' },
      { questao: 1, numero: 13, texto: 'Desenhar e pintar', quadrante: 'D' },
      { questao: 1, numero: 14, texto: 'Inventar histórias', quadrante: 'D' },
      { questao: 1, numero: 15, texto: 'Fazer música', quadrante: 'D' },
      { questao: 1, numero: 16, texto: 'Imaginar aventuras', quadrante: 'D' },
      
      // Questão 2 - Tipo de livros preferidos
      { questao: 2, numero: 1, texto: 'Ciências e tecnologia', quadrante: 'A' },
      { questao: 2, numero: 2, texto: 'Matemática aplicada', quadrante: 'A' },
      { questao: 2, numero: 3, texto: 'Análise crítica', quadrante: 'A' },
      { questao: 2, numero: 4, texto: 'Pesquisas científicas', quadrante: 'A' },
      { questao: 2, numero: 5, texto: 'Manuais e guias', quadrante: 'B' },
      { questao: 2, numero: 6, texto: 'História e biografia', quadrante: 'B' },
      { questao: 2, numero: 7, texto: 'Autoajuda prático', quadrante: 'B' },
      { questao: 2, numero: 8, texto: 'Enciclopédias', quadrante: 'B' },
      { questao: 2, numero: 9, texto: 'Psicologia e relações', quadrante: 'C' },
      { questao: 2, numero: 10, texto: 'Romances', quadrante: 'C' },
      { questao: 2, numero: 11, texto: 'Poesias', quadrante: 'C' },
      { questao: 2, numero: 12, texto: 'Desenvolvimento pessoal', quadrante: 'C' },
      { questao: 2, numero: 13, texto: 'Ficção científica', quadrante: 'D' },
      { questao: 2, numero: 14, texto: 'Arte e design', quadrante: 'D' },
      { questao: 2, numero: 15, texto: 'Filosofia', quadrante: 'D' },
      { questao: 2, numero: 16, texto: 'Fantasia e aventura', quadrante: 'D' },

      // Questão 3 - Situações que mais me agradam
      { questao: 3, numero: 1, texto: 'Resolver problemas complexos', quadrante: 'A' },
      { questao: 3, numero: 2, texto: 'Analisar dados', quadrante: 'A' },
      { questao: 3, numero: 3, texto: 'Debater ideias lógicas', quadrante: 'A' },
      { questao: 3, numero: 4, texto: 'Fazer cálculos', quadrante: 'A' },
      { questao: 3, numero: 5, texto: 'Organizar arquivos', quadrante: 'B' },
      { questao: 3, numero: 6, texto: 'Seguir procedimentos', quadrante: 'B' },
      { questao: 3, numero: 7, texto: 'Planejar eventos', quadrante: 'B' },
      { questao: 3, numero: 8, texto: 'Manter rotinas', quadrante: 'B' },
      { questao: 3, numero: 9, texto: 'Trabalhar em equipe', quadrante: 'C' },
      { questao: 3, numero: 10, texto: 'Ajudar pessoas', quadrante: 'C' },
      { questao: 3, numero: 11, texto: 'Socializar', quadrante: 'C' },
      { questao: 3, numero: 12, texto: 'Expressar emoções', quadrante: 'C' },
      { questao: 3, numero: 13, texto: 'Criar soluções inovadoras', quadrante: 'D' },
      { questao: 3, numero: 14, texto: 'Pensar no futuro', quadrante: 'D' },
      { questao: 3, numero: 15, texto: 'Explorar possibilidades', quadrante: 'D' },
      { questao: 3, numero: 16, texto: 'Ter ideias originais', quadrante: 'D' }
    ];

    let totalOpcoes = 0;
    for (const opcao of opcoesDominancia) {
      await prisma.opcaoDominancia.create({
        data: {
          questao_id: questoesCriadas[opcao.questao - 1].id,
          numero: opcao.numero,
          texto: opcao.texto,
          quadrante: opcao.quadrante,
          ordem: opcao.numero
        }
      });
      totalOpcoes++;
    }
    console.log(`  ✓ ${totalOpcoes} opções criadas\n`);

    console.log('✅ POPULAÇÃO COMPLETA!');
    console.log('═════════════════════════════════════');
    console.log(`📊 DISC: 24 questões + 96 opções`);
    console.log(`🧠 Dominância Cerebral: 8 questões + 48 opções`);
    console.log('═════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDISCeDominancia();
