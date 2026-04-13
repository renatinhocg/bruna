import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
// ...existing code...

const router = express.Router();
const prisma = new PrismaClient();
import { authenticateToken } from '../middleware/auth.js';

// ========== COMPRAS ==========

// Listar compras do usuário logado
router.get('/minhas', async (req, res) => {
  try {
    const usuario_id = req.user?.id; // Assumindo que o middleware de autenticação adiciona req.user

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const compras = await prisma.compra.findMany({
      where: { usuario_id },
      include: {
        produto: {
          select: {
            nome: true,
            icone: true,
            tipo_teste: true
          }
        },
        transacoes: {
          orderBy: { criado_em: 'desc' },
          take: 1
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    res.json(compras);
  } catch (error) {
    console.error('Erro ao listar compras:', error);
    res.status(500).json({ error: 'Erro ao listar compras' });
  }
});

// Listar todas as compras (admin)
router.get('/todas', async (req, res) => {
  try {
    const { status, produto_id, data_inicio, data_fim } = req.query;

    const where = {};
    
    if (status) where.status = status;
    if (produto_id) where.produto_id = parseInt(produto_id);
    if (data_inicio || data_fim) {
      where.criado_em = {};
      if (data_inicio) where.criado_em.gte = new Date(data_inicio);
      if (data_fim) where.criado_em.lte = new Date(data_fim);
    }

    const compras = await prisma.compra.findMany({
      where,
      include: {
        produto: {
          select: { nome: true, icone: true }
        },
        transacoes: {
          orderBy: { criado_em: 'desc' },
          take: 1
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    res.json(compras);
  } catch (error) {
    console.error('Erro ao listar todas as compras:', error);
    res.status(500).json({ error: 'Erro ao listar compras' });
  }
});

// Buscar compra específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user?.id;

    const compra = await prisma.compra.findUnique({
      where: { id: parseInt(id) },
      include: {
        produto: true,
        transacoes: {
          orderBy: { criado_em: 'desc' }
        }
      }
    });

    if (!compra) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }

    // Verificar se é o dono ou admin
    if (compra.usuario_id !== usuario_id && !req.user?.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(compra);
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    res.status(500).json({ error: 'Erro ao buscar compra' });
  }
});

// Criar nova compra (checkout)
router.post('/', async (req, res) => {
  try {
    const usuario_id = req.user?.id;
    const { produto_id, metodo_pagamento } = req.body;

    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!produto_id || !metodo_pagamento) {
      return res.status(400).json({ error: 'produto_id e metodo_pagamento são obrigatórios' });
    }

    // Buscar produto
    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(produto_id) }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (!produto.ativo) {
      return res.status(400).json({ error: 'Produto não disponível para compra' });
    }

    // Verificar se já comprou este produto
    const compraExistente = await prisma.compra.findFirst({
      where: {
        usuario_id,
        produto_id: produto.id,
        status: 'pago'
      }
    });

    if (compraExistente) {
      return res.status(400).json({ error: 'Você já possui este produto' });
    }

    // Criar compra
    const compra = await prisma.compra.create({
      data: {
        usuario_id,
        produto_id: produto.id,
        valor: produto.preco,
        status: 'pendente',
        metodo_pagamento
      },
      include: {
        produto: true
      }
    });

    // Aqui você integraria com o InfinityPay
    // Exemplo: gerar link de pagamento, QR code PIX, etc
    // const pagamento = await infinitypay.createTransaction({ ... })

    // Por enquanto, retornar a compra criada
    res.status(201).json({
      compra,
      // payment_url: pagamento.payment_url,
      // qr_code: pagamento.qr_code,
      message: 'Compra criada. Integração com InfinityPay será implementada.'
    });
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    res.status(500).json({ error: 'Erro ao criar compra' });
  }
});

// Checkout autenticado (usuário logado)
router.post('/checkout-autenticado', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Usuário autenticado:', req.user);
    console.log('📦 Body da requisição:', req.body);

    const usuario_id = req.user?.id;
    const { produtos, total, metodo_pagamento, dados_pagamento } = req.body;

    if (!usuario_id) {
      console.log('❌ Usuário não autenticado');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!produtos || !produtos.length) {
      console.log('❌ Carrinho vazio');
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    if (!metodo_pagamento) {
      console.log('❌ Método de pagamento não informado');
      return res.status(400).json({ error: 'Método de pagamento é obrigatório' });
    }

    // Buscar dados do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar produtos
    const produtosDb = await prisma.produto.findMany({
      where: {
        id: { in: produtos }
      }
    });

    if (produtosDb.length !== produtos.length) {
      return res.status(404).json({ error: 'Um ou mais produtos não encontrados' });
    }

    // Verificar se todos estão ativos
    const inativos = produtosDb.filter(p => !p.ativo);
    if (inativos.length > 0) {
      return res.status(400).json({ error: 'Um ou mais produtos não estão disponíveis' });
    }

    // Verificar se já comprou algum produto
    const comprasExistentes = await prisma.compra.findMany({
      where: {
        usuario_id,
        produto_id: { in: produtos },
        status: 'pago'
      }
    });

    if (comprasExistentes.length > 0) {
      const nomesComprados = comprasExistentes.map(c => {
        const prod = produtosDb.find(p => p.id === c.produto_id);
        return prod?.nome;
      }).filter(Boolean);
      return res.status(400).json({ 
        error: `Você já possui: ${nomesComprados.join(', ')}`
      });
    }

    // Calcular total
    const totalCalculado = produtosDb.reduce((sum, p) => sum + parseFloat(p.preco), 0);
    
    if (Math.abs(totalCalculado - total) > 0.01) {
      return res.status(400).json({ error: 'Valor total incorreto' });
    }

    // Gerar ID único do pedido
    const pedido_id = `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('🆔 Pedido ID gerado:', pedido_id);

    // Importar serviço InfinityPay
    const infinityPayService = (await import('../services/infinitypay.js')).default;

    // Gerar link de pagamento do InfinityPay
    console.log('🔗 Gerando link de pagamento...');
    const paymentLink = infinityPayService.createPaymentLink({
      pedido_id,
      total: totalCalculado,
      produtos: produtosDb,
      cliente_nome: usuario.nome,
      cliente_email: usuario.email
    });
    console.log('✅ Link gerado:', paymentLink.payment_url);

    const response = {
      pedido_id,
      status: 'pending',
      payment_url: paymentLink.payment_url,
      total: totalCalculado.toFixed(2),
      metodo_pagamento,
      produtos: produtosDb.map(p => ({
        id: p.id,
        nome: p.nome,
        preco: parseFloat(p.preco).toFixed(2)
      })),
      message: 'Redirecione para o link de pagamento'
    };

    // Criar registros de compra no banco
    console.log('💾 Salvando compras no banco...');
    for (const produto of produtosDb) {
      await prisma.compra.create({
        data: {
          usuario_id,
          produto_id: produto.id,
          valor: produto.preco,
          status: 'pendente',
          metodo_pagamento,
          transaction_id: pedido_id,
          payment_url: paymentLink.payment_url,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        }
      });
    }
    console.log('✅ Compras salvas com sucesso!');

    console.log('📤 Enviando resposta:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Erro no checkout autenticado:', error);
    res.status(500).json({ error: 'Erro ao processar checkout' });
  }
});

// Checkout público (sem autenticação - para landing page)
router.post('/checkout', async (req, res) => {
  try {
    const { produtos, total, metodo_pagamento, cliente } = req.body;

    if (!produtos || !produtos.length) {
      return res.status(400).json({ error: 'Produtos são obrigatórios' });
    }

    if (!metodo_pagamento) {
      return res.status(400).json({ error: 'Método de pagamento é obrigatório' });
    }

    if (!cliente || !cliente.nome || !cliente.email || !cliente.cpf) {
      return res.status(400).json({ error: 'Dados do cliente incompletos' });
    }

    // Buscar produtos
    const produtosDb = await prisma.produto.findMany({
      where: {
        id: { in: produtos }
      }
    });

    if (produtosDb.length !== produtos.length) {
      return res.status(404).json({ error: 'Um ou mais produtos não encontrados' });
    }

    // Verificar se todos estão ativos
    const inativos = produtosDb.filter(p => !p.ativo);
    if (inativos.length > 0) {
      return res.status(400).json({ error: 'Um ou mais produtos não estão disponíveis' });
    }

    // Calcular total
    const totalCalculado = produtosDb.reduce((sum, p) => sum + parseFloat(p.preco), 0);
    
    if (Math.abs(totalCalculado - total) > 0.01) {
      return res.status(400).json({ error: 'Valor total incorreto' });
    }

    // Gerar ID único do pedido
    const pedido_id = `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // AQUI SERIA A INTEGRAÇÃO COM INFINITYPAY
    // const infinityPayResponse = await fetch('https://api.infinitepay.io/v1/transactions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.INFINITYPAY_SECRET_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     amount: Math.round(total * 100), // em centavos
    //     payment_method: metodo_pagamento,
    //     customer: {
    //       name: cliente.nome,
    //       email: cliente.email,
    //       document: cliente.cpf.replace(/\D/g, ''),
    //       phone: cliente.telefone?.replace(/\D/g, '')
    //     },
    //     metadata: {
    //       pedido_id,
    //       produtos: produtosDb.map(p => p.nome).join(', ')
    //     }
    //   })
    // });
    //
    // const infinityPayData = await infinityPayResponse.json();

    // MOCK DE RESPOSTA (substituir pela integração real)
    const mockResponse = {
      pedido_id,
      status: 'pending',
      total: totalCalculado.toFixed(2),
      metodo_pagamento,
      cliente,
      produtos: produtosDb.map(p => ({
        id: p.id,
        nome: p.nome,
        preco: parseFloat(p.preco).toFixed(2)
      }))
    };

    // Se for PIX, adicionar QR code mockado
    if (metodo_pagamento === 'pix') {
      mockResponse.qr_code = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
      mockResponse.pix_code = '00020126580014BR.GOV.BCB.PIX0136' + pedido_id;
    }

    // Se for boleto, adicionar URL mockada
    if (metodo_pagamento === 'boleto') {
      mockResponse.boleto_url = `https://example.com/boleto/${pedido_id}`;
    }

    res.status(201).json(mockResponse);
  } catch (error) {
    console.error('Erro no checkout:', error);
    res.status(500).json({ error: 'Erro ao processar checkout' });
  }
});

// Atualizar status da compra (admin ou webhook)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transaction_id, paid_at } = req.body;

    if (!['pendente', 'pago', 'cancelado', 'expirado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const compra = await prisma.compra.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(transaction_id && { transaction_id }),
        ...(paid_at && { paid_at: new Date(paid_at) })
      }
    });

    // Se foi pago, liberar acesso ao teste
    if (status === 'pago') {
      const produto = await prisma.produto.findUnique({
        where: { id: compra.produto_id }
      });

      if (produto?.tipo_teste) {
        // Verificar se já tem permissão
        const permissaoExistente = await prisma.permissaoTeste.findFirst({
          where: {
            usuario_id: compra.usuario_id,
            tipo_teste: produto.tipo_teste
          }
        });

        if (permissaoExistente) {
          // Atualizar permissão existente
          await prisma.permissaoTeste.update({
            where: { id: permissaoExistente.id },
            data: { liberado: true }
          });
        } else {
          // Criar nova permissão
          await prisma.permissaoTeste.create({
            data: {
              usuario_id: compra.usuario_id,
              tipo_teste: produto.tipo_teste,
              liberado: true
            }
          });
        }
      }
    }

    res.json(compra);
  } catch (error) {
    console.error('Erro ao atualizar status da compra:', error);
    res.status(500).json({ error: 'Erro ao atualizar compra' });
  }
});

