import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function seedTestesInteligencia() {
  try {
    console.log('🔄 Criando categorias de inteligência...');

    // Criar categorias
    const categorias = [
      {
        nome: 'Linguística',
        descricao: 'Capacidade de usar a linguagem para expressar ideias e compreender outras pessoas',
        caracteristicas: JSON.stringify([
          'Gosta de ler e escrever',
          'Tem facilidade com idiomas',
          'Aprecia jogos de palavras',
          'Tem boa memória para nomes e datas'
        ]),
        carreiras: JSON.stringify([
          'Escritor',
          'Jornalista',
          'Advogado',
          'Professor de Línguas',
          'Tradutor',
          'Poeta'
        ])
      },
      {
        nome: 'Lógico-Matemática',
        descricao: 'Capacidade de raciocínio lógico, resolução de problemas matemáticos e científicos',
        caracteristicas: JSON.stringify([
          'Gosta de resolver problemas',
          'Tem facilidade com números',
          'Aprecia padrões e relações',
          'Pensa de forma abstrata'
        ]),
        carreiras: JSON.stringify([
          'Matemático',
          'Cientista',
          'Programador',
          'Engenheiro',
          'Contador',
          'Analista de Dados'
        ])
      },
      {
        nome: 'Espacial',
        descricao: 'Capacidade de visualizar e manipular objetos mentalmente',
        caracteristicas: JSON.stringify([
          'Boa orientação espacial',
          'Facilidade para desenhar',
          'Aprecia artes visuais',
          'Pensa em imagens'
        ]),
        carreiras: JSON.stringify([
          'Arquiteto',
          'Designer',
          'Artista Plástico',
          'Fotógrafo',
          'Piloto',
          'Cirurgião'
        ])
      },
      {
        nome: 'Corporal-Cinestésica',
        descricao: 'Capacidade de usar o corpo para expressar ideias e resolver problemas',
        caracteristicas: JSON.stringify([
          'Coordenação motora desenvolvida',
          'Gosta de atividades físicas',
          'Aprende fazendo',
          'Boa consciência corporal'
        ]),
        carreiras: JSON.stringify([
          'Atleta',
          'Dançarino',
          'Cirurgião',
          'Artesão',
          'Educador Físico',
          'Ator'
        ])
      },
      {
        nome: 'Musical',
        descricao: 'Capacidade de apreciar, criar e executar música',
        caracteristicas: JSON.stringify([
          'Sensibilidade a sons',
          'Facilidade para lembrar melodias',
          'Aprecia diferentes estilos musicais',
          'Senso de ritmo desenvolvido'
        ]),
        carreiras: JSON.stringify([
          'Músico',
          'Compositor',
          'Produtor Musical',
          'Professor de Música',
          'Cantor',
          'DJ'
        ])
      },
      {
        nome: 'Interpessoal',
        descricao: 'Capacidade de compreender e interagir efetivamente com outras pessoas',
        caracteristicas: JSON.stringify([
          'Empatia desenvolvida',
          'Facilidade para se comunicar',
          'Gosta de trabalhar em equipe',
          'Entende perspectivas alheias'
        ]),
        carreiras: JSON.stringify([
          'Psicólogo',
          'Professor',
          'Vendedor',
          'Consultor',
          'Assistente Social',
          'Coach'
        ])
      },
      {
        nome: 'Intrapessoal',
        descricao: 'Capacidade de autoconhecimento e reflexão sobre si mesmo',
        caracteristicas: JSON.stringify([
          'Autoconhecimento desenvolvido',
          'Gosta de reflexão',
          'Independente',
          'Consciência das próprias emoções'
        ]),
        carreiras: JSON.stringify([
          'Filósofo',
          'Escritor',
          'Terapeuta',
          'Pesquisador',
          'Empreendedor',
          'Consultor'
        ])
      },
      {
        nome: 'Naturalista',
        descricao: 'Capacidade de observar, compreender e organizar padrões na natureza',
        caracteristicas: JSON.stringify([
          'Aprecia a natureza',
          'Facilidade para classificar',
          'Sensibilidade ambiental',
          'Gosta de animais e plantas'
        ]),
        carreiras: JSON.stringify([
          'Biólogo',
          'Veterinário',
          'Agrônomo',
          'Ambientalista',
          'Jardineiro',
          'Geólogo'
        ])
      }
    ];

    const categoriasCreated = [];
    for (const cat of categorias) {
      const created = await prisma.categoria.create({ data: cat });
      categoriasCreated.push(created);
      console.log(`✓ Categoria criada: ${created.nome}`);
    }

    console.log('\n🔄 Criando perguntas...');

    // Perguntas por categoria (8 perguntas por categoria)
    const perguntas = [
      // LINGUÍSTICA
      { texto: 'Gosto de ler livros, revistas e outros textos', categoria_id: categoriasCreated[0].id, ordem: 1 },
      { texto: 'Tenho facilidade para expressar minhas ideias por escrito', categoria_id: categoriasCreated[0].id, ordem: 2 },
      { texto: 'Aprecio jogos de palavras e trocadilhos', categoria_id: categoriasCreated[0].id, ordem: 3 },
      { texto: 'Gosto de aprender novos idiomas', categoria_id: categoriasCreated[0].id, ordem: 4 },
      { texto: 'Tenho facilidade para memorizar nomes, datas e informações verbais', categoria_id: categoriasCreated[0].id, ordem: 5 },
      { texto: 'Aprecio debates e discussões sobre diversos assuntos', categoria_id: categoriasCreated[0].id, ordem: 6 },
      { texto: 'Gosto de contar histórias e piadas', categoria_id: categoriasCreated[0].id, ordem: 7 },
      { texto: 'Aprendo melhor através de leitura e audição', categoria_id: categoriasCreated[0].id, ordem: 8 },

      // LÓGICO-MATEMÁTICA
      { texto: 'Gosto de resolver problemas matemáticos e enigmas lógicos', categoria_id: categoriasCreated[1].id, ordem: 9 },
      { texto: 'Tenho facilidade para identificar padrões e relações', categoria_id: categoriasCreated[1].id, ordem: 10 },
      { texto: 'Aprecio jogos de estratégia como xadrez', categoria_id: categoriasCreated[1].id, ordem: 11 },
      { texto: 'Gosto de fazer experimentos e testar hipóteses', categoria_id: categoriasCreated[1].id, ordem: 12 },
      { texto: 'Prefiro explicações baseadas em lógica e evidências', categoria_id: categoriasCreated[1].id, ordem: 13 },
      { texto: 'Tenho facilidade para trabalhar com números e cálculos', categoria_id: categoriasCreated[1].id, ordem: 14 },
      { texto: 'Gosto de organizar e categorizar informações', categoria_id: categoriasCreated[1].id, ordem: 15 },
      { texto: 'Aprendo melhor quando entendo a lógica por trás das coisas', categoria_id: categoriasCreated[1].id, ordem: 16 },

      // ESPACIAL
      { texto: 'Tenho facilidade para me orientar em lugares novos', categoria_id: categoriasCreated[2].id, ordem: 17 },
      { texto: 'Gosto de desenhar, pintar ou criar imagens', categoria_id: categoriasCreated[2].id, ordem: 18 },
      { texto: 'Aprecio artes visuais e design', categoria_id: categoriasCreated[2].id, ordem: 19 },
      { texto: 'Consigo visualizar objetos em três dimensões mentalmente', categoria_id: categoriasCreated[2].id, ordem: 20 },
      { texto: 'Tenho facilidade para montar quebra-cabeças', categoria_id: categoriasCreated[2].id, ordem: 21 },
      { texto: 'Prefiro mapas e diagramas a explicações verbais', categoria_id: categoriasCreated[2].id, ordem: 22 },
      { texto: 'Gosto de fotografar e filmar', categoria_id: categoriasCreated[2].id, ordem: 23 },
      { texto: 'Aprendo melhor com recursos visuais', categoria_id: categoriasCreated[2].id, ordem: 24 },

      // CORPORAL-CINESTÉSICA
      { texto: 'Gosto de praticar esportes e atividades físicas', categoria_id: categoriasCreated[3].id, ordem: 25 },
      { texto: 'Tenho boa coordenação motora', categoria_id: categoriasCreated[3].id, ordem: 26 },
      { texto: 'Aprendo melhor fazendo e praticando', categoria_id: categoriasCreated[3].id, ordem: 27 },
      { texto: 'Gosto de trabalhar com as mãos (artesanato, construção, etc.)', categoria_id: categoriasCreated[3].id, ordem: 28 },
      { texto: 'Tenho dificuldade em ficar parado por muito tempo', categoria_id: categoriasCreated[3].id, ordem: 29 },
      { texto: 'Aprecio dança e expressão corporal', categoria_id: categoriasCreated[3].id, ordem: 30 },
      { texto: 'Tenho boa consciência do meu corpo no espaço', categoria_id: categoriasCreated[3].id, ordem: 31 },
      { texto: 'Gosto de atividades que envolvem movimento', categoria_id: categoriasCreated[3].id, ordem: 32 },

      // MUSICAL
      { texto: 'Gosto de ouvir música de diferentes estilos', categoria_id: categoriasCreated[4].id, ordem: 33 },
      { texto: 'Consigo lembrar facilmente de melodias', categoria_id: categoriasCreated[4].id, ordem: 34 },
      { texto: 'Tenho senso de ritmo desenvolvido', categoria_id: categoriasCreated[4].id, ordem: 35 },
      { texto: 'Gosto de cantar ou tocar instrumentos', categoria_id: categoriasCreated[4].id, ordem: 36 },
      { texto: 'Percebo quando algo está fora do tom', categoria_id: categoriasCreated[4].id, ordem: 37 },
      { texto: 'Música ajuda minha concentração', categoria_id: categoriasCreated[4].id, ordem: 38 },
      { texto: 'Gosto de criar melodias ou batidas', categoria_id: categoriasCreated[4].id, ordem: 39 },
      { texto: 'Aprendo melhor quando há música envolvida', categoria_id: categoriasCreated[4].id, ordem: 40 },

      // INTERPESSOAL
      { texto: 'Gosto de trabalhar em equipe', categoria_id: categoriasCreated[5].id, ordem: 41 },
      { texto: 'Tenho facilidade para fazer amigos', categoria_id: categoriasCreated[5].id, ordem: 42 },
      { texto: 'Consigo perceber as emoções das outras pessoas', categoria_id: categoriasCreated[5].id, ordem: 43 },
      { texto: 'Gosto de ajudar e aconselhar outras pessoas', categoria_id: categoriasCreated[5].id, ordem: 44 },
      { texto: 'Aprecio atividades sociais e festas', categoria_id: categoriasCreated[5].id, ordem: 45 },
      { texto: 'Tenho facilidade para liderar grupos', categoria_id: categoriasCreated[5].id, ordem: 46 },
      { texto: 'Gosto de ouvir os problemas dos outros', categoria_id: categoriasCreated[5].id, ordem: 47 },
      { texto: 'Aprendo melhor em discussões e trabalhos em grupo', categoria_id: categoriasCreated[5].id, ordem: 48 },

      // INTRAPESSOAL
      { texto: 'Gosto de momentos de reflexão e introspecção', categoria_id: categoriasCreated[6].id, ordem: 49 },
      { texto: 'Tenho consciência das minhas emoções e motivações', categoria_id: categoriasCreated[6].id, ordem: 50 },
      { texto: 'Prefiro trabalhar sozinho em projetos', categoria_id: categoriasCreated[6].id, ordem: 51 },
      { texto: 'Gosto de escrever diários ou fazer reflexões pessoais', categoria_id: categoriasCreated[6].id, ordem: 52 },
      { texto: 'Tenho objetivos pessoais bem definidos', categoria_id: categoriasCreated[6].id, ordem: 53 },
      { texto: 'Aprecio atividades solitárias como leitura e meditação', categoria_id: categoriasCreated[6].id, ordem: 54 },
      { texto: 'Conheço bem meus pontos fortes e fracos', categoria_id: categoriasCreated[6].id, ordem: 55 },
      { texto: 'Aprendo melhor no meu próprio ritmo', categoria_id: categoriasCreated[6].id, ordem: 56 },

      // NATURALISTA
      { texto: 'Gosto de estar em contato com a natureza', categoria_id: categoriasCreated[7].id, ordem: 57 },
      { texto: 'Tenho interesse por plantas e animais', categoria_id: categoriasCreated[7].id, ordem: 58 },
      { texto: 'Aprecio atividades ao ar livre', categoria_id: categoriasCreated[7].id, ordem: 59 },
      { texto: 'Gosto de observar e classificar elementos naturais', categoria_id: categoriasCreated[7].id, ordem: 60 },
      { texto: 'Me preocupo com questões ambientais', categoria_id: categoriasCreated[7].id, ordem: 61 },
      { texto: 'Tenho facilidade para identificar padrões na natureza', categoria_id: categoriasCreated[7].id, ordem: 62 },
      { texto: 'Gosto de cuidar de plantas ou animais', categoria_id: categoriasCreated[7].id, ordem: 63 },
      { texto: 'Aprendo melhor em ambientes naturais', categoria_id: categoriasCreated[7].id, ordem: 64 }
    ];

    for (const pergunta of perguntas) {
      await prisma.pergunta.create({ data: pergunta });
    }

    console.log(`✅ ${perguntas.length} perguntas criadas com sucesso!`);
    console.log('\n🎉 Banco de dados populado com teste de múltiplas inteligências!');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestesInteligencia();
