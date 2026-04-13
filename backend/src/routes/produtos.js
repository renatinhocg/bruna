import express from 'express';
const router = express.Router();
import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

// ========== PRODUTOS ==========

// Listar todos os produtos (público)
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    
    const produtos = await prisma.produto.findMany({
      where: ativo !== undefined ? { ativo: ativo === 'true' } : {},
      orderBy: [
        { destaque: 'desc' },
        { ordem: 'asc' }
      ]
    });

    res.json(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Buscar produto por ID ou slug (público)
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = !isNaN(idOrSlug);

    const produto = await prisma.produto.findUnique({
      where: isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Criar produto (admin)
router.post('/', async (req, res) => {
  try {
    const {
      nome,
      slug,
      descricao,
      preco,
      preco_original,
      tipo_teste,
      icone,
      ativo,
      destaque,
      features,
      ordem
    } = req.body;

    // Validações básicas
    if (!nome || !slug || !descricao || !preco) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, slug, descricao, preco' });
    }

    // Verificar se slug já existe
    const existente = await prisma.produto.findUnique({
      where: { slug }
    });

    if (existente) {
      return res.status(400).json({ error: 'Já existe um produto com este slug' });
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        slug,
        descricao,
        preco: parseFloat(preco),
        preco_original: preco_original ? parseFloat(preco_original) : null,
        tipo_teste,
        icone,
        ativo: ativo !== undefined ? ativo : true,
        destaque: destaque !== undefined ? destaque : false,
        features: features || [],
        ordem: ordem !== undefined ? ordem : 0
      }
    });

    res.status(201).json(produto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar produto (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      slug,
      descricao,
      preco,
      preco_original,
      tipo_teste,
      icone,
      ativo,
      destaque,
      features,
      ordem
    } = req.body;

    // Verificar se produto existe
    const existente = await prisma.produto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Se mudou o slug, verificar se não existe outro com o mesmo slug
    if (slug && slug !== existente.slug) {
      const slugExistente = await prisma.produto.findUnique({
        where: { slug }
      });

      if (slugExistente) {
        return res.status(400).json({ error: 'Já existe um produto com este slug' });
      }
    }

    const produto = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(slug && { slug }),
        ...(descricao && { descricao }),
        ...(preco !== undefined && { preco: parseFloat(preco) }),
        ...(preco_original !== undefined && { preco_original: preco_original ? parseFloat(preco_original) : null }),
        ...(tipo_teste !== undefined && { tipo_teste }),
        ...(icone !== undefined && { icone }),
        ...(ativo !== undefined && { ativo }),
        ...(destaque !== undefined && { destaque }),
        ...(features !== undefined && { features }),
        ...(ordem !== undefined && { ordem })
      }
    });

    res.json(produto);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar produto (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se existem compras deste produto
    const compras = await prisma.compra.count({
      where: { produto_id: parseInt(id) }
    });

    if (compras > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar produto com compras registradas. Desative-o ao invés de deletar.' 
      });
    }

    await prisma.produto.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// ========== ESTATÍSTICAS ==========

// Dashboard de vendas (admin)
router.get('/stats/vendas', async (req, res) => {
  try {
    const { periodo } = req.query; // 'hoje', 'semana', 'mes', 'ano'
    
    let dataInicio = new Date();
    
    switch (periodo) {
      case 'hoje':
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case 'mes':
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        break;
      case 'ano':
        dataInicio.setFullYear(dataInicio.getFullYear() - 1);
        break;
      default:
        dataInicio = new Date(0); // Desde sempre
    }

    // Total de vendas
    const totalVendas = await prisma.compra.count({
      where: {
        status: 'pago',
        criado_em: { gte: dataInicio }
      }
    });

    // Receita total
    const vendas = await prisma.compra.findMany({
      where: {
        status: 'pago',
        criado_em: { gte: dataInicio }
      },
      select: { valor: true }
    });

    const receitaTotal = vendas.reduce((acc, v) => acc + parseFloat(v.valor), 0);

    // Vendas por produto
    const vendasPorProduto = await prisma.compra.groupBy({
      by: ['produto_id'],
      where: {
        status: 'pago',
        criado_em: { gte: dataInicio }
      },
      _count: { id: true },
      _sum: { valor: true }
    });

    // Buscar nomes dos produtos
    const produtosIds = vendasPorProduto.map(v => v.produto_id);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtosIds } },
      select: { id: true, nome: true, icone: true }
    });

    const vendasComNomes = vendasPorProduto.map(v => {
      const produto = produtos.find(p => p.id === v.produto_id);
      return {
        produto_id: v.produto_id,
        produto_nome: produto?.nome || 'Desconhecido',
        produto_icone: produto?.icone || '📦',
        quantidade: v._count.id,
        receita: parseFloat(v._sum.valor || 0)
      };
    });

    // Últimas compras
    const ultimasCompras = await prisma.compra.findMany({
      where: {
        status: 'pago',
        criado_em: { gte: dataInicio }
      },
      include: {
        produto: {
          select: { nome: true, icone: true }
        }
      },
      orderBy: { criado_em: 'desc' },
      take: 10
    });

    res.json({
      periodo,
      totalVendas,
      receitaTotal: receitaTotal.toFixed(2),
      vendasPorProduto: vendasComNomes.sort((a, b) => b.quantidade - a.quantidade),
      ultimasCompras: ultimasCompras.map(c => ({
        id: c.id,
        produto: c.produto.nome,
        icone: c.produto.icone,
        valor: parseFloat(c.valor).toFixed(2),
        data: c.criado_em,
        metodo_pagamento: c.metodo_pagamento
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
