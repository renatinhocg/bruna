import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /agendamentos - Listar agendamentos (com filtro opcional por usuário)
router.get('/', async (req, res) => {
  try {
    const { usuario_id, status } = req.query;
    console.log('=== LISTAR AGENDAMENTOS ===');
    console.log('Query params:', req.query);
    console.log('usuario_id recebido:', usuario_id);
    console.log('status recebido:', status);
    
    const where = {};
    if (usuario_id) where.usuario_id = parseInt(usuario_id);
    if (status) where.status = status;
    
    console.log('Where clause:', where);

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar_url: true
          }
        },
        sessoes: {
          select: {
            id: true,
            registro_sessao: true,
            tarefa_casa: true,
            observacoes: true,
            documentos: true
          }
        }
      },
      orderBy: { data_hora: 'asc' }
    });
    
    console.log('Agendamentos encontrados:', agendamentos.length);
    
    // Adicionar contagem de anexos para cada agendamento
    const agendamentosComAnexos = agendamentos.map(ag => {
      const totalAnexos = ag.sessoes?.reduce((total, sessao) => {
        // documentos é uma string JSON, precisamos fazer parse
        if (sessao.documentos) {
          try {
            const docs = JSON.parse(sessao.documentos);
            return total + (Array.isArray(docs) ? docs.length : 0);
          } catch (e) {
            return total;
          }
        }
        return total;
      }, 0) || 0;
      
      return {
        ...ag,
        num_anexos: totalAnexos
      };
    });
    
    console.log('Agendamentos com anexos processados:', agendamentosComAnexos.map(a => ({ id: a.id, num_anexos: a.num_anexos })));
    
    res.json(agendamentosComAnexos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

// GET /agendamentos/:id - Buscar agendamento específico
router.get('/:id', async (req, res) => {
  try {
    console.log('=== BUSCAR AGENDAMENTO POR ID ===');
    console.log('ID recebido:', req.params.id);
    
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            avatar_url: true
          }
        },
        sessoes: {
          orderBy: {
            criado_em: 'desc'
          }
        }
      }
    });
    
    console.log('Agendamento encontrado:', agendamento ? 'SIM' : 'NÃO');
    
    if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    
    // Buscar dados da sessão mais recente (se existir)
    let tarefaCasa = agendamento.proximos_passos;
    let observacoes = agendamento.observacoes_profissional;
    let anexosParsed = [];
    
    // Se existir sessão, pegar os dados dela
    if (agendamento.sessoes && agendamento.sessoes.length > 0) {
      const sessaoRecente = agendamento.sessoes[0]; // já vem ordenado por criado_em desc
      
      tarefaCasa = sessaoRecente.tarefa_casa || tarefaCasa;
      observacoes = sessaoRecente.observacoes || observacoes;
      
      // Parsear documentos da sessão
      if (sessaoRecente.documentos) {
        try {
          anexosParsed = JSON.parse(sessaoRecente.documentos);
        } catch (e) {
          console.error('Erro ao parsear documentos:', e);
        }
      }
    }
    
    // Se não houver sessão, tentar anexos do agendamento
    if (anexosParsed.length === 0 && agendamento.anexos) {
      try {
        anexosParsed = JSON.parse(agendamento.anexos);
      } catch (e) {
        console.error('Erro ao parsear anexos:', e);
      }
    }
    
    // Formatar anexos para incluir URL de download
    const anexosFormatados = anexosParsed.map((anexo, index) => {
      // Se já for um objeto com nome e url, retornar como está
      if (typeof anexo === 'object' && (anexo.nome || anexo.url)) {
        return {
          nome: anexo.nome || anexo.url?.split('/').pop() || `Documento ${index + 1}`,
          url: anexo.url || anexo.path,
          path: anexo.path || anexo.url
        };
      }
      
      // Se for apenas uma string (nome do arquivo)
      const nomeArquivo = typeof anexo === 'string' ? anexo : `documento-${index + 1}`;
      
      // Extrair apenas o nome do arquivo para exibição
      const nomeExibicao = nomeArquivo.split('/').pop();
      
      // Se já for uma URL completa, usar diretamente
      if (nomeArquivo.startsWith('http')) {
        return {
          nome: nomeExibicao,
          url: nomeArquivo,
          path: nomeArquivo
        };
      }
      
      // Construir URL do S3 usando a pasta uploads/
      const s3BaseUrl = 'https://sistema-carreira.s3.us-east-2.amazonaws.com';
      const url = `${s3BaseUrl}/uploads/${nomeArquivo}`;
      
      return {
        nome: nomeExibicao,
        url: url,
        path: url
      };
    });
    
    // Adicionar campos extras
    const agendamentoFormatado = {
      ...agendamento,
      anexos: anexosFormatados,
      num_anexos: anexosFormatados.length,
      tarefa_casa: tarefaCasa,
      observacoes: observacoes
    };
    
    console.log('Dados do agendamento formatado:', JSON.stringify(agendamentoFormatado, null, 2));
    
    res.json(agendamentoFormatado);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao buscar agendamento' });
  }
});