// Webhook do InfinityPay
router.post('/webhook/infinitypay', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('🔔 Webhook InfinityPay recebido:', event, data);
    // Log extra para depuração
    try {
      require('fs').appendFileSync('webhook-debug.log', `\n[${new Date().toISOString()}] EVENT: ${event}\nBODY: ${JSON.stringify(req.body, null, 2)}\n`);
    } catch (e) { console.error('Erro ao gravar log do webhook:', e); }

    // Validar assinatura do webhook (implementar quando tiver as credenciais)
    // const signature = req.headers['x-infinitypay-signature'];
    // const isValid = validateSignature(req.body, signature);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Assinatura inválida' });
    // }

    switch (event) {
      case 'transaction.paid':
      case 'payment.approved':
        // Pagamento aprovado
        console.log('✅ Pagamento aprovado:', data);
        
        // Buscar compra pelo pedido_id ou transaction_id
        const pedido_id = data.metadata?.pedido_id || data.reference_id;
        
        if (pedido_id) {
          console.log('🔎 Tentando atualizar compra com pedido_id:', pedido_id);
          try {
            const updated = await prisma.compra.update({
              where: { pedido_id },
              data: {
                status: 'pago',
                transaction_id: data.id,
                paid_at: new Date()
              }
            });
            console.log('✅ Compra atualizada pelo webhook:', updated);
          } catch (err) {
            console.error('❌ Erro ao atualizar compra pelo webhook:', err);
          }
        } else {
          console.warn('⚠️ Webhook recebido sem pedido_id válido:', data);
        }
        break;

      case 'transaction.failed':
      case 'payment.refused':
        // Pagamento recusado
        console.log('❌ Pagamento recusado:', data);
        // Atualizar status para 'cancelado'
        break;

      case 'transaction.expired':
        // Pagamento expirado (boleto ou PIX não pago)
        console.log('⏰ Pagamento expirado:', data);
        // Atualizar status para 'expirado'
        break;

      default:
        console.log('ℹ️ Evento não tratado:', event);
    }

    // Sempre retornar 200 OK para o webhook
    res.json({ received: true, event });
  } catch (error) {
    console.error('❌ Erro no webhook InfinityPay:', error);
    // Ainda assim retornar 200 para não ficar reenviando
    res.status(200).json({ error: 'Erro ao processar webhook', received: true });
  }
});

// Atualizar status da compra (admin)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const { id } = req.params;
    const { status } = req.body;
    if (!['pendente', 'pago', 'cancelado', 'expirado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    const compra = await prisma.compra.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(compra);
  } catch (error) {
    console.error('Erro ao atualizar status da compra:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Deletar compra (admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const { id } = req.params;
    await prisma.compra.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar compra:', error);
    res.status(500).json({ error: 'Erro ao deletar compra' });
  }
});

export default router;
