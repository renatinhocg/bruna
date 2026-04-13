import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function seedTemplates() {
  console.log('🌱 Inserindo templates de projetos...');

  const templates = [
    {
      nome: 'Projeto Terapêutico Individual',
      descricao: 'Template para acompanhamento terapêutico de paciente individual',
      icone: '🧠',
      cor: '#722ed1',
      tipo: 'terapeutico',
      is_publico: true,
      tasks_template: JSON.stringify([
        { titulo: 'Avaliação Inicial', descricao: 'Primeira sessão de avaliação', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 1 },
        { titulo: 'Definir Objetivos', descricao: 'Estabelecer metas terapêuticas', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 2 },
        { titulo: 'Plano de Tratamento', descricao: 'Criar plano terapêutico personalizado', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 3 },
        { titulo: 'Sessões de Acompanhamento', descricao: 'Sessões regulares de terapia', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 4 },
        { titulo: 'Avaliação de Progresso', descricao: 'Revisar evolução e ajustar tratamento', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 5 },
      ]),
    },
    {
      nome: 'Orientação de Carreira',
      descricao: 'Processo completo de coaching de carreira',
      icone: '💼',
      cor: '#1890ff',
      tipo: 'carreira',
      is_publico: true,
      tasks_template: JSON.stringify([
        { titulo: 'Autoconhecimento', descricao: 'Aplicar testes e avaliar perfil', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 1 },
        { titulo: 'Análise de Mercado', descricao: 'Pesquisar oportunidades e tendências', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 2 },
        { titulo: 'Definir Objetivos Profissionais', descricao: 'Estabelecer metas de carreira', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 3 },
        { titulo: 'Plano de Ação', descricao: 'Criar estratégia para alcançar objetivos', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 4 },
        { titulo: 'Desenvolvimento de Currículo', descricao: 'Atualizar currículo e LinkedIn', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 5 },
        { titulo: 'Preparação para Entrevistas', descricao: 'Treinar habilidades de entrevista', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 6 },
      ]),
    },
    {
      nome: 'Avaliação Psicológica Completa',
      descricao: 'Processo de avaliação psicológica com aplicação de testes',
      icone: '📊',
      cor: '#52c41a',
      tipo: 'terapeutico',
      is_publico: true,
      tasks_template: JSON.stringify([
        { titulo: 'Entrevista Inicial', descricao: 'Anamnese e coleta de dados', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 1 },
        { titulo: 'Aplicar Testes', descricao: 'Aplicação de instrumentos psicológicos', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 2 },
        { titulo: 'Correção e Análise', descricao: 'Corrigir e interpretar resultados', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 3 },
        { titulo: 'Elaborar Laudo', descricao: 'Redigir relatório técnico', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 4 },
        { titulo: 'Devolutiva', descricao: 'Apresentar resultados ao paciente', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 5 },
      ]),
    },
    {
      nome: 'Programa de Desenvolvimento Pessoal',
      descricao: 'Projeto de autodesenvolvimento e crescimento pessoal',
      icone: '🎯',
      cor: '#faad14',
      tipo: 'pessoal',
      is_publico: true,
      tasks_template: JSON.stringify([
        { titulo: 'Definir Áreas de Melhoria', descricao: 'Identificar pontos a desenvolver', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 1 },
        { titulo: 'Estabelecer Metas SMART', descricao: 'Criar objetivos específicos e mensuráveis', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 2 },
        { titulo: 'Plano de Ação Semanal', descricao: 'Definir ações práticas semanais', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 3 },
        { titulo: 'Acompanhamento de Progresso', descricao: 'Revisar conquistas e ajustar plano', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 4 },
        { titulo: 'Celebrar Conquistas', descricao: 'Reconhecer e comemorar evolução', status: 'PLANEJADO', prioridade: 'BAIXA', ordem: 5 },
      ]),
    },
    {
      nome: 'Grupo Terapêutico',
      descricao: 'Organização e acompanhamento de terapia em grupo',
      icone: '👥',
      cor: '#eb2f96',
      tipo: 'terapeutico',
      is_publico: true,
      tasks_template: JSON.stringify([
        { titulo: 'Selecionar Participantes', descricao: 'Entrevistar e selecionar membros', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 1 },
        { titulo: 'Definir Tema e Objetivos', descricao: 'Estabelecer foco do grupo', status: 'PLANEJADO', prioridade: 'ALTA', ordem: 2 },
        { titulo: 'Planejar Sessões', descricao: 'Criar cronograma e conteúdo', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 3 },
        { titulo: 'Conduzir Encontros', descricao: 'Facilitar sessões grupais', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 4 },
        { titulo: 'Avaliar Resultados', descricao: 'Medir impacto e efetividade', status: 'PLANEJADO', prioridade: 'MEDIA', ordem: 5 },
      ]),
    },
  ];

  for (const template of templates) {
    const existe = await prisma.templateProjeto.findFirst({
      where: { nome: template.nome },
    });

    if (!existe) {
      await prisma.templateProjeto.create({ data: template });
      console.log(`✅ Template "${template.nome}" criado`);
    } else {
      console.log(`⏭️  Template "${template.nome}" já existe`);
    }
  }

  console.log('✨ Templates inseridos com sucesso!');
}

seedTemplates()
  .catch((e) => {
    console.error('Erro ao inserir templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
