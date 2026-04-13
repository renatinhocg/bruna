import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

// Perguntas do teste DISC com 4 opções cada (D, I, S, C)
const questoesDISC = [
  {
    numero: 1,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Determinado', fator: 'D', ordem: 1 },
      { texto: 'Entusiasmado', fator: 'I', ordem: 2 },
      { texto: 'Calmo', fator: 'S', ordem: 3 },
      { texto: 'Analítico', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 2,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Competitivo', fator: 'D', ordem: 1 },
      { texto: 'Sociável', fator: 'I', ordem: 2 },
      { texto: 'Paciente', fator: 'S', ordem: 3 },
      { texto: 'Preciso', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 3,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Direto', fator: 'D', ordem: 1 },
      { texto: 'Comunicativo', fator: 'I', ordem: 2 },
      { texto: 'Leal', fator: 'S', ordem: 3 },
      { texto: 'Cauteloso', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 4,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Decidido', fator: 'D', ordem: 1 },
      { texto: 'Persuasivo', fator: 'I', ordem: 2 },
      { texto: 'Estável', fator: 'S', ordem: 3 },
      { texto: 'Sistemático', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 5,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Ousado', fator: 'D', ordem: 1 },
      { texto: 'Expressivo', fator: 'I', ordem: 2 },
      { texto: 'Previsível', fator: 'S', ordem: 3 },
      { texto: 'Diplomático', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 6,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Assertivo', fator: 'D', ordem: 1 },
      { texto: 'Animado', fator: 'I', ordem: 2 },
      { texto: 'Consistente', fator: 'S', ordem: 3 },
      { texto: 'Meticuloso', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 7,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Autoritário', fator: 'D', ordem: 1 },
      { texto: 'Inspirador', fator: 'I', ordem: 2 },
      { texto: 'Tolerante', fator: 'S', ordem: 3 },
      { texto: 'Exigente', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 8,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Objetivo', fator: 'D', ordem: 1 },
      { texto: 'Otimista', fator: 'I', ordem: 2 },
      { texto: 'Colaborativo', fator: 'S', ordem: 3 },
      { texto: 'Detalhista', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 9,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Corajoso', fator: 'D', ordem: 1 },
      { texto: 'Caloroso', fator: 'I', ordem: 2 },
      { texto: 'Equilibrado', fator: 'S', ordem: 3 },
      { texto: 'Reservado', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 10,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Independente', fator: 'D', ordem: 1 },
      { texto: 'Encantador', fator: 'I', ordem: 2 },
      { texto: 'Agradável', fator: 'S', ordem: 3 },
      { texto: 'Cuidadoso', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 11,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Enérgico', fator: 'D', ordem: 1 },
      { texto: 'Popular', fator: 'I', ordem: 2 },
      { texto: 'Compreensivo', fator: 'S', ordem: 3 },
      { texto: 'Perfeccionista', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 12,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Empreendedor', fator: 'D', ordem: 1 },
      { texto: 'Criativo', fator: 'I', ordem: 2 },
      { texto: 'Harmonioso', fator: 'S', ordem: 3 },
      { texto: 'Organizado', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 13,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Rápido', fator: 'D', ordem: 1 },
      { texto: 'Falante', fator: 'I', ordem: 2 },
      { texto: 'Tranquilo', fator: 'S', ordem: 3 },
      { texto: 'Disciplinado', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 14,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Desafiador', fator: 'D', ordem: 1 },
      { texto: 'Empolgante', fator: 'I', ordem: 2 },
      { texto: 'Prestativo', fator: 'S', ordem: 3 },
      { texto: 'Prudente', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 15,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Exigente', fator: 'D', ordem: 1 },
      { texto: 'Motivador', fator: 'I', ordem: 2 },
      { texto: 'Acolhedor', fator: 'S', ordem: 3 },
      { texto: 'Objetivo', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 16,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Prático', fator: 'D', ordem: 1 },
      { texto: 'Espontâneo', fator: 'I', ordem: 2 },
      { texto: 'Modesto', fator: 'S', ordem: 3 },
      { texto: 'Formal', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 17,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Firme', fator: 'D', ordem: 1 },
      { texto: 'Generoso', fator: 'I', ordem: 2 },
      { texto: 'Considerado', fator: 'S', ordem: 3 },
      { texto: 'Controlado', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 18,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Competente', fator: 'D', ordem: 1 },
      { texto: 'Amigável', fator: 'I', ordem: 2 },
      { texto: 'Gentil', fator: 'S', ordem: 3 },
      { texto: 'Racional', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 19,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Ambicioso', fator: 'D', ordem: 1 },
      { texto: 'Simpático', fator: 'I', ordem: 2 },
      { texto: 'Cooperativo', fator: 'S', ordem: 3 },
      { texto: 'Correto', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 20,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Impaciente', fator: 'D', ordem: 1 },
      { texto: 'Informal', fator: 'I', ordem: 2 },
      { texto: 'Sereno', fator: 'S', ordem: 3 },
      { texto: 'Sério', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 21,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Audacioso', fator: 'D', ordem: 1 },
      { texto: 'Aventureiro', fator: 'I', ordem: 2 },
      { texto: 'Pacífico', fator: 'S', ordem: 3 },
      { texto: 'Ponderado', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 22,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Forte', fator: 'D', ordem: 1 },
      { texto: 'Descontraído', fator: 'I', ordem: 2 },
      { texto: 'Confiável', fator: 'S', ordem: 3 },
      { texto: 'Conservador', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 23,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Líder', fator: 'D', ordem: 1 },
      { texto: 'Influente', fator: 'I', ordem: 2 },
      { texto: 'Dedicado', fator: 'S', ordem: 3 },
      { texto: 'Lógico', fator: 'C', ordem: 4 }
    ]
  },
  {
    numero: 24,
    instrucao: 'Escolha a palavra que MAIS descreve você e a que MENOS descreve você',
    opcoes: [
      { texto: 'Realizador', fator: 'D', ordem: 1 },
      { texto: 'Positivo', fator: 'I', ordem: 2 },
      { texto: 'Respeitoso', fator: 'S', ordem: 3 },
      { texto: 'Responsável', fator: 'C', ordem: 4 }
    ]
  }
];

async function seedDISC() {
  console.log('🎯 Iniciando seed do teste DISC...');

  try {
    // Limpar dados existentes
    console.log('🗑️  Limpando dados existentes...');
    await prisma.respostaDISC.deleteMany({});
    await prisma.opcaoDISC.deleteMany({});
    await prisma.questaoDISC.deleteMany({});

    // Criar questões e opções
    console.log('📝 Criando questões e opções...');
    for (const questaoData of questoesDISC) {
      const questao = await prisma.questaoDISC.create({
        data: {
          numero: questaoData.numero,
          instrucao: questaoData.instrucao,
          ordem: questaoData.numero,
          ativo: true
        }
      });

      for (const opcaoData of questaoData.opcoes) {
        await prisma.opcaoDISC.create({
          data: {
            questao_id: questao.id,
            texto: opcaoData.texto,
            fator: opcaoData.fator,
            ordem: opcaoData.ordem,
            ativo: true
          }
        });
      }

      console.log(`✅ Questão ${questaoData.numero} criada com 4 opções`);
    }

    console.log('\n🎉 Seed do DISC concluído com sucesso!');
    console.log(`📊 Total: ${questoesDISC.length} questões criadas`);
    console.log(`📋 Total: ${questoesDISC.length * 4} opções criadas`);
  } catch (error) {
    console.error('❌ Erro ao fazer seed do DISC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seedDISC()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
