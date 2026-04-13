import { PrismaClient } from './src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function atualizarAgendamento() {
  try {
    const agendamento = await prisma.agendamento.update({
      where: { id: 3 },
      data: {
        descricao: 'Sessão focada em planejamento de carreira e definição de objetivos profissionais',
        proximos_passos: `• Pesquisar sobre as 3 áreas de interesse identificadas
• Atualizar currículo com as novas competências
• Fazer o exercício de auto-avaliação enviado
• Lista com 5 empresas dos seus sonhos`,
        observacoes_profissional: 'Cliente demonstrou boa clareza sobre seus objetivos. Recomendado continuar com exercícios de autoconhecimento.',
        anexos: JSON.stringify([
          {
            nome: 'Exercício de Autoconhecimento.pdf',
            url: '/uploads/exercicio-autoconhecimento.pdf',
            tamanho: '245 KB',
            tipo: 'application/pdf'
          },
          {
            nome: 'Guia de Planejamento de Carreira.pdf',
            url: '/uploads/guia-carreira.pdf',
            tamanho: '1.2 MB',
            tipo: 'application/pdf'
          }
        ])
      }
    });

    console.log('✅ Agendamento atualizado com sucesso!');
    console.log(JSON.stringify(agendamento, null, 2));
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarAgendamento();