// POST /agendamentos - Criar novo agendamento
router.post('/', async (req, res) => {
  try {
    const { usuario_id, titulo, descricao, data_hora, duracao_minutos, tipo } = req.body;

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(usuario_id) }
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const agendamento = await prisma.agendamento.create({
      data: {
        usuario_id: parseInt(usuario_id),
        titulo,
        descricao,
        data_hora: new Date(data_hora),
        duracao_minutos: duracao_minutos || 60,
        tipo: tipo || 'sessao'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    res.status(201).json(agendamento);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
});

// PUT /agendamentos/:id - Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const { 
      titulo, 
      descricao, 
      data_hora, 
      duracao_minutos, 
      status, 
      tipo,
      // Campos de relatório
      resumo_sessao,
      objetivos_alcancados,
      proximos_passos,
      observacoes_profissional,
      avaliacao_progresso,
      pontos_positivos,
      pontos_atencao,
      recomendacoes,
      proxima_sessao_sugerida,
      anexos,
      visivel_cliente
    } = req.body;
    
    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (data_hora !== undefined) updateData.data_hora = new Date(data_hora);
    if (duracao_minutos !== undefined) updateData.duracao_minutos = duracao_minutos;
    if (status !== undefined) updateData.status = status;
    if (tipo !== undefined) updateData.tipo = tipo;
    
    // Campos de relatório
    if (resumo_sessao !== undefined) updateData.resumo_sessao = resumo_sessao;
    if (objetivos_alcancados !== undefined) updateData.objetivos_alcancados = objetivos_alcancados;
    if (proximos_passos !== undefined) updateData.proximos_passos = proximos_passos;
    if (observacoes_profissional !== undefined) updateData.observacoes_profissional = observacoes_profissional;
    if (avaliacao_progresso !== undefined) updateData.avaliacao_progresso = avaliacao_progresso;
    if (pontos_positivos !== undefined) updateData.pontos_positivos = pontos_positivos;
    if (pontos_atencao !== undefined) updateData.pontos_atencao = pontos_atencao;
    if (recomendacoes !== undefined) updateData.recomendacoes = recomendacoes;
    if (proxima_sessao_sugerida !== undefined) updateData.proxima_sessao_sugerida = proxima_sessao_sugerida ? new Date(proxima_sessao_sugerida) : null;
    if (anexos !== undefined) updateData.anexos = anexos;
    if (visivel_cliente !== undefined) updateData.visivel_cliente = visivel_cliente;

    console.log('📝 Atualizando agendamento:', req.params.id);
    console.log('📦 Dados recebidos:', updateData);

    const agendamento = await prisma.agendamento.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    
    console.log('✅ Agendamento atualizado com sucesso');
    res.json(agendamento);
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento' });
  }
});

// DELETE /agendamentos/:id - Excluir agendamento permanentemente
router.delete('/:id', async (req, res) => {
  try {
    await prisma.agendamento.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ mensagem: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ erro: 'Erro ao excluir agendamento' });
  }
});

// PATCH /agendamentos/:id/status - Atualizar apenas o status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agendamento = await prisma.agendamento.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

export default router;